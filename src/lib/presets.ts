export interface ChipPreset {
  name: string
  bandwidth: number
  memory: number[]
}
export interface GpuPreset {
  name: string
  vramGB: number
  bandwidth: number
}

export const APPLE_CHIPS: ChipPreset[] = [
  { name: 'M1', bandwidth: 68, memory: [8, 16] },
  { name: 'M1 Pro', bandwidth: 200, memory: [16, 32] },
  { name: 'M1 Max', bandwidth: 400, memory: [32, 64] },
  { name: 'M1 Ultra', bandwidth: 800, memory: [64, 128] },
  { name: 'M2', bandwidth: 100, memory: [8, 16, 24] },
  { name: 'M2 Pro', bandwidth: 200, memory: [16, 32] },
  { name: 'M2 Max', bandwidth: 400, memory: [32, 64, 96] },
  { name: 'M2 Ultra', bandwidth: 800, memory: [64, 128, 192] },
  { name: 'M3', bandwidth: 100, memory: [8, 16, 24] },
  { name: 'M3 Pro', bandwidth: 150, memory: [18, 36] },
  { name: 'M3 Max', bandwidth: 400, memory: [36, 48, 64, 96, 128] },
  { name: 'M3 Ultra', bandwidth: 819, memory: [96, 256, 512] },
  { name: 'M4', bandwidth: 120, memory: [16, 24, 32] },
  { name: 'M4 Pro', bandwidth: 273, memory: [24, 48, 64] },
  { name: 'M4 Max', bandwidth: 546, memory: [36, 48, 64, 128] },
]

export const GPUS: GpuPreset[] = [
  { name: 'No dedicated GPU (CPU only)', vramGB: 0, bandwidth: 0 },
  { name: 'GeForce RTX 3060 12GB', vramGB: 12, bandwidth: 360 },
  { name: 'GeForce RTX 3070 8GB', vramGB: 8, bandwidth: 448 },
  { name: 'GeForce RTX 3080 10GB', vramGB: 10, bandwidth: 760 },
  { name: 'GeForce RTX 3090 24GB', vramGB: 24, bandwidth: 936 },
  { name: 'GeForce RTX 4060 8GB', vramGB: 8, bandwidth: 272 },
  { name: 'GeForce RTX 4060 Ti 16GB', vramGB: 16, bandwidth: 288 },
  { name: 'GeForce RTX 4070 12GB', vramGB: 12, bandwidth: 504 },
  { name: 'GeForce RTX 4070 Ti Super 16GB', vramGB: 16, bandwidth: 672 },
  { name: 'GeForce RTX 4080 16GB', vramGB: 16, bandwidth: 717 },
  { name: 'GeForce RTX 4090 24GB', vramGB: 24, bandwidth: 1008 },
  { name: 'GeForce RTX 5070 12GB', vramGB: 12, bandwidth: 672 },
  { name: 'GeForce RTX 5080 16GB', vramGB: 16, bandwidth: 960 },
  { name: 'GeForce RTX 5090 32GB', vramGB: 32, bandwidth: 1792 },
  { name: 'Radeon RX 6800 XT 16GB', vramGB: 16, bandwidth: 512 },
  { name: 'Radeon RX 7800 XT 16GB', vramGB: 16, bandwidth: 624 },
  { name: 'Radeon RX 7900 XTX 24GB', vramGB: 24, bandwidth: 960 },
]

export const RAM_BANDWIDTH = [
  { label: 'DDR4 dual-channel (~45 GB/s)', value: 45 },
  { label: 'DDR5 dual-channel (~80 GB/s)', value: 80 },
]
