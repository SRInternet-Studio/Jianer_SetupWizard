<script setup>
import { computed, h, onMounted, ref } from 'vue'
import { state } from '../store'
import {
  pluginsRemote,
  pluginsLocal,
  pluginInfo,
  pluginInstall,
  pluginRemove,
  pluginToggle,
  pluginProgress,
  pluginStates,
  pluginInfos,
  pluginCheckUpdates,
  getGithubToken,
  setGithubToken,
  getPipConfig,
  setPipConfig,
  getGithubProxy,
  setGithubProxy
} from '../api'
import {
  NButton,
  NCard,
  NCheckbox,
  NDrawer,
  NDrawerContent,
  NEmpty,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NModal,
  NProgress,
  NSelect,
  NSpin,
  NSpace,
  NTag,
  NText,
  useLoadingBar,
  useMessage
} from 'naive-ui'
import {
  ArrowClockwise24Regular,
  ArrowDownload24Regular,
  CheckmarkCircle24Regular,
  Delete24Regular,
  Info24Regular,
  PauseCircle24Regular,
  PlayCircle24Regular,
  PlugConnected24Regular,
  Search24Regular,
  Settings24Regular
} from '@vicons/fluent'

const message = useMessage()
const loadingBar = useLoadingBar()

const filter = ref('all')
const search = ref('')
const remote = ref([])
const local = ref([])
const updatable = ref([])
const enabled = ref({})
const intros = ref({})

const loading = ref(false)
const loadingDetail = ref('')
const infoShow = ref(false)
const infoLoading = ref(false)
const infoData = ref({ title: '', intro: '', depend: '', agreement: '' })

const settingShow = ref(false)
const token = ref('')
const savingToken = ref(false)
const pipIndexUrl = ref('')
const savingPip = ref(false)
const useProxy = ref(false)
const proxyBase = ref('')
const savingProxy = ref(false)

const installing = ref({})
const installProgress = ref({})
const installLogs = ref({})
let introTaskId = 0

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '已安装', value: 'installed' },
  { label: '可更新', value: 'updatable' }
]

const lastUpdatedText = computed(() => {
  const ts = state.pluginsCache.lastUpdated
  if (!ts) return '未更新'
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '未知'
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

function toNames(arr) {
  if (!Array.isArray(arr)) return []
  return arr
    .map((i) => (typeof i === 'string' ? i : (i && i.name) || ''))
    .filter(Boolean)
}

function destroyMessage(m) {
  if (!m) return
  if (typeof m.destroy === 'function') m.destroy()
}

function formatPluginsError(e) {
  const data = e?.response?.data
  const type = data?.error?.type
  const msg = data?.error?.message || e?.message || '未知错误'
  if (type === 'github_auth') return `GitHub 鉴权失败: ${msg}`
  if (type === 'upstream_timeout') return `连接上游超时: ${msg}`
  if (type === 'upstream_invalid_json' || type === 'upstream_invalid_shape') return `上游返回异常: ${msg}`
  if (type === 'upstream_http_error' || type === 'upstream_request_error') return `上游请求失败: ${msg}`
  return msg
}

function buildIntroPreview(text) {
  const cleaned = String(text || '')
    .split(/\r?\n/)
    .map(line => line.replace(/^#+\s*/, '').trim())
    .filter(Boolean)
  if (cleaned.length > 1) return `${cleaned[0]}\n${cleaned[1]}...`
  return cleaned[0] || '暂无介绍'
}

function isInstalled(name) {
  return local.value.includes(name)
}

function canUpdate(name) {
  return updatable.value.includes(name)
}

function isEnabled(name) {
  return !!enabled.value[name]
}

function isInstalling(name) {
  return !!installing.value[name]
}

function shownList() {
  let base = remote.value
  if (filter.value === 'installed') base = local.value
  if (filter.value === 'updatable') base = updatable.value
  const q = String(search.value || '').trim().toLowerCase()
  if (q) {
    base = base.filter((name) => {
      const n = String(name || '').toLowerCase()
      if (n.includes(q)) return true
      const intro = String(intros.value?.[name] || '').toLowerCase()
      return intro.includes(q)
    })
  }
  return base
}

function statusText(name) {
  const prog = installProgress.value[name] || {}
  const status = prog.status || 'running'
  if (status === 'starting') return '开始安装插件...'
  if (status === 'downloading') return '正在下载插件...'
  if (status === 'installing') return '正在安装依赖...'
  if (status === 'done') return '安装完成'
  if (status === 'error') return '安装失败'
  return '正在安装插件...'
}

function updateCache() {
  state.pluginsCache.loaded = true
  state.pluginsCache.remote = remote.value.slice()
  state.pluginsCache.local = local.value.slice()
  state.pluginsCache.updatable = updatable.value.slice()
  state.pluginsCache.intros = { ...intros.value }
  state.pluginsCache.enabled = { ...enabled.value }
  state.pluginsCache.lastUpdated = Date.now()
}

function updateFromCache() {
  if (!state.pluginsCache.loaded) return
  remote.value = state.pluginsCache.remote || []
  local.value = state.pluginsCache.local || []
  updatable.value = state.pluginsCache.updatable || []
  intros.value = { ...(state.pluginsCache.intros || {}) }
  enabled.value = { ...(state.pluginsCache.enabled || {}) }
}

async function loadIntroInBackground(names, taskId) {
  if (!names.length) return
  const chunkSize = 10
  for (let i = 0; i < names.length; i += chunkSize) {
    if (taskId !== introTaskId) return
    const chunk = names.slice(i, i + chunkSize)
    try {
      const data = await pluginInfos(chunk)
      if (taskId !== introTaskId) return
      chunk.forEach((name) => {
        intros.value[name] = buildIntroPreview(data?.[name]?.intro || '')
      })
      state.pluginsCache.intros = { ...intros.value }
      state.pluginsCache.lastUpdated = Date.now()
    } catch {
      if (taskId !== introTaskId) return
      chunk.forEach((name) => {
        if (!intros.value[name]) intros.value[name] = '暂无介绍'
      })
    }
  }
}

async function refreshAll() {
  loading.value = true
  loadingBar.start()
  loadingDetail.value = '正在获取插件列表...'
  const loadingMsg = message.loading(() => h('span', null, loadingDetail.value), { duration: 0 })

  try {
    const [remoteRes, localRes] = await Promise.allSettled([pluginsRemote(), pluginsLocal()])
    if (remoteRes.status === 'rejected' && localRes.status === 'rejected') {
      throw remoteRes.reason || localRes.reason
    }

    if (remoteRes.status === 'rejected') {
      message.error(formatPluginsError(remoteRes.reason))
    }
    if (localRes.status === 'rejected') {
      message.error('本地插件列表获取失败: ' + formatPluginsError(localRes.reason))
    }

    remote.value = toNames(remoteRes.status === 'fulfilled' ? remoteRes.value : [])
    local.value = toNames(localRes.status === 'fulfilled' ? localRes.value : [])

    loadingDetail.value = '正在获取插件状态...'
    const [updatesMap, statesMap] = await Promise.all([
      Promise.race([
        pluginCheckUpdates(local.value),
        new Promise(resolve => setTimeout(() => resolve({}), 4000))
      ]).catch(() => ({})),
      Promise.race([
        pluginStates(local.value),
        new Promise(resolve => setTimeout(() => resolve({}), 4000))
      ]).catch(() => ({}))
    ])

    updatable.value = Object.keys(updatesMap || {}).filter(k => updatesMap[k])
    enabled.value = { ...(statesMap || {}) }

    const names = remote.value.slice()
    const nextIntros = {}
    names.forEach((name) => {
      nextIntros[name] = intros.value[name] || '加载中...'
    })
    intros.value = nextIntros

    const currentTaskId = ++introTaskId
    loadIntroInBackground(names, currentTaskId).catch(() => {})

    updateCache()
    message.success('插件列表已刷新，介绍正在异步加载')
    loadingBar.finish()
  } catch (e) {
    message.error('插件中心加载失败: ' + formatPluginsError(e))
    loadingBar.error()
  } finally {
    loading.value = false
    destroyMessage(loadingMsg)
  }
}

async function showInfo(name) {
  infoData.value = { title: name, intro: '', depend: '', agreement: '' }
  infoLoading.value = true
  infoShow.value = true
  try {
    const data = await pluginInfo(name)
    infoData.value = {
      title: name,
      intro: data?.intro || '',
      depend: data?.depend || '',
      agreement: data?.agreement || ''
    }
  } finally {
    infoLoading.value = false
  }
}

function getPluginProgressWsUrl(name) {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/api/plugins/progress/ws/${encodeURIComponent(name)}`
}

function applyInstallProgress(name, p) {
  installProgress.value[name] = { percent: p?.percent || 0, status: p?.status || 'running' }
  installLogs.value[name] = p?.message || ''
}

function waitInstallProgressWebSocket(name) {
  if (typeof WebSocket === 'undefined') return Promise.reject(new Error('no-websocket'))
  return new Promise((resolve, reject) => {
    let ws
    let opened = false
    let finished = false
    const url = getPluginProgressWsUrl(name)
    try {
      ws = new WebSocket(url)
    } catch (e) {
      reject(e)
      return
    }
    const fail = (e) => {
      if (finished) return
      finished = true
      try { ws.close() } catch {}
      reject(e)
    }
    ws.onopen = () => {
      opened = true
    }
    ws.onmessage = (event) => {
      let p = null
      try {
        p = JSON.parse(event.data)
      } catch {
        return
      }
      applyInstallProgress(name, p)
      if (p?.status === 'done' || p?.status === 'error') {
        finished = true
        try { ws.close() } catch {}
        resolve(p)
      }
    }
    ws.onerror = () => {}
    ws.onclose = () => {
      if (finished) return
      if (!opened) fail(new Error('ws-connect-failed'))
      else fail(new Error('ws-closed'))
    }
  })
}

async function waitInstallProgressPolling(name) {
  for (;;) {
    const p = await pluginProgress(name)
    applyInstallProgress(name, p)
    if (p?.status === 'done' || p?.status === 'error') return p
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}

async function install(name) {
  installing.value[name] = true
  installProgress.value[name] = { percent: 0, status: 'starting' }
  installLogs.value[name] = ''

  try {
    const r = await pluginInstall(name)
    if (!r.ok) {
      installing.value[name] = false
      message.error(r.error || '安装失败')
      return
    }

    let finalProgress = null
    try {
      finalProgress = await waitInstallProgressWebSocket(name)
    } catch {
      finalProgress = await waitInstallProgressPolling(name)
    }

    installing.value[name] = false
    if (finalProgress?.status === 'done') {
      message.success('安装成功')
      await refreshAll()
      return
    }
    message.error(finalProgress?.message || '安装失败')
  } catch (e) {
    installing.value[name] = false
    message.error('安装失败: ' + (e?.message || '未知错误'))
  }
}

async function remove(name) {
  const r = await pluginRemove(name)
  if (r.ok) {
    message.success('删除成功')
    await refreshAll()
    return
  }
  message.error(r.error || '删除失败')
}

async function toggle(name) {
  const r = await pluginToggle(name)
  if (r.ok) {
    enabled.value[name] = r.state === 'enabled'
    state.pluginsCache.enabled = { ...enabled.value }
    message.success(r.state === 'enabled' ? '已启用' : '已禁用')
    return
  }
  message.error(r.error || '设置失败')
}

async function saveToken() {
  savingToken.value = true
  try {
    const r = await setGithubToken(token.value || '')
    if (r.ok) message.success('Token 已保存')
    else message.error('保存失败')
  } catch {
    message.error('保存失败')
  } finally {
    savingToken.value = false
  }
}

async function savePip() {
  savingPip.value = true
  try {
    const r = await setPipConfig({ pypi_index_url: pipIndexUrl.value || '' })
    if (r.ok) message.success('PyPI 镜像已保存')
    else message.error('保存失败')
  } catch {
    message.error('保存失败')
  } finally {
    savingPip.value = false
  }
}

async function saveProxy() {
  savingProxy.value = true
  try {
    const r = await setGithubProxy({ base: proxyBase.value || 'https://aki.ae-3803.com/', enabled: !!useProxy.value })
    if (r.ok) message.success('代理设置已保存')
    else message.error('保存失败')
  } catch {
    message.error('保存失败')
  } finally {
    savingProxy.value = false
  }
}

onMounted(async () => {
  if (state.pluginsCache.loaded) updateFromCache()
  else refreshAll().catch(() => {})

  try {
    const [tk, pip, proxy] = await Promise.all([getGithubToken(), getPipConfig(), getGithubProxy()])
    token.value = tk || ''
    pipIndexUrl.value = pip?.pypi_index_url || ''
    useProxy.value = !!proxy?.enabled
    proxyBase.value = proxy?.base || 'https://aki.ae-3803.com/'
  } catch {}
})
</script>

<template>
  <div class="plugins-page">
    <div class="header-row">
      <div>
        <h2 class="title">插件中心</h2>
        <NText depth="3">上次更新：{{ lastUpdatedText }}</NText>
      </div>
      <NSpace>
        <NButton secondary @click="settingShow = true">
          <template #icon><NIcon><Settings24Regular /></NIcon></template>
          设置
        </NButton>
        <NButton type="primary" secondary :loading="loading" @click="refreshAll">
          <template #icon><NIcon><ArrowClockwise24Regular /></NIcon></template>
          刷新
        </NButton>
      </NSpace>
    </div>

    <div class="toolbar">
      <NInput v-model:value="search" placeholder="搜索插件..." clearable>
        <template #prefix><NIcon><Search24Regular /></NIcon></template>
      </NInput>
      <NSelect v-model:value="filter" :options="filterOptions" class="filter-select" />
    </div>

    <NSpin :show="loading">
      <NEmpty v-if="shownList().length === 0" description="未找到相关插件" />
      <NGrid v-else x-gap="12" y-gap="12" cols="1 s:1 m:2 l:3 xl:4" responsive="screen">
        <NGridItem v-for="name in shownList()" :key="name">
          <NCard hoverable class="plugin-card">
            <template #header>
              <NSpace align="center">
                <NIcon><PlugConnected24Regular /></NIcon>
                <span>{{ name }}</span>
              </NSpace>
            </template>
            <template #header-extra>
              <NSpace>
                <NTag v-if="isInstalled(name)" type="success" size="small">
                  <template #icon><NIcon><CheckmarkCircle24Regular /></NIcon></template>
                  已安装
                </NTag>
                <NTag v-if="canUpdate(name)" type="warning" size="small">可更新</NTag>
              </NSpace>
            </template>

            <div v-if="isInstalling(name)" class="installing-area">
              <NProgress type="line" :percentage="installProgress[name]?.percent || 0" :show-indicator="false" processing />
              <NText depth="3">{{ statusText(name) }}</NText>
              <NText depth="3" class="install-log">{{ installLogs[name] || '' }}</NText>
            </div>
            <div v-else class="intro">{{ intros[name] || '暂无介绍' }}</div>

            <NSpace class="actions" justify="space-between">
              <NSpace>
                <NButton
                  v-if="!isInstalled(name)"
                  type="primary"
                  secondary
                  size="small"
                  :disabled="loading"
                  @click="install(name)"
                >
                  <template #icon><NIcon><ArrowDownload24Regular /></NIcon></template>
                  安装
                </NButton>
                <template v-else>
                  <NButton
                    :type="isEnabled(name) ? 'error' : 'success'"
                    secondary
                    size="small"
                    :disabled="loading"
                    @click="toggle(name)"
                  >
                    <template #icon>
                      <NIcon><component :is="isEnabled(name) ? PauseCircle24Regular : PlayCircle24Regular" /></NIcon>
                    </template>
                    {{ isEnabled(name) ? '禁用' : '启用' }}
                  </NButton>
                  <NButton
                    v-if="canUpdate(name)"
                    type="warning"
                    secondary
                    size="small"
                    :disabled="loading"
                    @click="install(name)"
                  >
                    更新
                  </NButton>
                  <NButton
                    type="error"
                    quaternary
                    size="small"
                    :disabled="loading"
                    @click="remove(name)"
                  >
                    <template #icon><NIcon><Delete24Regular /></NIcon></template>
                  </NButton>
                </template>
              </NSpace>
              <NButton quaternary size="small" :disabled="loading" @click="showInfo(name)">
                <template #icon><NIcon><Info24Regular /></NIcon></template>
              </NButton>
            </NSpace>
          </NCard>
        </NGridItem>
      </NGrid>
    </NSpin>

    <NDrawer v-model:show="settingShow" :width="400" placement="right">
      <NDrawerContent title="插件中心设置" closable>
        <NCard title="GitHub Token" size="small" :bordered="false">
          <NFormItem label="Personal Access Token">
            <NInput v-model:value="token" placeholder="ghp_..." type="password" show-password-on="mousedown" />
          </NFormItem>
          <NButton block type="primary" secondary :loading="savingToken" @click="saveToken">保存 Token</NButton>
        </NCard>

        <NCard title="PyPI 镜像" size="small" :bordered="false" style="margin-top: 12px">
          <NFormItem label="Index URL">
            <NInput v-model:value="pipIndexUrl" placeholder="https://pypi.tuna.tsinghua.edu.cn/simple" />
          </NFormItem>
          <NButton block type="primary" secondary :loading="savingPip" @click="savePip">保存镜像</NButton>
        </NCard>

        <NCard title="GitHub 代理" size="small" :bordered="false" style="margin-top: 12px">
          <NFormItem label="代理地址">
            <NInput v-model:value="proxyBase" placeholder="https://..." />
          </NFormItem>
          <NSpace justify="space-between" align="center">
            <NCheckbox v-model:checked="useProxy">启用代理</NCheckbox>
            <NButton type="primary" secondary size="small" :loading="savingProxy" @click="saveProxy">保存设置</NButton>
          </NSpace>
        </NCard>
      </NDrawerContent>
    </NDrawer>

    <NModal v-model:show="infoShow">
      <NCard
        :title="infoData.title"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
        style="width: 720px; max-width: 95vw"
      >
        <NSpin :show="infoLoading">
          <div class="info-section">
            <div class="info-title">介绍</div>
            <div class="info-body">{{ infoData.intro || '暂无' }}</div>
          </div>
          <div v-if="infoData.depend" class="info-section">
            <div class="info-title">依赖</div>
            <pre class="code-block">{{ infoData.depend }}</pre>
          </div>
          <div v-if="infoData.agreement" class="info-section">
            <div class="info-title">协议</div>
            <pre class="code-block">{{ infoData.agreement }}</pre>
          </div>
        </NSpin>
      </NCard>
    </NModal>
  </div>
</template>

<style scoped>
.plugins-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.title {
  margin: 0;
}

.toolbar {
  display: flex;
  gap: 12px;
}

.filter-select {
  width: 140px;
}

.plugin-card {
  height: 100%;
}

.intro {
  white-space: pre-wrap;
  color: var(--muted);
  min-height: 56px;
  line-height: 1.5;
}

.installing-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 56px;
}

.install-log {
  white-space: pre-wrap;
  font-family: var(--font-mono);
}

.actions {
  margin-top: 12px;
}

.info-section {
  margin-bottom: 16px;
}

.info-title {
  font-weight: 700;
  margin-bottom: 6px;
}

.info-body {
  white-space: pre-wrap;
}

.code-block {
  white-space: pre-wrap;
  margin: 0;
  padding: 12px;
  border-radius: 6px;
  background: var(--bg2);
}

@media (max-width: 700px) {
  .header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }
}
</style>
