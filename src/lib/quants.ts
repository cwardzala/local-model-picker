export interface Quant {
  name: string
  /** Effective bits per weight, including block scales. */
  bpw: number
}

/** Common llama.cpp K-quants, highest quality first. */
export const QUANTS: Quant[] = [
  { name: 'Q8_0', bpw: 8.5 },
  { name: 'Q6_K', bpw: 6.56 },
  { name: 'Q5_K_M', bpw: 5.69 },
  { name: 'Q4_K_M', bpw: 4.89 },
  { name: 'Q3_K_M', bpw: 3.91 },
  { name: 'Q2_K', bpw: 3.35 },
]
