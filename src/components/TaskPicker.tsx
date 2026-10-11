import { TASKS, type TaskId } from '../lib/tasks'

interface Props {
  value: TaskId
  onChange: (id: TaskId) => void
}

export function TaskPicker({ value, onChange }: Props) {
  return (
    <div class="tasks" role="radiogroup" aria-label="What will you use it for?">
      {TASKS.map((t) => (
        <button
          type="button"
          role="radio"
          aria-checked={t.id === value}
          class={`task ${t.id === value ? 'on' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <strong>{t.label}</strong>
          <span>{t.blurb}</span>
        </button>
      ))}
    </div>
  )
}
