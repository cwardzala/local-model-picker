import type { ComponentChildren } from 'preact'

interface Props {
  title: string
  class?: string
  children: ComponentChildren
}

export function Window({ title, class: className = '', children }: Props) {
  return (
    <section class={`window ${className}`}>
      <header class="titlebar">
        <span class="lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <h2>{title}</h2>
      </header>
      <div class="window-body">{children}</div>
    </section>
  )
}
