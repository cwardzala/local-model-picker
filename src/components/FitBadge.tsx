import type { Fit } from '../lib/types'

const LABEL: Record<Fit, string> = {
  great: 'Runs great',
  good: 'Runs well',
  slow: 'Runs slowly',
  no: 'Too big',
}

export function FitBadge({ fit }: { fit: Fit }) {
  return <span class={`fit fit-${fit}`}>{LABEL[fit]}</span>
}
