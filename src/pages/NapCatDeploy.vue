<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  NAlert,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NCode,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NProgress,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  NTag,
  NText,
  useMessage
} from 'naive-ui'
import { FolderOpen24Regular } from '@vicons/fluent'
import TerminalWindow from '../components/TerminalWindow.vue'
import {
  getNapcatConfig,
  getSystemInfo,
  napcatCancel,
  napcatDeploy,
  napcatLogs,
  napcatProgress,
  napcatSetPath,
  napcatStart,
  napcatStatus,
  napcatStop,
  napcatWebui,
  setNapcatConfig,
  systemOpenDialog
} from '../api'

const message = useMessage()

const systemInfo = ref(null)
const napcatConfig = ref(null)
const loading = ref(false)
const running = ref(false)
const installPath = ref('')
const runtimeLogs = ref([])
const activeTab = ref('manage')
const deployTab = ref('windows')
const customBase = ref('')
const manualPath = ref('')

const form = reactive({
  docker: false,
  qq: '',
  mode: 'ws',
  proxy: 0,
  cli: false,
  force: false,
  confirm: true,
  useSudo: true,
  installPath: ''
})

const result = reactive({
  script: '',
  jobId: '',
  status: '',
  percent: 0,
  message: '',
  logs: []
})

const runningStates = ['queued', 'preparing', 'downloading', 'extracting', 'running']
let deployPollTimer = 0
let statusTimer = 0

const isDeploying = computed(() => runningStates.includes(result.status))
const proxyOptions = computed(() => {
  const max = deployTab.value === 'docker' || form.docker ? 7 : 5
  return Array.from({ length: max + 1 }).map((_, index) => ({
    label: index === 0 ? '自动选择（推荐）' : String(index),
    value: index
  }))
})

const platformOptions = [
  { label: 'Windows', value: 'windows' },
  { label: 'Linux', value: 'linux' },
  { label: 'macOS', value: 'macos' },
  { label: 'Docker', value: 'docker' },
  { label: 'Termux', value: 'termux' }
]

const napcatDocsUrl = 'https://napneko.github.io/guide/napcat'

function stopDeployPoll() {
  if (deployPollTimer) {
    window.clearInterval(deployPollTimer)
    deployPollTimer = 0
  }
}

function resetDeployResult() {
  result.script = ''
  result.jobId = ''
  result.status = ''
  result.percent = 0
  result.message = ''
  result.logs = []
}

async function refreshBaseInfo() {
  try {
    const [sys, cfg] = await Promise.all([getSystemInfo(), getNapcatConfig()])
    systemInfo.value = sys
    napcatConfig.value = cfg
    if (!installPath.value) {
      deployTab.value = platformOptions.some((item) => item.value === sys.platform) ? sys.platform : 'windows'
    }
  } catch (error) {
    message.error(error?.message || '读取系统信息失败')
  }
  await refreshRuntimeStatus()
}

async function refreshRuntimeStatus() {
  try {
    const runtime = await napcatStatus()
    running.value = !!runtime.running
    installPath.value = runtime.install_path || ''
    if (activeTab.value === 'manage') {
      await refreshRuntimeLogs()
    }
  } catch (error) {
    message.error(error?.message || '读取运行状态失败')
  }
}

async function refreshRuntimeLogs() {
  try {
    const response = await napcatLogs()
    runtimeLogs.value = Array.isArray(response?.logs) ? response.logs : []
  } catch {
    runtimeLogs.value = []
  }
}

async function startRuntime() {
  loading.value = true
  try {
    const response = await napcatStart()
    if (!response?.ok) {
      message.error(response?.error || '启动失败')
      return
    }
    message.success('NapCat 已启动')
    await refreshRuntimeStatus()
  } finally {
    loading.value = false
  }
}

async function stopRuntime() {
  loading.value = true
  try {
    const response = await napcatStop()
    if (!response?.ok) {
      message.error(response?.error || '停止失败')
      return
    }
    message.success('NapCat 已停止')
    await refreshRuntimeStatus()
  } finally {
    loading.value = false
  }
}

async function openWebUI() {
  try {
    const response = await napcatWebui()
    if (response?.ok && response?.url) {
      window.open(response.url, '_blank')
      return
    }
    message.error(response?.error || '无法获取 WebUI 地址')
  } catch (error) {
    message.error(error?.message || '打开 WebUI 失败')
  }
}

function openNapcatDocs() {
  window.open(napcatDocsUrl, '_blank')
}

async function chooseManualPath() {
  loading.value = true
  try {
    const response = await systemOpenDialog()
    if (response?.ok && response?.path) {
      manualPath.value = response.path
    }
  } finally {
    loading.value = false
  }
}

async function chooseInstallPath() {
  loading.value = true
  try {
    const response = await systemOpenDialog()
    if (response?.ok && response?.path) {
      form.installPath = response.path
    }
  } finally {
    loading.value = false
  }
}

async function applyManualPath() {
  if (!manualPath.value) return
  loading.value = true
  try {
    const response = await napcatSetPath(manualPath.value)
    if (!response?.ok) {
      message.error(response?.error || '路径无效')
      return
    }
    message.success('安装路径已更新')
    manualPath.value = ''
    await refreshRuntimeStatus()
  } finally {
    loading.value = false
  }
}

async function saveSourceBase(base) {
  try {
    await setNapcatConfig({ installer_base: base })
    napcatConfig.value = await getNapcatConfig()
  } catch (error) {
    message.error(error?.message || '保存镜像源失败')
  }
}

async function addSourceBase() {
  const value = String(customBase.value || '').trim()
  if (!value) return
  loading.value = true
  try {
    const response = await setNapcatConfig({ installer_base: value })
    if (!response?.ok) {
      message.error(response?.error || '添加镜像源失败')
      return
    }
    customBase.value = ''
    napcatConfig.value = await getNapcatConfig()
  } finally {
    loading.value = false
  }
}

function buildDeployPayload(action) {
  const payload = {
    platform: deployTab.value,
    action,
    docker: deployTab.value === 'docker' ? true : form.docker,
    qq: form.qq,
    mode: form.mode,
    cli: form.cli,
    force: form.force,
    confirm: form.confirm,
    use_sudo: form.useSudo
  }

  if (deployTab.value !== 'windows' && form.installPath) {
    payload.install_path = form.installPath
  }
  if ((deployTab.value === 'linux' || deployTab.value === 'macos' || deployTab.value === 'docker') && Number(form.proxy) > 0) {
    payload.proxy = Number(form.proxy)
  }
  return payload
}

async function startDeploy(action = 'auto') {
  stopDeployPoll()
  resetDeployResult()
  loading.value = true
  try {
    const response = await napcatDeploy(buildDeployPayload(action))
    if (!response?.ok) {
      result.status = 'error'
      result.message = response?.error || '部署失败'
      message.error(result.message)
      return
    }

    result.script = response.script || ''

    if (response.downgraded) {
      result.status = 'done'
      result.message = response.message || '已生成执行脚本，请手动执行'
      message.warning(result.message)
      return
    }

    if (action === 'script') {
      result.status = 'done'
      result.message = '脚本生成成功'
      message.success(result.message)
      return
    }

    result.jobId = response.job_id
    result.status = 'queued'
    result.percent = 0
    result.message = '任务已进入队列'

    deployPollTimer = window.setInterval(async () => {
      try {
        const progress = await napcatProgress(result.jobId)
        result.status = progress.status || ''
        result.percent = Number(progress.percent || 0)
        result.message = progress.message || ''
        result.logs = Array.isArray(progress.logs) ? progress.logs : []

        if (!runningStates.includes(result.status)) {
          stopDeployPoll()
          await refreshRuntimeStatus()

          if (result.status === 'done') {
            if (installPath.value) {
              message.success('安装任务完成')
              activeTab.value = 'manage'
            } else {
              message.error('任务完成但未检测到安装路径，请手动指定路径')
            }
          } else if (result.status === 'canceled') {
            message.warning('安装任务已取消')
          } else {
            message.error(result.message || '安装任务失败')
          }
        }
      } catch {
        stopDeployPoll()
      }
    }, 900)
  } finally {
    loading.value = false
  }
}

async function cancelDeploy() {
  if (!result.jobId) return
  try {
    await napcatCancel(result.jobId)
  } catch {}
}

onMounted(() => {
  refreshBaseInfo()
  statusTimer = window.setInterval(refreshRuntimeStatus, 3000)
})

onBeforeUnmount(() => {
  stopDeployPoll()
  if (statusTimer) window.clearInterval(statusTimer)
})
</script>

<template>
  <NCard title="NapCat 管理与部署">
    <template #header-extra>
      <NButton tertiary size="small" @click="openNapcatDocs">NapCat 文档</NButton>
    </template>
    <NTabs v-model:value="activeTab" type="line" animated>
      <NTabPane name="manage" tab="管理面板">
        <NSpace vertical size="large">
          <NCard size="small">
            <NSpace align="center" justify="space-between">
              <NSpace align="center">
                <NTag :type="running ? 'success' : 'error'">{{ running ? '运行中' : '已停止' }}</NTag>
                <NText v-if="installPath">安装路径：{{ installPath }}</NText>
                <NText v-else type="warning">未检测到安装路径，请先安装或手动指定</NText>
              </NSpace>
              <NSpace>
                <NButton type="info" secondary :disabled="!running" @click="openWebUI">打开 WebUI</NButton>
                <NButton type="success" :disabled="!installPath || running" :loading="loading" @click="startRuntime">启动</NButton>
                <NButton type="error" :disabled="!installPath || !running" :loading="loading" @click="stopRuntime">停止</NButton>
                <NButton tertiary @click="refreshRuntimeLogs">刷新日志</NButton>
              </NSpace>
            </NSpace>

            <NCollapse v-if="!installPath">
              <NCollapseItem title="手动指定安装路径" name="manual-path">
                <NSpace>
                  <NInput v-model:value="manualPath" placeholder="输入已存在的 NapCat 安装目录" style="width: 420px" />
                  <NButton v-if="systemInfo?.platform === 'windows'" secondary :loading="loading" @click="chooseManualPath">
                    <template #icon><NIcon><FolderOpen24Regular /></NIcon></template>
                    浏览
                  </NButton>
                  <NButton type="primary" secondary :loading="loading" @click="applyManualPath">确认并加载</NButton>
                </NSpace>
              </NCollapseItem>
            </NCollapse>
          </NCard>

          <NCard size="small" title="运行日志">
            <TerminalWindow :lines="runtimeLogs" font-family="var(--font-mono)" />
          </NCard>
        </NSpace>
      </NTabPane>

      <NTabPane name="deploy" tab="安装部署">
        <NSpace vertical size="large">
          <NSpace align="center" justify="space-between" :wrap="true">
            <NSpace>
              <NTag v-if="systemInfo?.platform" type="info">{{ systemInfo.platform }}</NTag>
              <NTag :type="systemInfo?.is_admin ? 'success' : 'warning'">
                {{ systemInfo?.is_admin ? '管理员/Root' : '非管理员' }}
              </NTag>
              <NText v-if="systemInfo?.system">{{ systemInfo.system }} {{ systemInfo.release }} · {{ systemInfo.machine }}</NText>
            </NSpace>
            <NButton tertiary size="small" @click="refreshBaseInfo">刷新检测</NButton>
          </NSpace>

          <NCard size="small" title="下载源设置">
            <NSpace vertical>
              <NText depth="3">Windows 一键包从官方 Release 下载；Linux/macOS/Docker 可切换安装脚本源。</NText>
              <NSpace align="center" justify="space-between" :wrap="true">
                <NSelect
                  style="width: 100%; max-width: 620px"
                  :options="(napcatConfig?.bases || napcatConfig?.recommended_bases || []).map((item) => ({ label: item, value: item }))"
                  :value="napcatConfig?.installer_base"
                  placeholder="选择安装脚本源"
                  @update:value="saveSourceBase"
                />
                <NSpace>
                  <NInput v-model:value="customBase" style="width: 320px" placeholder="输入自定义脚本源 URL" />
                  <NButton tertiary :loading="loading" @click="addSourceBase">添加</NButton>
                </NSpace>
              </NSpace>
            </NSpace>
          </NCard>

          <NTabs v-model:value="deployTab" type="segment">
            <NTabPane v-for="item in platformOptions" :key="item.value" :name="item.value" :tab="item.label">
              <NSpace vertical size="large">
                <NAlert type="info" :show-icon="false">
                  <template v-if="item.value === 'windows'">Windows 使用 OneKey 自动下载并运行安装器。</template>
                  <template v-else-if="item.value === 'docker'">Docker 模式建议配置 QQ 号与运行模式。</template>
                  <template v-else-if="item.value === 'termux'">Termux 建议使用官方 install.termux.sh。</template>
                  <template v-else-if="item.value === 'linux'">Linux 仅支持 Ubuntu 22+ / Debian 10+，使用 install.sh，支持 CLI、代理、强制安装参数。</template>
                  <template v-else>Linux/macOS 使用 install.sh，支持 CLI、代理、强制安装参数。</template>
                </NAlert>

                <NForm label-width="140">
                  <NFormItem v-if="item.value === 'windows'" label="安装目录">
                    <NText depth="3">Windows OneKey 固定在 `./NapCatQQ` 目录执行。</NText>
                  </NFormItem>

                  <NFormItem v-else-if="item.value !== 'linux'" label="安装目录">
                    <NSpace :wrap="false" align="center">
                      <NInput
                        v-model:value="form.installPath"
                        placeholder="例如 D:\\NapCat 或 /opt/napcat"
                        style="width: 520px; max-width: 70vw"
                      />
                      <NButton v-if="systemInfo?.platform === 'windows'" secondary :loading="loading" @click="chooseInstallPath">
                        <template #icon><NIcon><FolderOpen24Regular /></NIcon></template>
                        浏览
                      </NButton>
                    </NSpace>
                  </NFormItem>

                  <NFormItem v-if="item.value === 'linux' || item.value === 'macos'" label="安装方式">
                    <NSelect
                      :options="[
                        { label: 'Shell（本机安装）', value: false },
                        { label: 'Docker（容器安装）', value: true }
                      ]"
                      :value="form.docker"
                      @update:value="(value) => (form.docker = value)"
                    />
                  </NFormItem>

                  <template v-if="item.value === 'docker' || form.docker">
                    <NFormItem label="QQ 号">
                      <NInput v-model:value="form.qq" placeholder="例如 123456789" />
                    </NFormItem>
                    <NFormItem label="运行模式">
                      <NSelect
                        :options="['ws', 'reverse_ws', 'reverse_http'].map((mode) => ({ label: mode, value: mode }))"
                        v-model:value="form.mode"
                      />
                    </NFormItem>
                    <NFormItem label="确认执行">
                      <NSelect :options="[{ label: '是', value: true }, { label: '否', value: false }]" v-model:value="form.confirm" />
                    </NFormItem>
                  </template>

                  <template v-else-if="item.value === 'linux' || item.value === 'macos'">
                    <NFormItem label="安装 CLI">
                      <NSelect :options="[{ label: '是', value: true }, { label: '否', value: false }]" v-model:value="form.cli" />
                    </NFormItem>
                    <NFormItem label="强制重装">
                      <NSelect :options="[{ label: '是', value: true }, { label: '否', value: false }]" v-model:value="form.force" />
                    </NFormItem>
                    <NFormItem label="使用 sudo">
                      <NSelect :options="[{ label: '是', value: true }, { label: '否', value: false }]" v-model:value="form.useSudo" />
                    </NFormItem>
                  </template>

                  <NFormItem v-if="item.value === 'linux' || item.value === 'macos' || item.value === 'docker'" label="代理编号">
                    <NSelect :options="proxyOptions" v-model:value="form.proxy" />
                  </NFormItem>
                </NForm>

                <NSpace justify="end">
                  <NButton v-if="isDeploying" secondary @click="cancelDeploy">取消任务</NButton>
                  <NButton secondary :loading="loading" @click="startDeploy('script')">生成脚本</NButton>
                  <NButton type="primary" :loading="loading" @click="startDeploy('auto')">开始安装</NButton>
                </NSpace>

                <NCard size="small" title="部署输出">
                  <NText v-if="result.message" depth="3">{{ result.message }}</NText>
                  <NCode v-if="result.script" :code="result.script" language="bash" style="margin-top: 8px" />
                  <TerminalWindow
                    :lines="result.logs.length ? result.logs : (result.message ? [result.message] : [])"
                    font-family="var(--font-mono)"
                    style="margin-top: 10px"
                  />
                  <NProgress v-if="result.status" type="line" :percentage="result.percent" :height="4" :show-indicator="false" style="margin-top: 10px" />
                </NCard>
              </NSpace>
            </NTabPane>
          </NTabs>
        </NSpace>
      </NTabPane>
    </NTabs>
  </NCard>
</template>

<style scoped>
</style>
