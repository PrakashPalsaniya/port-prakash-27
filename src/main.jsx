import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { initClarity } from './analytics.js'
import './styles.css'

initClarity()

const container = document.getElementById('root')
const initialYear = Number(container.dataset.buildYear) || new Date().getFullYear()
const app = <React.StrictMode><App initialYear={initialYear} /></React.StrictMode>

if (container.hasChildNodes()) ReactDOM.hydrateRoot(container, app)
else ReactDOM.createRoot(container).render(app)
