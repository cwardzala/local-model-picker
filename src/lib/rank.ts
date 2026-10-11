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

/**
 * Dense-equivalent size for judging quality. A mixture-of-experts model is
 * only as fast as its active parameters but as capable as something between
 * active and total; the geometric mean is a common rule of thumb.
 */
export const effectiveParamsB = (m: HfModel) => Math.sqrt(m.activeParamsB * m.paramsB)

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
  const effectiveB = effectiveParamsB(model)
  const capability = clamp01(Math.log(effectiveB + 1) / Math.log(task.sweetSpotB + 1))
  // Speed: 30 tok/s feels instant for most tasks.
  const speed = clamp01(evaluation.tokensPerSec / 30)
  let score = 100 * ((1 - task.speedWeight) * capability + task.speedWeight * speed)

  if (effectiveB < task.minParamsB) {
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

export interface RankedGroup {
  /** Best-ranked member; the one shown as the card. */
  lead: RankedModel
  /** Other repos with the same architecture and size, in ranked order. */
  similar: RankedModel[]
}

/**
 * Fine-tunes and re-quantisations of one model rarely share a base_model tag,
 * but they share an architecture and parameter count. Size is bucketed on a
 * log scale (~25% wide) so 34.7B and 35.5B repos land together.
 */
export function variantKey(m: HfModel): string {
  const bucket = Math.round(Math.log2(Math.max(m.paramsB, 0.1)) * 3)
  const moe = m.activeParamsB < m.paramsB ? `a${Math.round(m.activeParamsB)}` : 'dense'
  return `${m.architecture ?? m.id}|${bucket}|${moe}`
}

/** Collapses an already-sorted list; each group sits where its best member was. */
export function groupRanked(sorted: RankedModel[], enabled = true): RankedGroup[] {
  if (!enabled) return sorted.map((lead) => ({ lead, similar: [] }))
  const groups = new Map<string, RankedGroup>()
  for (const r of sorted) {
    const key = variantKey(r.model)
    const g = groups.get(key)
    if (g) g.similar.push(r)
    else groups.set(key, { lead: r, similar: [] })
  }
  return [...groups.values()]
}
