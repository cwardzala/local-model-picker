import { activeParamsFromId } from './estimate'
import type { HfModel } from './types'

const API = 'https://huggingface.co/api/models'

export type HfSort = 'downloads' | 'trendingScore' | 'likes' | 'lastModified'

export interface HfQuery {
  pipeline: string
  search: string
  sort: HfSort
  /** Opaque cursor from a previous page. */
  cursor?: string
}

export interface HfPage {
  models: HfModel[]
  next?: string
}

interface RawModel {
  id: string
  downloads?: number
  likes?: number
  tags?: string[]
  pipeline_tag?: string
  lastModified?: string
  gguf?: { total?: number; context_length?: number; architecture?: string }
}

const GB = 1e9

export function buildUrl(q: HfQuery, limit = 60): string {
  const p = new URLSearchParams({
    filter: 'gguf',
    pipeline_tag: q.pipeline,
    sort: q.sort,
    direction: '-1',
    limit: String(limit),
  })
  if (q.search.trim()) p.set('search', q.search.trim())
  if (q.cursor) p.set('cursor', q.cursor)
  for (const f of ['gguf', 'downloads', 'likes', 'tags', 'pipeline_tag', 'lastModified']) {
    p.append('expand[]', f)
  }
  return `${API}?${p}`
}

export function toModel(raw: RawModel): HfModel | null {
  const total = raw.gguf?.total
  if (!total) return null
  const paramsB = total / GB
  return {
    id: raw.id,
    downloads: raw.downloads ?? 0,
    likes: raw.likes ?? 0,
    paramsB,
    activeParamsB: activeParamsFromId(raw.id, paramsB),
    contextLength: raw.gguf?.context_length ?? 0,
    pipeline: raw.pipeline_tag ?? '',
    tags: raw.tags ?? [],
    lastModified: raw.lastModified ?? '',
    architecture: raw.gguf?.architecture,
  }
}

function nextCursor(link: string | null): string | undefined {
  const m = link && /<([^>]+)>;\s*rel="next"/.exec(link)
  if (!m) return undefined
  return new URL(m[1]).searchParams.get('cursor') ?? undefined
}

export async function fetchModels(q: HfQuery, signal?: AbortSignal): Promise<HfPage> {
  const res = await fetch(buildUrl(q), { signal })
  if (!res.ok) throw new Error(`Hugging Face returned ${res.status}`)
  const raw = (await res.json()) as RawModel[]
  return {
    models: raw.map(toModel).filter((m): m is HfModel => m !== null),
    next: nextCursor(res.headers.get('link')),
  }
}
