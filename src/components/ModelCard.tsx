import type { RankedModel } from '../lib/rank'
import type { Hardware } from '../lib/types'
import { CopyButton } from './CopyButton'
import { FitBadge } from './FitBadge'

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const fmtParams = (b: number) => (b >= 100 ? b.toFixed(0) : b.toFixed(1)) + 'B'

export function ModelCard({ ranked, hw }: { ranked: RankedModel; hw: Hardware }) {
  const { model, evaluation: ev, score, reasons, warnings } = ranked
  const [org, name] = model.id.split('/')
  const tag = ev.quant.name
  const isMoe = model.activeParamsB < model.paramsB
  const tooBigForDisk = ev.downloadGB > hw.storageGB

  return (
    <article class={`card ${ev.fit === 'no' ? 'dim' : ''}`}>
      <div class="card-head">
        <div class="score" title="Suitability score for the selected task">
          {ev.fit === 'no' ? '—' : Math.round(score)}
        </div>
        <div class="card-title">
          <h3>
            <a href={`https://huggingface.co/${model.id}`} target="_blank" rel="noreferrer">{name}</a>
          </h3>
          <span class="org">{org}</span>
        </div>
        <FitBadge fit={ev.fit} />
      </div>

      <dl class="stats">
        <div><dt>Size</dt><dd>{fmtParams(model.paramsB)}{isMoe && ` (${fmtParams(model.activeParamsB)} active)`}</dd></div>
        <div><dt>Quant</dt><dd>{tag}</dd></div>
        <div><dt>Memory</dt><dd>{ev.requiredGB.toFixed(1)} GB</dd></div>
        <div><dt>Speed</dt><dd>{ev.fit === 'no' ? '—' : `~${Math.round(ev.tokensPerSec)} tok/s`}</dd></div>
        <div><dt>Context</dt><dd>{Math.round(ev.contextTokens / 1024)}k</dd></div>
        <div><dt>Downloads</dt><dd>{compact.format(model.downloads)}</dd></div>
      </dl>

      {(reasons.length > 0 || warnings.length > 0 || tooBigForDisk) && (
        <ul class="notes">
          {reasons.map((r) => <li class="plus">{r}</li>)}
          {warnings.map((w) => <li class="minus">{w}</li>)}
          {tooBigForDisk && <li class="minus">{ev.downloadGB.toFixed(0)} GB download exceeds free disk</li>}
        </ul>
      )}

      {ev.fit !== 'no' && (
        <div class="actions">
          <CopyButton label="Copy Ollama" text={`ollama run hf.co/${model.id}:${tag}`} />
          <CopyButton label="Copy llama.cpp" text={`llama-server -hf ${model.id}:${tag}`} />
        </div>
      )}
    </article>
  )
}
