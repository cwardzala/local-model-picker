export interface HfModel {
  id: string
  downloads: number
  likes: number
  /** Total parameters, in billions (from GGUF metadata). */
  paramsB: number
  /** Parameters active per token, in billions (differs from paramsB for MoE). */
  activeParamsB: number
  contextLength: number
  pipeline: string
  tags: string[]
  lastModified: string
  architecture?: string
}

export interface Hardware {
  platform: 'mac' | 'pc'
  /** System RAM (unified memory on Apple Silicon), GB. */
  ramGB: number
  /** Dedicated GPU memory, GB. 0 on Macs and CPU-only PCs. */
  vramGB: number
  /** Memory bandwidth of the GPU (or unified memory), GB/s. */
  gpuBandwidth: number
  /** System RAM bandwidth, GB/s. */
  ramBandwidth: number
  /** Free disk space, GB. */
  storageGB: number
}

export type Fit = 'great' | 'good' | 'slow' | 'no'
