import { mount } from 'svelte'
import { registerSW } from 'virtual:pwa-register'
import './app.css'
import App from './App.svelte'

mount(App, { target: document.getElementById('app')! })

// Offline support. When a new version has been downloaded, the page reloads to show it.
registerSW({ immediate: true })
