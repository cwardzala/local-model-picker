import type { Fit, Hardware, HfModel } from './types'
import { QUANTS, type Quant } from './quants'

const OVERHEAD_GB = 0.8
/** Fraction of theoretical bandwidth real inference achieves. */
const BANDWIDTH_EFFICIENCY = 0.6

export interface Evaluation {
  quant: Quant
  fit: Fit
  /** Weights + KV cache + runtime overhead, GB. */
  requiredGB: number
  /** Weights file size, GB (what you download). */
  downloadGB: number
  tokensPerSec: number
  /** Share of the model that sits in fast memory, 0–1. */
  gpuShare: number
  contextTokens: number
}

export const weightsGB = (paramsB: number, bpw: number) => (paramsB * bpw) / 8

/** Rough KV-cache size; calibrated on Llama-style GQA models (8B ≈ 1 GB at 8k). */
export const kvCacheGB = (paramsB: number, contextTokens: number) =>
  0.35 * Math.sqrt(paramsB) * (contextTokens / 8192)

export interface Budget {
  /** Memory the accelerator can use, GB. */
  fast: number
  /** Everything the model could spill into, GB. */
  total: number
  fastBandwidth: number
  slowBandwidth: number
}

export function memoryBudget(hw: Hardware): Budget {
  if (hw.platform === 'mac') {
    // macOS caps GPU-wired memory at roughly 2/3 (small) to 3/4 (large) of RAM.
    const usable = hw.ramGB * (hw.ramGB <= 36 ? 0.66 : 0.75)
    return { fast: usable, total: usable, fastBandwidth: hw.gpuBandwidth, slowBandwidth: hw.gpuBandwidth }
  }
  if (hw.vramGB > 0) {
    const fast = Math.max(0, hw.vramGB - 0.6)
    return {
      fast,
      total: fast + hw.ramGB * 0.7,
      fastBandwidth: hw.gpuBandwidth,
      slowBandwidth: hw.ramBandwidth,
    }
  }
  return { fast: 0, total: hw.ramGB * 0.8, fastBandwidth: hw.ramBandwidth, slowBandwidth: hw.ramBandwidth }
}

export function evaluate(
  model: HfModel,
  hw: Hardware,
  quant: Quant,
  wantedContext: number,
): Evaluation {
  const contextTokens = Math.min(wantedContext, model.contextLength || wantedContext)
  const weights = weightsGB(model.paramsB, quant.bpw)
  const requiredGB = weights + kvCacheGB(model.paramsB, contextTokens) + OVERHEAD_GB
  const activeGB = weightsGB(model.activeParamsB, quant.bpw)
  const budget = memoryBudget(hw)

  const base = { quant, requiredGB, downloadGB: weights, contextTokens }
  if (requiredGB > budget.total) {
    return { ...base, fit: 'no', tokensPerSec: 0, gpuShare: 0 }
  }
  const gpuShare = budget.fast > 0 ? Math.min(1, budget.fast / requiredGB) : 0
  const secPerToken =
    activeGB * (gpuShare / budget.fastBandwidth + (1 - gpuShare) / budget.slowBandwidth)
  const tokensPerSec = BANDWIDTH_EFFICIENCY / secPerToken
  const fit: Fit =
    gpuShare === 1 && tokensPerSec >= 20 ? 'great' : tokensPerSec >= 8 ? 'good' : 'slow'
  return { ...base, fit, tokensPerSec, gpuShare }
}

/** Best quant that runs well, falling back to the smallest one that fits at all. */
export function pickQuant(
  model: HfModel,
  hw: Hardware,
  contextTokens: number,
  minBpw = 0,
): Evaluation {
  const candidates = QUANTS.filter((q) => q.bpw >= minBpw)
  const pool = candidates.length ? candidates : QUANTS
  const evals = pool.map((q) => evaluate(model, hw, q, contextTokens))
  return (
    evals.find((e) => e.fit === 'great' || e.fit === 'good') ??
    evals.find((e) => e.fit !== 'no') ??
    evals[evals.length - 1]
  )
}

/** Parses "35B-A3B"-style names to find active parameters of MoE models. */
export function activeParamsFromId(id: string, totalB: number): number {
  const m = /(\d+(?:\.\d+)?)b[-_ ]?a(\d+(?:\.\d+)?)b/i.exec(id)
  if (m) return Math.min(totalB, parseFloat(m[2]))
  return totalB
}
