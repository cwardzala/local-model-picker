import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { fetchModels, type HfQuery } from '../lib/hf'
import type { HfModel } from '../lib/types'

interface State {
  models: HfModel[]
  next?: string
  loading: boolean
  error?: string
}

export function useModels(query: Omit<HfQuery, 'cursor'>) {
  const [state, setState] = useState<State>({ models: [], loading: true })
  const abort = useRef<AbortController | undefined>(undefined)
  const { pipeline, search, sort } = query

  const load = useCallback(
    (cursor?: string) => {
      abort.current?.abort()
      const ctl = new AbortController()
      abort.current = ctl
      setState((s) => ({ ...s, loading: true, error: undefined }))
      fetchModels({ pipeline, search, sort, cursor }, ctl.signal)
        .then((page) =>
          setState((s) => ({
            models: cursor ? [...s.models, ...page.models] : page.models,
            next: page.next,
            loading: false,
          })),
        )
        .catch((e: Error) => {
          if (e.name !== 'AbortError') {
            setState((s) => ({ ...s, loading: false, error: e.message }))
          }
        })
    },
    [pipeline, search, sort],
  )

  useEffect(() => {
    load()
    return () => abort.current?.abort()
  }, [load])

  return { ...state, loadMore: () => state.next && load(state.next) }
}
