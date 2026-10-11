export type TaskId = 'chat' | 'coding' | 'data' | 'notes' | 'writing' | 'vision'

export interface TaskProfile {
  id: TaskId
  label: string
  blurb: string
  /** Context window the workload realistically needs, tokens. */
  contextTokens: number
  /** Quants below this bits-per-weight hurt this task too much. */
  minBpw: number
  /** Below this size models are rarely reliable for the task, billions. */
  minParamsB: number
  /** Past this size extra capability stops mattering much, billions. */
  sweetSpotB: number
  /** 0–1: how much generation speed matters versus raw capability. */
  speedWeight: number
  /** HF pipeline tag the model must have. */
  pipeline: 'text-generation' | 'image-text-to-text'
  /** Model-name / tag patterns that suit the task. */
  affinity?: RegExp
  /** Patterns that make a model a poor fit for the task. */
  penalty?: RegExp
}

const CODE = /cod(er|e|ing)|devstral|starcoder|deepseek-coder|qwen.*coder|codestral|granite-code/i
const REASONING = /think|reason|r1\b/i
const INSTRUCT = /instruct|chat|-it\b|assistant/i
const ROLEPLAY = /rp|roleplay|erp|uncensored|abliterat|heretic|nsfw/i

export const TASKS: TaskProfile[] = [
  {
    id: 'chat',
    label: 'General chat',
    blurb: 'Q&A, brainstorming, everyday assistant.',
    contextTokens: 8192,
    minBpw: 3.9,
    minParamsB: 3,
    sweetSpotB: 32,
    speedWeight: 0.4,
    pipeline: 'text-generation',
    affinity: INSTRUCT,
  },
  {
    id: 'coding',
    label: 'Coding',
    blurb: 'Write, refactor and explain code. Needs a big context and clean quants.',
    contextTokens: 16384,
    minBpw: 4.8,
    minParamsB: 7,
    sweetSpotB: 32,
    speedWeight: 0.5,
    pipeline: 'text-generation',
    affinity: CODE,
    penalty: ROLEPLAY,
  },
  {
    id: 'data',
    label: 'Data processing',
    blurb: 'Extraction, classification, JSON output, tool calls. Accuracy over prose.',
    contextTokens: 16384,
    minBpw: 4.8,
    minParamsB: 7,
    sweetSpotB: 24,
    speedWeight: 0.6,
    pipeline: 'text-generation',
    affinity: /instruct|tool|function|json|-it\b/i,
    penalty: ROLEPLAY,
  },
  {
    id: 'notes',
    label: 'Note taking & summaries',
    blurb: 'Summarise meetings and documents. Long context and speed beat size.',
    contextTokens: 32768,
    minBpw: 3.9,
    minParamsB: 3,
    sweetSpotB: 14,
    speedWeight: 0.7,
    pipeline: 'text-generation',
    affinity: INSTRUCT,
    penalty: ROLEPLAY,
  },
  {
    id: 'writing',
    label: 'Creative writing',
    blurb: 'Fiction, drafts, style. Larger models write noticeably better.',
    contextTokens: 16384,
    minBpw: 3.9,
    minParamsB: 7,
    sweetSpotB: 70,
    speedWeight: 0.2,
    pipeline: 'text-generation',
    affinity: /writer|story|creative|gemma|mistral|nemo/i,
  },
  {
    id: 'vision',
    label: 'Images & OCR',
    blurb: 'Describe screenshots, read documents, answer questions about images.',
    contextTokens: 8192,
    minBpw: 4.8,
    minParamsB: 3,
    sweetSpotB: 32,
    speedWeight: 0.4,
    pipeline: 'image-text-to-text',
    affinity: /vl|vision|ocr|llava|pixtral|gemma|qwen/i,
  },
]

export const taskById = (id: TaskId): TaskProfile =>
  TASKS.find((t) => t.id === id) ?? TASKS[0]

export { CODE, REASONING }
