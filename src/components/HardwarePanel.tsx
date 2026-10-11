import { APPLE_CHIPS, GPUS, RAM_BANDWIDTH } from '../lib/presets'
import { detectSystem, nearestMemory } from '../lib/hardware'
import type { Settings } from '../lib/settings'
import { Field } from './Field'
import { NumberField } from './NumberField'

const MAC_MEMORY_CMD = `sysctl -n hw.memsize | awk '{print $1/2^30" GB"}'`

interface Props {
  settings: Settings
  onChange: (next: Settings) => void
}

export function HardwarePanel({ settings, onChange }: Props) {
  const { hardware: hw } = settings
  const set = (patch: Partial<typeof hw>, extra: Partial<Settings> = {}) =>
    onChange({ ...settings, ...extra, hardware: { ...hw, ...patch } })

  const pickChip = (name: string) => {
    const chip = APPLE_CHIPS.find((c) => c.name === name)
    if (!chip) return
    const ram = chip.memory.includes(hw.ramGB) ? hw.ramGB : chip.memory[0]
    set({ gpuBandwidth: chip.bandwidth, ramGB: ram, vramGB: 0 }, { chip: name })
  }

  const pickGpu = (name: string) => {
    const gpu = GPUS.find((g) => g.name === name)
    if (gpu) set({ vramGB: gpu.vramGB, gpuBandwidth: gpu.bandwidth }, { gpu: name })
  }

  const setPlatform = (platform: 'mac' | 'pc') => {
    if (platform === 'mac') {
      const chip = APPLE_CHIPS.find((c) => c.name === settings.chip) ?? APPLE_CHIPS[0]
      set({ platform, vramGB: 0, gpuBandwidth: chip.bandwidth })
    } else {
      const gpu = GPUS.find((g) => g.name === settings.gpu) ?? GPUS[0]
      set({ platform, vramGB: gpu.vramGB, gpuBandwidth: gpu.bandwidth }, { gpu: gpu.name })
    }
  }

  const detect = () => {
    const d = detectSystem()
    const next: Settings = { ...settings, hardware: { ...hw, platform: d.platform } }
    if (d.platform === 'mac') {
      const chip = APPLE_CHIPS.find((c) => c.name === d.chip)
      if (chip) {
        next.chip = chip.name
        next.hardware = { ...next.hardware, gpuBandwidth: chip.bandwidth, vramGB: 0, ramGB: nearestMemory(chip.memory, d.memoryHintGB) }
      }
    } else {
      const gpu = GPUS.find((g) => g.name === d.gpu)
      if (gpu) {
        next.gpu = gpu.name
        next.hardware = { ...next.hardware, vramGB: gpu.vramGB, gpuBandwidth: gpu.bandwidth }
      }
      if (d.memoryHintGB) next.hardware = { ...next.hardware, ramGB: Math.max(d.memoryHintGB, 8) }
    }
    next.memoryConfirmed = false
    onChange(next)
  }

  const chip = APPLE_CHIPS.find((c) => c.name === settings.chip)

  return (
    <div class="hardware">
      <div class="segmented" role="radiogroup" aria-label="Platform">
        <button type="button" role="radio" aria-checked={hw.platform === 'mac'}
          class={hw.platform === 'mac' ? 'on' : ''} onClick={() => setPlatform('mac')}>
          Mac (Apple Silicon)
        </button>
        <button type="button" role="radio" aria-checked={hw.platform === 'pc'}
          class={hw.platform === 'pc' ? 'on' : ''} onClick={() => setPlatform('pc')}>
          PC / Linux
        </button>
      </div>

      {hw.platform === 'mac' ? (
        <>
          <Field label="Chip">
            <select value={settings.chip} onChange={(e) => pickChip(e.currentTarget.value)}>
              {APPLE_CHIPS.map((c) => <option>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Unified memory" hint="Shared by CPU and GPU">
            <select value={hw.ramGB} onChange={(e) => set({ ramGB: Number(e.currentTarget.value) }, { memoryConfirmed: true })}>
              {(chip?.memory ?? [8, 16, 32, 64, 128]).map((m) => <option value={m}>{m} GB</option>)}
            </select>
          </Field>
        </>
      ) : (
        <>
          <Field label="Graphics card">
            <select value={settings.gpu || GPUS[0].name} onChange={(e) => pickGpu(e.currentTarget.value)}>
              {GPUS.map((g) => <option>{g.name}</option>)}
            </select>
          </Field>
          <Field label="System RAM (GB)">
            <NumberField min={1} step={4} value={hw.ramGB}
              onCommit={(ramGB) => set({ ramGB }, { memoryConfirmed: true })} />
          </Field>
          <Field label="RAM speed" hint="Matters when a model spills out of the GPU">
            <select value={hw.ramBandwidth} onChange={(e) => set({ ramBandwidth: Number(e.currentTarget.value) })}>
              {RAM_BANDWIDTH.map((r) => <option value={r.value}>{r.label}</option>)}
            </select>
          </Field>
        </>
      )}

      <Field label="Free disk space (GB)">
        <NumberField min={0} step={10} value={hw.storageGB}
          onCommit={(storageGB) => set({ storageGB })} />
      </Field>

      <button type="button" class="btn" onClick={detect}>Detect my system</button>
      {settings.memoryConfirmed ? (
        <small class="note">Memory confirmed.</small>
      ) : (
        <div class="note warn-note">
          <strong>Please confirm your memory.</strong> Browsers can’t read RAM, so this is a guess.{' '}
          {hw.platform === 'mac' ? (
            <>Apple menu → About This Mac, or run <code>{MAC_MEMORY_CMD}</code></>
          ) : (
            <>Task Manager → Performance → Memory (Windows), or <code>free -g</code> (Linux).</>
          )}
        </div>
      )}
    </div>
  )
}
