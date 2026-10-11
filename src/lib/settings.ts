import type { Hardware } from './types'
import type { TaskId } from './tasks'
import type { SortKey } from './rank'
import type { ThemeId } from './themes'
import { DEFAULT_HARDWARE } from './hardware'

export interface Settings {
  hardware: Hardware
  chip: string
  gpu: string
  task: TaskId
  sort: SortKey
  hideTooBig: boolean
  theme: ThemeId
}

export const DEFAULT_SETTINGS: Settings = {
  hardware: DEFAULT_HARDWARE,
  chip: 'M4',
  gpu: '',
  task: 'chat',
  sort: 'best',
  hideTooBig: true,
  theme: 'aqua',
}
