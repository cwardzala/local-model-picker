import { useEffect, useMemo, useState } from 'preact/hooks'
import { useModels } from './hooks/useModels'
import { useStoredState } from './hooks/useStoredState'
import { rankModel, sortRanked, type SortKey } from './lib/rank'
import { DEFAULT_SETTINGS } from './lib/settings'
import { taskById } from './lib/tasks'
import { HardwarePanel } from './components/HardwarePanel'
import { ModelList } from './components/ModelList'
import { TaskPicker } from './components/TaskPicker'
import { Window } from './components/Window'

export function App() {
  const [settings, setSettings] = useStoredState('lmp.settings', DEFAULT_SETTINGS)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const task = taskById(settings.task)

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
      <h1>Local Model Picker <small>v{__APP_VERSION__}</small></h1>
      <p class="tag">Find the best open model your machine can actually run. Live data from Hugging Face.</p>

      <div class="layout">
        <aside>
          <Window title="1. Your computer">
            <HardwarePanel settings={settings} onChange={setSettings} />
          </Window>
        </aside>

        <div class="main-col">
          <Window title="2. What will you use it for?">
            <TaskPicker value={settings.task} onChange={(id) => setSettings({ ...settings, task: id })} />
          </Window>

          <Window title={`3. Best matches${ranked.length ? ` (${ranked.length})` : ''}`}>
            <div class="toolbar">
              <input type="search" placeholder="Search models (e.g. qwen, llama, gemma)…"
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
              hasMore={Boolean(next)} onMore={loadMore} />
          </Window>
        </div>
      </div>
      <footer>Estimates assume llama.cpp-style GGUF quants; real speed varies with backend and context.</footer>
    </main>
  )
}
