<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  NButton,
  NCard,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NTag,
  NText,
  useMessage
} from 'naive-ui'
import {
  ArrowDownload24Regular,
  BookOpen24Regular,
  Folder24Regular,
  Play24Regular,
  Save24Regular,
  Stop24Regular
} from '@vicons/fluent'
import {
  jianerConfigGet,
  jianerConfigSave,
  jianerInstallRequirements,
  jianerLogs,
  jianerStart,
  jianerStatus,
  jianerStop,
  systemOpenDialog
} from '../api'
import TerminalWindow from '../components/TerminalWindow.vue'

const message = useMessage()
const isRunning = ref(false)
const loading = ref(false)
const saving = ref(false)
const installingRequirements = ref(false)
const logs = ref([])

const wsConnected = ref(false)
const logFullscreen = ref(false)
const wsRef = ref(null)
const wsRetryTimer = ref(null)
const statusTimer = ref(null)
const pollingTimer = ref(null)
const alive = ref(true)

const config = ref({
  command: 'python main.py',
  cwd: '',
  venv: '',
  shell: 'auto'
})

const shellOptions = [
  { label: '自动（Windows=cmd，Linux/macOS=bash）', value: 'auto' },
  { label: 'cmd', value: 'cmd' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'bash', value: 'bash' }
]

function mergeLines(newLines) {
  if (!Array.isArray(newLines) || !newLines.length) return
  logs.value = logs.value.concat(newLines)
  if (logs.value.length > 2000) logs.value = logs.value.slice(-2000)
}

function applySnapshot(snapshot) {
  if (!Array.isArray(snapshot)) return
  logs.value = snapshot.slice(-2000)
}

function parseWsPayload(raw) {
  try {
    const data = JSON.parse(raw)
    if (Array.isArray(data?.logs)) {
      if (data.type === 'snapshot') {
        applySnapshot(data.logs)
      } else {
        mergeLines(data.logs)
      }
      return
    }
  } catch {}
  mergeLines([raw])
}

function getWsUrl() {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}/api/jianer/logs/ws`
}

function clearRetryTimer() {
  if (!wsRetryTimer.value) return
  clearTimeout(wsRetryTimer.value)
  wsRetryTimer.value = null
}

function stopPolling() {
  if (!pollingTimer.value) return
  clearInterval(pollingTimer.value)
  pollingTimer.value = null
}

async function fetchLogsFallback() {
  try {
    const r = await jianerLogs()
    if (Array.isArray(r.logs)) {
      applySnapshot(r.logs)
    }
  } catch {}
}

function startPolling() {
  if (pollingTimer.value) return
  fetchLogsFallback().catch(() => {})
  pollingTimer.value = setInterval(() => {
    fetchLogsFallback().catch(() => {})
  }, 2000)
}

function closeWs() {
  try {
    if (wsRef.value) wsRef.value.close()
  } catch {}
  wsRef.value = null
}

function scheduleReconnect() {
  if (!alive.value || wsRetryTimer.value) return
  wsRetryTimer.value = setTimeout(() => {
    wsRetryTimer.value = null
    connectLogsWebSocket()
  }, 2000)
}

function connectLogsWebSocket() {
  if (!alive.value) return
  if (typeof WebSocket === 'undefined') {
    startPolling()
    return
  }
  closeWs()
  let ws = null
  try {
    ws = new WebSocket(getWsUrl())
  } catch {
    wsConnected.value = false
    startPolling()
    scheduleReconnect()
    return
  }
  wsRef.value = ws

  ws.onopen = () => {
    wsConnected.value = true
    stopPolling()
  }

  ws.onmessage = (event) => {
    parseWsPayload(event.data)
  }

  ws.onerror = () => {
    // onclose handles fallback/reconnect
  }

  ws.onclose = () => {
    wsConnected.value = false
    if (!alive.value) return
    startPolling()
    scheduleReconnect()
  }
}

async function refreshStatus() {
  try {
    const r = await jianerStatus()
    isRunning.value = !!r.running
  } catch {}
}

async function loadConfig() {
  try {
    const r = await jianerConfigGet()
    if (!r) return
    config.value.command = r.command || 'python main.py'
    config.value.cwd = r.cwd || ''
    config.value.venv = r.venv || ''
    config.value.shell = r.shell || 'auto'
  } catch {}
}

async function persistConfig(showToast = false) {
  await jianerConfigSave(config.value)
  if (showToast) message.success('配置已保存')
}

async function saveConfig() {
  saving.value = true
  try {
    await persistConfig(true)
  } catch (e) {
    message.error('保存失败: ' + (e?.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

async function start() {
  loading.value = true
  try {
    await persistConfig(false)
    const r = await jianerStart()
    if (r.ok) {
      message.success(`已启动（shell: ${r.shell || config.value.shell}）`)
      await refreshStatus()
      return
    }
    const detail = r?.detail ? `\n${r.detail}` : ''
    message.error('启动失败: ' + (r.error || '未知错误') + detail)
  } catch (e) {
    message.error('请求失败: ' + (e?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

async function stop() {
  loading.value = true
  try {
    const r = await jianerStop()
    if (r.ok) {
      message.success('已停止')
      await refreshStatus()
      return
    }
    message.error('停止失败: ' + (r.error || '未知错误'))
  } catch (e) {
    message.error('请求失败: ' + (e?.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

async function installRequirements() {
  installingRequirements.value = true
  try {
    await persistConfig(false)
    const r = await jianerInstallRequirements()
    if (r.ok) {
      message.success('requirements 安装完成')
      return
    }
    message.error('安装失败: ' + (r.error || '未知错误'))
  } catch (e) {
    const detail = e?.response?.data?.error || e?.message || '未知错误'
    message.error('安装失败: ' + detail)
  } finally {
    installingRequirements.value = false
  }
}

async function selectPath(field) {
  try {
    const r = await systemOpenDialog()
    if (r.ok && r.path) config.value[field] = r.path
  } catch {}
}

onMounted(() => {
  loadConfig()
  refreshStatus()
  fetchLogsFallback().catch(() => {})
  connectLogsWebSocket()
  statusTimer.value = setInterval(() => {
    refreshStatus()
  }, 2000)
})

onBeforeUnmount(() => {
  alive.value = false
  if (statusTimer.value) clearInterval(statusTimer.value)
  stopPolling()
  clearRetryTimer()
  closeWs()
})
</script>

<template>
  <div class="page-container">
    <NGrid cols="1 m:2" :x-gap="12" :y-gap="12" responsive="screen">
      <NGridItem>
        <NCard title="运行控制" size="small">
          <template #header-extra>
            <NSpace align="center">
              <NButton text tag="a" href="https://jianer.sr-studio.cn/faststart.html" target="_blank" type="primary" size="small">
                <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
                查看文档
              </NButton>
              <NTag :type="isRunning ? 'success' : 'error'">
                {{ isRunning ? '运行中' : '已停止' }}
              </NTag>
            </NSpace>
          </template>

          <NSpace>
            <NButton type="primary" @click="start" :disabled="isRunning || loading">
              <template #icon><NIcon><Play24Regular /></NIcon></template>
              启动
            </NButton>
            <NButton type="error" @click="stop" :disabled="!isRunning || loading">
              <template #icon><NIcon><Stop24Regular /></NIcon></template>
              停止
            </NButton>
          </NSpace>
        </NCard>

        <NCard title="启动配置" size="small" style="margin-top: 12px">
          <NForm label-placement="left" label-width="90">
            <NFormItem label="启动命令">
              <NInput v-model:value="config.command" placeholder="例如: python main.py" />
            </NFormItem>
            <NFormItem label="Shell">
              <NSelect v-model:value="config.shell" :options="shellOptions" />
            </NFormItem>
            <NFormItem label="工作目录">
              <NInput v-model:value="config.cwd" placeholder="例如: D:\\Jianer_QQ_bot">
                <template #suffix>
                  <NButton text @click="selectPath('cwd')">
                    <template #icon><NIcon><Folder24Regular /></NIcon></template>
                  </NButton>
                </template>
              </NInput>
            </NFormItem>
            <NFormItem label="venv 路径">
              <NInput v-model:value="config.venv" placeholder="例如: D:\\Jianer_QQ_bot\\.venv">
                <template #suffix>
                  <NButton text @click="selectPath('venv')">
                    <template #icon><NIcon><Folder24Regular /></NIcon></template>
                  </NButton>
                </template>
              </NInput>
            </NFormItem>
            <NFormItem>
              <NText depth="3">建议自动模式：Windows 默认 cmd，Linux/macOS 默认 bash。</NText>
            </NFormItem>
            <NFormItem>
              <NSpace>
                <NButton type="primary" secondary @click="saveConfig" :loading="saving">
                  <template #icon><NIcon><Save24Regular /></NIcon></template>
                  保存配置
                </NButton>
                <NButton type="warning" secondary @click="installRequirements" :loading="installingRequirements">
                  <template #icon><NIcon><ArrowDownload24Regular /></NIcon></template>
                  一键安装 requirements
                </NButton>
              </NSpace>
            </NFormItem>
          </NForm>
        </NCard>
      </NGridItem>

      <NGridItem>
        <NCard title="实时日志" size="small" content-style="padding: 0;">
          <template #header-extra>
            <NSpace align="center">
              <NTag size="small" :type="wsConnected ? 'success' : 'warning'">
                {{ wsConnected ? 'WebSocket' : '轮询' }}
              </NTag>
              <NButton size="small" secondary @click="logFullscreen = true">全屏</NButton>
            </NSpace>
          </template>
          <TerminalWindow :lines="logs" height="400px" />
        </NCard>
      </NGridItem>
    </NGrid>

    <NModal v-model:show="logFullscreen" preset="card" :bordered="false" title="简儿实时日志" style="width: 96vw; max-width: 96vw;">
      <template #header-extra>
        <NButton size="small" secondary @click="logFullscreen = false">退出全屏</NButton>
      </template>
      <TerminalWindow :lines="logs" height="80vh" />
    </NModal>
  </div>
</template>

<style scoped>
.page-container {
  padding: 10px;
}
</style>
