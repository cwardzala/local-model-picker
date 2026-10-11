import { useEffect, useMemo, useState } from 'preact/hooks'
import { useModels } from './hooks/useModels'
import { useStoredState } from './hooks/useStoredState'
import { rankModel, sortRanked, type SortKey } from './lib/rank'
import { DEFAULT_SETTINGS } from './lib/settings'
import { taskById } from './lib/tasks'
import { HardwarePanel } from './components/HardwarePanel'
import { Intro } from './components/Intro'
import { ModelList } from './components/ModelList'
import { Section } from './components/Section'
import { TaskPicker } from './components/TaskPicker'

export function App() {
  const [settings, setSettings] = useStoredState('lmp.settings', DEFAULT_SETTINGS)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [showIntro, setShowIntro] = useState(!settings.introDismissed)
  const task = taskById(settings.task)
  const dismissIntro = () => {
    setShowIntro(false)
    setSettings({ ...settings, introDismissed: true })
  }

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const { models, loading, error, next, loadMore } = useModels({
    pipeline: task.pipeline,
    search,
    sort: 'downloads',
  })

  const ranked = useMemo(() => {
    const all = models.map((m) => rankModel(m, settings.hardware, task))
    const visible = settings.hideTooBig ? all.filter((r) => r.evaluation.fit !== 'no') : all
    return sortRanked(visible, settings.sort)
  }, [models, settings.hardware, settings.hideTooBig, settings.sort, task])

  return (
    <main>
      <header class="masthead">
        <div>
          <h1>Local Model Picker</h1>
          <p>The best open model your machine can run, for the job you have in mind.</p>
        </div>
        {!showIntro && (
          <button type="button" class="link-btn" onClick={() => setShowIntro(true)}>How it works</button>
        )}
      </header>

      {showIntro && <Intro onDismiss={dismissIntro} />}

      <div class="layout">
        <aside>
          <Section title="Your computer">
            <HardwarePanel settings={settings} onChange={setSettings} />
          </Section>
        </aside>

        <div class="main-col">
          <Section title="What for?">
            <TaskPicker value={settings.task} onChange={(id) => setSettings({ ...settings, task: id })} />
          </Section>

          <Section title="Recommended" note={ranked.length ? `${ranked.length} models` : undefined}>
            <div class="toolbar">
              <input type="search" placeholder="Search models (qwen, llama, gemma…)"
                value={query} onInput={(e) => setQuery(e.currentTarget.value)} />
              <select aria-label="Sort" value={settings.sort}
                onChange={(e) => setSettings({ ...settings, sort: e.currentTarget.value as SortKey })}>
                <option value="best">Best for task</option>
                <option value="fastest">Fastest</option>
                <option value="popular">Most downloaded</option>
              </select>
              <label class="check">
                <input type="checkbox" checked={settings.hideTooBig}
                  onChange={(e) => setSettings({ ...settings, hideTooBig: e.currentTarget.checked })} />
                Hide too-big
              </label>
            </div>
            <ModelList items={ranked} hw={settings.hardware} loading={loading} error={error}
              hasMore={Boolean(next)} highlightTop={settings.sort === 'best'} taskLabel={task.label} onMore={loadMore} />
          </Section>
        </div>
      </div>

      <footer>
        Live data from Hugging Face. Estimates assume llama.cpp GGUF quants; real speed varies with backend and context.
        <span> · v{__APP_VERSION__}</span>
      </footer>
    </main>
  )
}
