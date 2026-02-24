<script setup>
import { NMenu, NMessageProvider, NConfigProvider, NLoadingBarProvider, darkTheme, NButton, NIcon, NTooltip, NDrawer, NDrawerContent } from 'naive-ui'
import { ref, onMounted, onBeforeUnmount, computed, watch, h } from 'vue'
import { useRouter, useRoute, RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import { WeatherMoon24Regular, WeatherSunny24Regular, Desktop24Regular, Navigation24Regular, Home24Regular, Person24Regular, BrainCircuit24Regular, TextBulletListSquare24Regular, Speaker224Regular, Settings24Regular, WrenchScrewdriver24Regular, PuzzlePiece24Regular, Rocket24Regular, CheckmarkCircle24Regular, Info24Regular, Bot24Regular } from '@vicons/fluent'
import hljs from 'highlight.js/lib/core'

const router = useRouter()
const route = useRoute()

function icon(comp) {
  return () => h(NIcon, { size: 18 }, { default: () => h(comp) })
}

const menuOptions = [
  { label: '欢迎', key: '/', icon: icon(Home24Regular) },
  { label: '基本信息设置', key: '/basic', icon: icon(Person24Regular) },
  { label: 'AI 设置', key: '/ai', icon: icon(BrainCircuit24Regular) },
  { label: 'AI 预设', key: '/presets', icon: icon(TextBulletListSquare24Regular) },
  { label: 'AI 语音回复', key: '/tts', icon: icon(Speaker224Regular) },
  { label: '其他设置', key: '/others', icon: icon(Settings24Regular) },
  { label: '高级设置', key: '/advanced', icon: icon(WrenchScrewdriver24Regular) },
  { label: '插件中心', key: '/plugins', icon: icon(PuzzlePiece24Regular) },
  { label: 'Jianer 管理', key: '/jianer', icon: icon(Bot24Regular) },
  { label: 'NapCat 管理', key: '/napcat', icon: icon(Rocket24Regular) },
  { label: '核对并应用设置', key: '/apply', icon: icon(CheckmarkCircle24Regular) },
  { label: '关于', key: '/about', icon: icon(Info24Regular) }
]

const value = ref(route.path)

const systemDark = ref(false)
const themePreference = ref('system')
const drawerOpen = ref(false)
const navCollapsed = ref(false)
const bgEl = ref(null)
let moveRaf = 0
let moveHandler = null

const resolvedIsDark = computed(() => {
  if (themePreference.value === 'dark') return true
  if (themePreference.value === 'light') return false
  return systemDark.value
})

const theme = computed(() => (resolvedIsDark.value ? darkTheme : null))

const themeLabel = computed(() => {
  if (themePreference.value === 'dark') return '深色'
  if (themePreference.value === 'light') return '浅色'
  return '跟随系统'
})

const themeIcon = computed(() => {
  if (themePreference.value === 'system') return Desktop24Regular
  return resolvedIsDark.value ? WeatherMoon24Regular : WeatherSunny24Regular
})

const themeOverrides = computed(() => {
  const dark = resolvedIsDark.value

  const primary = dark ? '#4cc2ff' : '#0078d4'
  const primaryHover = dark ? '#6fd0ff' : '#106ebe'
  const primaryPressed = dark ? '#2aaef3' : '#005a9e'

  const surface = dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.64)'
  const surface2 = dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.82)'
  const border = dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)'
  const border2 = dark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.16)'
  const text = dark ? 'rgba(255, 255, 255, 0.92)' : 'rgba(17, 24, 39, 0.92)'
  const muted = dark ? 'rgba(255, 255, 255, 0.70)' : 'rgba(17, 24, 39, 0.70)'

  return {
    common: {
      fontFamily: 'var(--font-ui)',
      fontFamilyMono: 'var(--font-mono)',
      borderRadius: '14px',
      borderRadiusSmall: '12px',
      borderRadiusMedium: '14px',
      borderRadiusLarge: '16px',
      primaryColor: primary,
      primaryColorHover: primaryHover,
      primaryColorPressed: primaryPressed,
      textColorBase: text
    },
    Layout: {
      color: 'transparent',
      textColor: text
    },
    Card: {
      color: surface2,
      colorModal: surface2,
      borderColor: border,
      borderRadius: '16px',
      titleTextColor: text,
      boxShadow: 'none'
    },
    Menu: {
      color: 'transparent',
      itemTextColor: muted,
      itemTextColorHover: text,
      itemTextColorActive: text,
      itemTextColorActiveHover: text,
      itemColorHover: surface,
      itemColorActive: surface2,
      itemBorderRadius: '14px',
      dividerColor: border
    },
    Input: {
      color: surface,
      colorFocus: surface2,
      border: `1px solid ${border}`,
      borderHover: `1px solid ${border2}`,
      borderFocus: `1px solid ${primary}`,
      caretColor: primary,
      textColor: text,
      placeholderColor: muted
    },
    Button: {
      borderRadiusTiny: '12px',
      borderRadiusSmall: '12px',
      borderRadiusMedium: '14px',
      borderRadiusLarge: '16px'
    },
    Code: {
      color: surface,
      textColor: text,
      border: `1px solid ${border}`,
      borderRadius: '14px'
    },
    List: {
      color: 'transparent',
      textColor: text,
      borderColor: border
    }
  }
})

watch(() => route.path, (newPath) => {
  value.value = newPath
})

watch(resolvedIsDark, (dark) => {
  try { document.documentElement.dataset.theme = dark ? 'dark' : 'light' } catch { }
}, { immediate: true })

onMounted(() => {
  try {
    const saved = localStorage.getItem('sw-theme')
    if (saved === 'dark' || saved === 'light' || saved === 'system') themePreference.value = saved
  } catch { }

  try {
    const savedNav = localStorage.getItem('sw-nav-collapsed')
    navCollapsed.value = savedNav === '1'
  } catch { }

  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const update = () => { systemDark.value = mq.matches }
  if (mq.addEventListener) mq.addEventListener('change', update)
  else mq.addListener?.(update)
  update()

  // Real-time Aurora Animation Loop (Automatic, No Mouse)
  let start = Date.now()
  
  const loop = () => {
    const now = Date.now()
    const t = (now - start) / 2500 // Slower time base
    
    if (bgEl.value) {
      // Complex organic motion using multiple sine waves
      // Point 1: Large smooth orbit
      const x1 = 50 + 35 * Math.sin(t * 0.5) + 15 * Math.cos(t * 0.3)
      const y1 = 40 + 30 * Math.cos(t * 0.4) + 15 * Math.sin(t * 0.6)
      
      // Point 2: Faster, smaller counter-orbit
      const x2 = 80 + 25 * Math.sin(t * 0.7 + 2) + 10 * Math.cos(t * 1.2)
      const y2 = 20 + 25 * Math.cos(t * 0.6 + 1) + 10 * Math.sin(t * 0.9)
      
      // Point 3: Wide sweeping motion
      const x3 = 20 + 30 * Math.sin(t * 0.4 + 4) + 20 * Math.cos(t * 0.2)
      const y3 = 80 + 25 * Math.cos(t * 0.5 + 3) + 15 * Math.sin(t * 0.8)

      // Point 4: Diagonal drift
      const x4 = 60 + 25 * Math.sin(t * 0.6 + 1) + 15 * Math.cos(t * 0.4)
      const y4 = 40 + 30 * Math.cos(t * 0.3 + 2) + 15 * Math.sin(t * 0.7)

      // Point 5: Central pulsing
      const x5 = 50 + 20 * Math.sin(t * 0.5 + 5) + 25 * Math.cos(t * 0.3)
      const y5 = 50 + 25 * Math.cos(t * 0.6 + 4) + 20 * Math.sin(t * 0.5)

      // Point 6: Edge highlight
      const x6 = 30 + 35 * Math.sin(t * 0.4 + 2) + 10 * Math.cos(t * 0.8)
      const y6 = 30 + 30 * Math.cos(t * 0.5 + 1) + 10 * Math.sin(t * 0.6)

      bgEl.value.style.setProperty('--ax1', `${x1}%`)
      bgEl.value.style.setProperty('--ay1', `${y1}%`)
      bgEl.value.style.setProperty('--ax2', `${x2}%`)
      bgEl.value.style.setProperty('--ay2', `${y2}%`)
      bgEl.value.style.setProperty('--ax3', `${x3}%`)
      bgEl.value.style.setProperty('--ay3', `${y3}%`)
      bgEl.value.style.setProperty('--ax4', `${x4}%`)
      bgEl.value.style.setProperty('--ay4', `${y4}%`)
      bgEl.value.style.setProperty('--ax5', `${x5}%`)
      bgEl.value.style.setProperty('--ay5', `${y5}%`)
      bgEl.value.style.setProperty('--ax6', `${x6}%`)
      bgEl.value.style.setProperty('--ay6', `${y6}%`)
    }
    
    moveRaf = requestAnimationFrame(loop)
  }
  
  loop()

  // Removed mouse listener for automatic animation
})

onBeforeUnmount(() => {
  if (moveRaf) cancelAnimationFrame(moveRaf)
})

function onUpdateValue(v) {
  value.value = v
  router.push(v)
  drawerOpen.value = false
}

function cycleTheme() {
  const modes = ['light', 'dark', 'system']
  const currentIndex = modes.indexOf(themePreference.value)
  const nextIndex = (currentIndex + 1) % modes.length
  const next = modes[nextIndex]
  
  themePreference.value = next
  try { localStorage.setItem('sw-theme', next) } catch { }
}

function toggleNav() {
  navCollapsed.value = !navCollapsed.value
  try { localStorage.setItem('sw-nav-collapsed', navCollapsed.value ? '1' : '0') } catch { }
}

const currentMenu = computed(() => menuOptions.find(m => m.key === route.path))
</script>

<template>
  <NMessageProvider>
    <NLoadingBarProvider>
      <NConfigProvider :theme="theme" :theme-overrides="themeOverrides" :hljs="hljs">
        <div ref="bgEl" class="aurora-bg" />
        <div class="app-shell">
          <div class="app-frame" :class="{ 'is-collapsed': navCollapsed }">
            <header class="app-header">
              <div class="brand">
                <NButton quaternary circle aria-label="切换导航" @click="toggleNav">
                  <template #icon>
                    <NIcon :component="Navigation24Regular" />
                  </template>
                </NButton>
                <img src="/logo.png" class="brand-mark" alt="Logo" />
                <div class="brand-title">
                  <strong>Jianer WebUI</strong>
                </div>
              </div>

              <div class="page-title" aria-live="polite" style="display: none;">
                <h1>{{ currentMenu?.label ?? '设置' }}</h1>
              </div>

              <div style="display:flex; align-items:center; gap: 8px;">
                <NButton class="mobile-only" quaternary circle aria-label="导航菜单" @click="drawerOpen = true">
                  <template #icon>
                    <NIcon :component="Navigation24Regular" />
                  </template>
                </NButton>

                <NTooltip trigger="hover">
                  <template #trigger>
                    <NButton quaternary circle :aria-label="`主题：${themeLabel}`" @click="cycleTheme">
                      <template #icon>
                        <NIcon :component="themeIcon" />
                      </template>
                    </NButton>
                  </template>
                  主题：{{ themeLabel }}
                </NTooltip>
              </div>
            </header>

            <div class="app-main">
              <aside class="app-nav">
                <AppNavigation 
                  :value="value" 
                  :options="menuOptions" 
                  :collapsed="navCollapsed"
                  @update:value="onUpdateValue"
                />
                <div class="nav-footer" style="display: none;">
                  <div style="font-weight: 650; margin-bottom: 4px;">提示</div>
                  <div>按左侧顺序完成配置，最后在“核对并应用设置”保存。</div>
                </div>
              </aside>

              <main class="app-content">
                <RouterView v-slot="{ Component }">
                  <Transition name="page" mode="out-in">
                    <component :is="Component" :key="route.fullPath" />
                  </Transition>
                </RouterView>
              </main>
            </div>

            <NDrawer v-model:show="drawerOpen" placement="left" :width="290">
              <NDrawerContent>
                <template #header>
                  <div class="brand" style="padding-left: 4px;">
                    <img src="/logo.png" class="brand-mark" alt="Logo" />
                    <div class="brand-title">
                      <strong>Jianer WebUI</strong>
                    </div>
                  </div>
                </template>
                <AppNavigation 
                  :value="value" 
                  :options="menuOptions" 
                  :collapsed="false"
                  @update:value="onUpdateValue"
                  style="margin-top: 4px;"
                />
              </NDrawerContent>
            </NDrawer>
          </div>
        </div>
      </NConfigProvider>
    </NLoadingBarProvider>
  </NMessageProvider>
</template>

<style scoped>
.mobile-only {
  display: none;
}

@media (max-width: 900px) {
  .mobile-only {
    display: inline-flex;
  }
}
</style>
