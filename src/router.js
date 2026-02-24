import { createRouter, createWebHashHistory } from 'vue-router'
import Welcome from './pages/Welcome.vue'
import Basic from './pages/Basic.vue'
import AI from './pages/AI.vue'
import Presets from './pages/Presets.vue'
import TTS from './pages/TTS.vue'
import Others from './pages/Others.vue'
import Advanced from './pages/Advanced.vue'
import Apply from './pages/Apply.vue'
import About from './pages/About.vue'
import Plugins from './pages/Plugins.vue'
import NapCatDeploy from './pages/NapCatDeploy.vue'
import JianerManage from './pages/JianerManage.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Welcome },
    { path: '/basic', component: Basic },
    { path: '/ai', component: AI },
    { path: '/presets', component: Presets },
    { path: '/tts', component: TTS },
    { path: '/others', component: Others },
    { path: '/advanced', component: Advanced },
    { path: '/plugins', component: Plugins },
    { path: '/jianer', component: JianerManage },
    { path: '/napcat', component: NapCatDeploy },
    { path: '/apply', component: Apply },
    { path: '/about', component: About }
  ]
})
