import type { Hardware } from './types'
import { APPLE_CHIPS, GPUS } from './presets'

export interface Detection {
  platform: 'mac' | 'pc'
  chip?: string
  gpu?: string
  cores: number
  /** Browser's rough RAM report; capped and bucketed, so only a hint. */
  memoryHintGB?: number
}

/** Best-effort sniffing; browsers hide RAM, so callers must still ask for it. */
export function detectSystem(): Detection {
  const ua = navigator.userAgent
  const platform = /Mac/i.test(ua) && !/iPhone|iPad/i.test(ua) ? 'mac' : 'pc'
  let renderer = ''
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    renderer = ext ? String(gl!.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
  } catch {
    /* WebGL unavailable */
  }
  const chip = APPLE_CHIPS.map((c) => c.name)
    .sort((a, b) => b.length - a.length)
    .find((n) => renderer.includes(`Apple ${n}`))
  const gpu = GPUS.find((g) => {
    const model = /(RTX|RX) ?\d{4}( Ti| XT| XTX| Super)*/i.exec(g.name)?.[0]
    return model && renderer.toLowerCase().includes(model.toLowerCase())
  })?.name
  const memoryHintGB = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  return { platform, chip, gpu, cores: navigator.hardwareConcurrency || 0, memoryHintGB }
}

export const DEFAULT_HARDWARE: Hardware = {
  platform: 'mac',
  ramGB: 16,
  vramGB: 0,
  gpuBandwidth: 120,
  ramBandwidth: 80,
  storageGB: 256,
}

/** Closest option at or above the hint; the largest option if none is big enough. */
export function nearestMemory(options: number[], hint?: number): number {
  if (!hint) return options[0]
  return options.find((m) => m >= hint) ?? options[options.length - 1]
}
