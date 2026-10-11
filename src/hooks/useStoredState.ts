import { useEffect, useState } from 'preact/hooks'

/** useState that survives reloads; storage failures degrade to plain state. */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? { ...initial, ...JSON.parse(raw) } : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* private mode or blocked storage */
    }
  }, [key, value])
  return [value, setValue] as const
}
