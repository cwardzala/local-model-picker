import { render } from 'preact'
import { App } from './App'
import { initAnalytics } from './lib/analytics'
import './styles.css'

initAnalytics()
render(<App />, document.getElementById('root')!)
