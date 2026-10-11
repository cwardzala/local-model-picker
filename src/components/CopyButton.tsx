import { useState } from 'preact/hooks'

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1200)
    } catch {
      /* clipboard blocked */
    }
  }
  return (
    <button type="button" class="btn small" onClick={copy} title={text}>
      {done ? 'Copied!' : label}
    </button>
  )
}
