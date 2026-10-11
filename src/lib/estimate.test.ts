import { describe, expect, it } from 'vitest'
import { activeParamsFromId, evaluate, pickQuant } from './estimate'
import { QUANTS } from './quants'
import { effectiveParamsB, groupRanked, rankModel, variantKey } from './rank'
import { taskById } from './tasks'
import type { Hardware, HfModel } from './types'

const model = (paramsB: number, over: Partial<HfModel> = {}): HfModel => ({
  id: `org/model-${paramsB}b`, downloads: 100_000, likes: 10, paramsB, activeParamsB: paramsB,
  contextLength: 32768, pipeline: 'text-generation', tags: [], lastModified: '', ...over,
})
const mac = (ramGB: number, bw: number): Hardware =>
  ({ platform: 'mac', ramGB, vramGB: 0, gpuBandwidth: bw, ramBandwidth: bw, storageGB: 500 })
const q4 = QUANTS.find((q) => q.name === 'Q4_K_M')!

describe('evaluate', () => {
  it('fits an 8B Q4 on a 16GB Mac and runs it quickly', () => {
    const ev = evaluate(model(8), mac(16, 120), q4, 8192)
    expect(ev.fit).not.toBe('no')
    expect(ev.requiredGB).toBeGreaterThan(5)
    expect(ev.requiredGB).toBeLessThan(8)
    expect(ev.tokensPerSec).toBeGreaterThan(8)
  })
  it('rejects a 70B on a 16GB Mac', () => {
    expect(evaluate(model(70), mac(16, 120), q4, 8192).fit).toBe('no')
  })
  it('spills to system RAM on a small GPU and slows down', () => {
    const pc: Hardware = { platform: 'pc', ramGB: 32, vramGB: 8, gpuBandwidth: 448, ramBandwidth: 45, storageGB: 500 }
    const ev = evaluate(model(14), pc, q4, 8192)
    expect(ev.gpuShare).toBeLessThan(1)
    expect(ev.fit).not.toBe('no')
  })
})

describe('pickQuant', () => {
  it('uses a smaller quant when the big one will not fit', () => {
    const ev = pickQuant(model(32), mac(24, 200), 8192)
    expect(ev.quant.bpw).toBeLessThan(6)
  })
  it('never goes below the task floor when it can avoid it', () => {
    const ev = pickQuant(model(8), mac(32, 200), 8192, 4.8)
    expect(ev.quant.bpw).toBeGreaterThanOrEqual(4.8)
  })
})

describe('activeParamsFromId', () => {
  it('reads MoE active parameters from the name', () => {
    expect(activeParamsFromId('x/Qwen3-Coder-30B-A3B-GGUF', 30.5)).toBe(3)
    expect(activeParamsFromId('x/Llama-3.1-8B', 8)).toBe(8)
  })
})

describe('rankModel', () => {
  const hw = mac(32, 200)
  it('prefers a coder model for coding', () => {
    const coder = rankModel(model(14, { id: 'a/Qwen-Coder-14B' }), hw, taskById('coding'))
    const plain = rankModel(model(14, { id: 'a/Qwen-14B' }), hw, taskById('coding'))
    expect(coder.score).toBeGreaterThan(plain.score)
  })
  it('flags a 1.5B model as too small for data work and notes', () => {
    const tiny = model(1.5)
    expect(rankModel(tiny, hw, taskById('data')).warnings.length).toBeGreaterThan(0)
    expect(rankModel(tiny, hw, taskById('notes')).warnings.some((w) => /Small/.test(w))).toBe(true)
  })
})

describe('mixture-of-experts ranking', () => {
  const hw = mac(64, 400)
  const task = taskById('chat')
  const moe = model(30, { id: 'a/Big-30B-A3B', activeParamsB: 3 })

  it('treats an MoE as bigger than its active size but smaller than its total', () => {
    expect(effectiveParamsB(moe)).toBeGreaterThan(3)
    expect(effectiveParamsB(moe)).toBeLessThan(30)
    expect(effectiveParamsB(model(8))).toBe(8)
  })
  it('scores capability between a dense model of its active and of its total size', () => {
    const small = rankModel(model(3), hw, task).factors.capability
    const big = rankModel(model(30), hw, task).factors.capability
    const mid = rankModel(moe, hw, task).factors.capability
    expect(mid).toBeGreaterThan(small)
    expect(mid).toBeLessThan(big)
  })
  it('still runs faster than a dense model of the same total size', () => {
    const dense = rankModel(model(30), hw, task).evaluation.tokensPerSec
    expect(rankModel(moe, hw, task).evaluation.tokensPerSec).toBeGreaterThan(dense)
  })
})

describe('groupRanked', () => {
  const hw = mac(64, 400)
  const task = taskById('chat')
  const ranked = (id: string, paramsB: number, over: Partial<HfModel> = {}) =>
    rankModel(model(paramsB, { id, architecture: 'llama', ...over }), hw, task)

  it('puts re-quantisations and fine-tunes of the same size together', () => {
    expect(variantKey(model(34.7, { architecture: 'qwen35moe' }))).toBe(
      variantKey(model(35.5, { architecture: 'qwen35moe' })),
    )
  })
  it('keeps different sizes and architectures apart', () => {
    expect(variantKey(model(8, { architecture: 'llama' }))).not.toBe(variantKey(model(14, { architecture: 'llama' })))
    expect(variantKey(model(8, { architecture: 'llama' }))).not.toBe(variantKey(model(8, { architecture: 'gemma' })))
    expect(variantKey(model(30, { architecture: 'q', activeParamsB: 3 }))).not.toBe(variantKey(model(30, { architecture: 'q' })))
  })
  it('keeps the first (best) member as lead, in its original position', () => {
    const list = [ranked('a/best-8b', 8), ranked('a/other-14b', 14), ranked('b/fine-tune-8b', 8)]
    const groups = groupRanked(list)
    expect(groups.map((g) => g.lead.model.id)).toEqual(['a/best-8b', 'a/other-14b'])
    expect(groups[0].similar.map((r) => r.model.id)).toEqual(['b/fine-tune-8b'])
  })
  it('leaves the list alone when disabled', () => {
    const list = [ranked('a/x-8b', 8), ranked('b/y-8b', 8)]
    expect(groupRanked(list, false)).toHaveLength(2)
  })
})
