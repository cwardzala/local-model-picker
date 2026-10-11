import { pickQuant, type Evaluation } from './estimate'
import type { Hardware, HfModel } from './types'
import type { TaskProfile } from './tasks'

export interface RankedModel {
  model: HfModel
  evaluation: Evaluation
  /** 0–100 suitability for the selected task on this hardware. */
  score: number
  /** The inputs behind the score, each 0–1, plus how the task weights speed. */
  factors: { capability: number; speed: number; speedWeight: number }
  reasons: string[]
  warnings: string[]
}

const TRUSTED =
  /^(unsloth|bartowski|lmstudio-community|ggml-org|Qwen|meta-llama|google|mistralai|microsoft|ibm-granite|deepseek-ai|HuggingFaceTB|LiquidAI|nvidia)$/i

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export function rankModel(model: HfModel, hw: Hardware, task: TaskProfile): RankedModel {
  const evaluation = pickQuant(model, hw, task.contextTokens, task.minBpw)
  const reasons: string[] = []
  const warnings: string[] = []

  if (evaluation.fit === 'no') {
    const factors = { capability: 0, speed: 0, speedWeight: task.speedWeight }
    return { model, evaluation, score: 0, factors, reasons, warnings: ['Does not fit in memory'] }
  }

  // Capability: log-scaled size, saturating at the task's sweet spot.
  const capability = clamp01(Math.log(model.activeParamsB + 1) / Math.log(task.sweetSpotB + 1))
  // Speed: 30 tok/s feels instant for most tasks.
  const speed = clamp01(evaluation.tokensPerSec / 30)
  let score = 100 * ((1 - task.speedWeight) * capability + task.speedWeight * speed)

  if (model.paramsB < task.minParamsB) {
    score *= 0.5
    warnings.push(`Small for ${task.label.toLowerCase()} (<${task.minParamsB}B)`)
  }
  if (evaluation.quant.bpw < task.minBpw) {
    score *= 0.7
    warnings.push(`${evaluation.quant.name} is lossy for this task`)
  }
  if (evaluation.contextTokens < task.contextTokens) {
    score *= 0.8
    warnings.push(
      `Context limited to ${Math.round(evaluation.contextTokens / 1024)}k (wanted ${Math.round(task.contextTokens / 1024)}k)`,
    )
  }
  const haystack = `${model.id} ${model.tags.join(' ')}`
  if (task.affinity?.test(haystack)) {
    score *= 1.25
    reasons.push('Built for this kind of work')
  }
  if (task.penalty?.test(haystack)) {
    score *= 0.6
    warnings.push('Tuned for something else')
  }
  if (evaluation.fit === 'slow') {
    warnings.push('Slow on this machine')
  }
  // Popularity prior (10k–3M downloads) and a nudge for well-known publishers,
  // so one-off fine-tunes don't crowd out mainstream releases.
  score *= 0.7 + 0.3 * clamp01((Math.log10(model.downloads + 1) - 4) / 2.5)
  if (TRUSTED.test(model.id.split('/')[0])) score *= 1.1

  const factors = { capability, speed, speedWeight: task.speedWeight }
  return { model, evaluation, score: Math.min(100, score), factors, reasons, warnings }
}

export type SortKey = 'best' | 'fastest' | 'popular'

export function sortRanked(list: RankedModel[], key: SortKey): RankedModel[] {
  const out = [...list]
  const usable = (r: RankedModel) => (r.evaluation.fit === 'no' ? 0 : 1)
  out.sort((a, b) => {
    if (usable(a) !== usable(b)) return usable(b) - usable(a)
    if (key === 'fastest') return b.evaluation.tokensPerSec - a.evaluation.tokensPerSec
    if (key === 'popular') return b.model.downloads - a.model.downloads
    return b.score - a.score
  })
  return out
}
