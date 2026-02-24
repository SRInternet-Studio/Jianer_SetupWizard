import { createApp } from 'vue'
import './style.css'
import 'xterm/css/xterm.css'
import App from './App.vue'
import { router } from './router'
import { loadAll } from './store'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)

const app = createApp(App)
app.use(router)
app.mount('#app')
loadAll().catch(() => { })
