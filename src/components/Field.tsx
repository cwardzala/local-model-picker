import type { ComponentChildren } from 'preact'

interface Props {
  label: string
  hint?: string
  children: ComponentChildren
}

export function Field({ label, hint, children }: Props) {
  return (
    <label class="field">
      <span class="field-label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  )
}
