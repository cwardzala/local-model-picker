import type { ComponentChildren } from 'preact'

interface Props {
  title: string
  note?: string
  children: ComponentChildren
}

export function Section({ title, note, children }: Props) {
  return (
    <section class="section">
      <h2>
        {title}
        {note && <span class="section-note">{note}</span>}
      </h2>
      {children}
    </section>
  )
}
