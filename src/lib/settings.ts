import type { Hardware } from './types'
import type { TaskId } from './tasks'
import type { SortKey } from './rank'
import { DEFAULT_HARDWARE } from './hardware'

export interface Settings {
  hardware: Hardware
  chip: string
  gpu: string
  task: TaskId
  sort: SortKey
  hideTooBig: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  hardware: DEFAULT_HARDWARE,
  chip: 'M4',
  gpu: '',
  task: 'chat',
  sort: 'best',
  hideTooBig: true,
}
