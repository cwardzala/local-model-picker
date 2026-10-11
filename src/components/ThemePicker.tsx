import { THEMES, type ThemeId } from '../lib/themes'

interface Props {
  value: ThemeId
  onChange: (id: ThemeId) => void
}

export function ThemePicker({ value, onChange }: Props) {
  return (
    <label class="theme-picker">
      <span>Appearance</span>
      <select value={value} onChange={(e) => onChange(e.currentTarget.value as ThemeId)}>
        {THEMES.map((t) => <option value={t.id}>{t.label}</option>)}
      </select>
    </label>
  )
}
