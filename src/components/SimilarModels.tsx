import type { RankedModel } from '../lib/rank'
import { FitBadge } from './FitBadge'

export function SimilarModels({ items }: { items: RankedModel[] }) {
  if (!items.length) return null
  return (
    <details class="similar">
      <summary>{items.length} similar {items.length === 1 ? 'model' : 'models'}</summary>
      <p>Same architecture and size: usually fine-tunes or re-quantisations of this model.</p>
      <ul>
        {items.map((r) => (
          <li>
            <a href={`https://huggingface.co/${r.model.id}`} target="_blank" rel="noreferrer">
              {r.model.id}
            </a>
            <span class="similar-meta">
              <FitBadge fit={r.evaluation.fit} />
              {r.evaluation.fit !== 'no' && <b>{Math.round(r.score)}</b>}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}
