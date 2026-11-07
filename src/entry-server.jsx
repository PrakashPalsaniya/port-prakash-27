import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render(year) {
  return renderToString(<App initialYear={year} />)
}
