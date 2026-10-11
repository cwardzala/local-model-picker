import type { RankedModel } from '../lib/rank'
import type { Hardware } from '../lib/types'
import { CopyButton } from './CopyButton'
import { FitBadge } from './FitBadge'

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const fmtParams = (b: number) => (b >= 100 ? b.toFixed(0) : b.toFixed(1)) + 'B'

interface Props {
  ranked: RankedModel
  hw: Hardware
  /** Marks the single recommended model. */
  topPick?: boolean
}

export function ModelCard({ ranked, hw, topPick }: Props) {
  const { model, evaluation: ev, score, reasons, warnings } = ranked
  const [org, name] = model.id.split('/')
  const quant = ev.quant.name
  const runs = ev.fit !== 'no'
  const isMoe = model.activeParamsB < model.paramsB
  const tooBigForDisk = ev.downloadGB > hw.storageGB

  const size = isMoe
    ? `${fmtParams(model.paramsB)} (${fmtParams(model.activeParamsB)} active)`
    : fmtParams(model.paramsB)
  const notes = [
    ...warnings,
    ...(tooBigForDisk ? [`${ev.downloadGB.toFixed(0)} GB download exceeds free disk`] : []),
  ]

  return (
    <article class={`card ${topPick ? 'top' : ''} ${runs ? '' : 'dim'}`}>
      {topPick && <span class="top-label">Top pick</span>}
      <header class="card-head">
        <div class="card-title">
          <h3>
            <a href={`https://huggingface.co/${model.id}`} target="_blank" rel="noreferrer">{name}</a>
          </h3>
          <span class="org">{org}</span>
        </div>
        {runs && (
          <span class="match" title="How well this suits your task on this hardware">
            {Math.round(score)}
            <small>match</small>
          </span>
        )}
      </header>

      <div class="key">
        <FitBadge fit={ev.fit} />
        {runs && <span class="speed">~{Math.round(ev.tokensPerSec)} tok/s</span>}
        <span class="mem">{ev.requiredGB.toFixed(1)} GB</span>
      </div>

      <p class="meta">
        {size} · {quant} · {Math.round(ev.contextTokens / 1024)}k context · {compact.format(model.downloads)} downloads
      </p>

      {(reasons.length > 0 || notes.length > 0) && (
        <ul class="notes">
          {reasons.map((r) => <li class="plus">{r}</li>)}
          {notes.map((w) => <li class="minus">{w}</li>)}
        </ul>
      )}

      {runs && (
        <div class="actions">
          <CopyButton label="Copy Ollama" text={`ollama run hf.co/${model.id}:${quant}`} />
          <CopyButton label="Copy llama.cpp" text={`llama-server -hf ${model.id}:${quant}`} />
        </div>
      )}
    </article>
  )
}
