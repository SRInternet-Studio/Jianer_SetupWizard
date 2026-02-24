<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NGrid, NGridItem, NIcon, NSpace, NTag, useMessage } from 'naive-ui'
import {
  Bot24Regular,
  BookOpen24Regular,
  Open24Regular,
  PlugConnected24Regular,
  Play24Regular,
  Settings24Regular,
  Info24Regular,
  Desktop24Regular
} from '@vicons/fluent'
import { napcatStatus, napcatWebui, jianerStatus, jianerStart, jianerStop } from '../api'

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const napcatRunning = ref(false)
const napcatInstallPath = ref('')
const jianerRunning = ref(false)
const jianerLoading = ref(false)

const refreshStatus = async () => {
  loading.value = true
  try {
    const [nap, jn] = await Promise.allSettled([napcatStatus(), jianerStatus()])
    if (nap.status === 'fulfilled') {
      napcatRunning.value = !!nap.value.running
      napcatInstallPath.value = nap.value.install_path || ''
    }
    if (jn.status === 'fulfilled') {
      jianerRunning.value = !!jn.value.running
    }
  } finally {
    loading.value = false
  }
}

const openNapcatWebui = async () => {
  try {
    const result = await napcatWebui()
    if (result?.ok && result?.url) {
      window.open(result.url, '_blank')
      return
    }
    message.error(result?.error || '无法获取 WebUI 地址')
  } catch (error) {
    message.error(error?.message || '打开 WebUI 失败')
  }
}

const startJianerRuntime = async () => {
  jianerLoading.value = true
  try {
    const result = await jianerStart()
    if (!result?.ok) {
      const detail = result?.detail ? `\n${result.detail}` : ''
      message.error((result?.error || '启动失败') + detail)
      return
    }
    message.success('Jianer 已启动')
  } finally {
    jianerLoading.value = false
    refreshStatus()
  }
}

const stopJianerRuntime = async () => {
  jianerLoading.value = true
  try {
    const result = await jianerStop()
    if (!result?.ok) {
      message.error(result?.error || '停止失败')
      return
    }
    message.success('Jianer 已停止')
  } finally {
    jianerLoading.value = false
    refreshStatus()
  }
}

const goTo = (path) => router.push(path)
const openExternal = (url) => window.open(url, '_blank')

onMounted(() => {
  refreshStatus()
})
</script>

<template>
  <div class="welcome-page">
    <div class="hero-section">
      <h1 class="hero-title">欢迎使用 Jianer WebUI</h1>
      <p class="hero-desc">本地化配置与管理面板，快速完成 NapCat 与 Jianer 的部署和运行管理。</p>
      <NSpace style="margin-top: 16px">
        <NButton type="primary" size="large" @click="goTo('/napcat')">
          <template #icon><NIcon><Play24Regular /></NIcon></template>
          开始管理
        </NButton>
        <NButton secondary size="large" @click="openExternal('https://github.com/SRInternet-Studio/Jianer_QQ_bot')">
          <template #icon><NIcon><Open24Regular /></NIcon></template>
          访问 GitHub
        </NButton>
        <NButton secondary size="large" @click="openExternal('https://jianer.sr-studio.cn/')">
          <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
          查看文档
        </NButton>
      </NSpace>
    </div>

    <NGrid cols="1 s:2 m:4" responsive="screen" :x-gap="16" :y-gap="16">
      <NGridItem span="1 s:2 m:2">
        <NCard class="status-card" title="NapCat 状态" size="medium">
          <template #header-extra>
            <NButton secondary circle size="small" :loading="loading" @click="refreshStatus">
              <template #icon><NIcon><Desktop24Regular /></NIcon></template>
            </NButton>
          </template>
          <div class="status-content">
            <div class="status-indicator" :class="{ running: napcatRunning }">
              <div class="status-dot" />
              <div class="status-text">
                <div class="status-title">{{ napcatRunning ? 'NapCat 正在运行' : 'NapCat 已停止' }}</div>
                <div class="status-path">{{ napcatInstallPath || '未检测到安装路径' }}</div>
              </div>
            </div>
            <NSpace>
              <NButton v-if="napcatRunning" type="info" secondary @click="openNapcatWebui">打开 WebUI</NButton>
              <NButton type="primary" secondary @click="goTo('/napcat')">{{ napcatRunning ? '管理实例' : '去部署' }}</NButton>
            </NSpace>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem span="1 s:2 m:2">
        <NCard class="status-card" title="Jianer 状态" size="medium">
          <template #header-extra>
            <NButton secondary circle size="small" :loading="loading || jianerLoading" @click="refreshStatus">
              <template #icon><NIcon><Bot24Regular /></NIcon></template>
            </NButton>
          </template>
          <div class="status-content">
            <div class="status-indicator" :class="{ running: jianerRunning }">
              <div class="status-dot" />
              <div class="status-text">
                <div class="status-title">{{ jianerRunning ? 'Jianer 正在运行' : 'Jianer 已停止' }}</div>
                <div class="status-path">在管理页可设置启动命令和工作目录。</div>
              </div>
            </div>
            <NSpace>
              <NButton v-if="!jianerRunning" type="success" secondary :loading="jianerLoading" @click="startJianerRuntime">启动</NButton>
              <NButton v-else type="error" secondary :loading="jianerLoading" @click="stopJianerRuntime">停止</NButton>
              <NButton type="primary" secondary @click="goTo('/jianer')">管理</NButton>
            </NSpace>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem>
        <NCard class="action-card" hoverable @click="goTo('/plugins')">
          <div class="action-content">
            <div class="action-icon action-icon-purple"><NIcon size="24"><PlugConnected24Regular /></NIcon></div>
            <div>
              <div class="action-title">插件中心</div>
              <div class="action-desc">安装与管理插件</div>
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem>
        <NCard class="action-card" hoverable @click="goTo('/basic')">
          <div class="action-content">
            <div class="action-icon action-icon-blue"><NIcon size="24"><Settings24Regular /></NIcon></div>
            <div>
              <div class="action-title">基础设置</div>
              <div class="action-desc">修改核心配置</div>
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem>
        <NCard class="action-card" hoverable @click="goTo('/ai')">
          <div class="action-content">
            <div class="action-icon action-icon-green"><NIcon size="24"><Bot24Regular /></NIcon></div>
            <div>
              <div class="action-title">AI 配置</div>
              <div class="action-desc">模型与对话参数</div>
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem>
        <NCard class="action-card" hoverable @click="goTo('/about')">
          <div class="action-content">
            <div class="action-icon action-icon-orange"><NIcon size="24"><Info24Regular /></NIcon></div>
            <div>
              <div class="action-title">关于项目</div>
              <div class="action-desc">版本与说明</div>
            </div>
          </div>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.welcome-page {
  padding: 4px;
}

.hero-section {
  margin-bottom: 24px;
  padding: 40px 0;
}

.hero-title {
  margin: 0 0 12px;
  font-size: 32px;
  font-weight: 800;
}

.hero-desc {
  margin: 0;
  max-width: 720px;
  color: var(--muted);
}

.status-card {
  height: 100%;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--stroke);
  border-radius: 12px;
}

.status-indicator.running {
  border-color: color-mix(in srgb, var(--accent2) 30%, var(--stroke));
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d03050;
}

.status-indicator.running .status-dot {
  background: #18a058;
}

.status-text {
  min-width: 0;
}

.status-title {
  font-size: 15px;
  font-weight: 650;
}

.status-path {
  color: var(--muted);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-card {
  height: 100%;
  cursor: pointer;
}

.action-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.action-icon-purple { color: #8a2be2; background: rgba(138, 43, 226, 0.12); }
.action-icon-blue { color: #0078d4; background: rgba(0, 120, 212, 0.12); }
.action-icon-green { color: #107c10; background: rgba(16, 124, 16, 0.12); }
.action-icon-orange { color: #d83b01; background: rgba(216, 59, 1, 0.12); }

.action-title {
  font-size: 16px;
  font-weight: 650;
}

.action-desc {
  color: var(--muted);
  font-size: 12px;
}
</style>
