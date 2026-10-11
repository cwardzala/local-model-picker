interface Props {
  onDismiss: () => void
}

export function Intro({ onDismiss }: Props) {
  return (
    <section class="intro" aria-label="How this works">
      <h2>How this works</h2>
      <ol>
        <li>
          <strong>Tell us your computer.</strong> Memory is what decides which models fit.
          Hit “Detect my system”, then confirm the memory.
        </li>
        <li>
          <strong>Pick what it’s for.</strong> Coding wants a bigger, cleaner model than
          summarising notes, so the ranking changes with the task.
        </li>
        <li>
          <strong>Read the results.</strong> The top pick is the best balance for your task and
          machine. Copy its command to run it.
        </li>
      </ol>
      <dl>
        <div>
          <dt>Match, 0–100</dt>
          <dd>How well a model suits your task on your computer, mostly its capability and speed. Open “Why?” on a card to see the parts.</dd>
        </div>
        <div>
          <dt>Runs great / well / slowly</dt>
          <dd>Speed on your machine: 20+ tok/s fully in fast memory, 8+ tok/s, or below that. “Too big” won’t fit.</dd>
        </div>
        <div>
          <dt>tok/s</dt>
          <dd>Tokens per second, about three-quarters of a word each. 8 is readable, 20+ feels instant.</dd>
        </div>
      </dl>
      <button type="button" class="btn" onClick={onDismiss}>Got it</button>
    </section>
  )
}
