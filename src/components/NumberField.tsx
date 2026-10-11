import { useEffect, useState } from 'preact/hooks'

interface Props {
  value: number
  min?: number
  step?: number
  /** Called only with a valid number at or above `min`. */
  onCommit: (n: number) => void
}

/**
 * Number input that can be cleared and retyped. Keeps the raw text locally and
 * only reports valid values; on blur it snaps back to the last committed one.
 */
export function NumberField({ value, min = 0, step, onCommit }: Props) {
  const [draft, setDraft] = useState(String(value))

  // Follow outside changes, e.g. "Detect my system".
  useEffect(() => setDraft(String(value)), [value])

  const change = (raw: string) => {
    setDraft(raw)
    const n = Number(raw)
    if (raw.trim() !== '' && Number.isFinite(n) && n >= min) onCommit(n)
  }

  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      value={draft}
      onInput={(e) => change(e.currentTarget.value)}
      onBlur={() => setDraft(String(value))}
    />
  )
}
