import { TASKS, taskById, type TaskId } from '../lib/tasks'

interface Props {
  value: TaskId
  onChange: (id: TaskId) => void
}

export function TaskPicker({ value, onChange }: Props) {
  return (
    <div>
      <div class="chips" role="radiogroup" aria-label="What will you use it for?">
        {TASKS.map((t) => (
          <button
            type="button"
            role="radio"
            aria-checked={t.id === value}
            class={`chip ${t.id === value ? 'on' : ''}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p class="blurb">{taskById(value).blurb}</p>
    </div>
  )
}
