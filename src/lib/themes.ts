export type ThemeId = 'aqua' | 'xp' | 'platinum' | 'terminal'

export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'aqua', label: 'Aqua (Mac OS X 10.0)' },
  { id: 'xp', label: 'Luna (Windows XP)' },
  { id: 'platinum', label: 'Platinum (Mac OS 9)' },
  { id: 'terminal', label: 'Phosphor (green terminal)' },
]
