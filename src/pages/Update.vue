<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { NCard, NButton, NProgress, useMessage, NIcon, NSwitch, NInput } from 'naive-ui'
import { ArrowSync24Regular, ArrowDownload24Regular, CheckmarkCircle24Regular, Info24Regular, ErrorCircle24Regular, Sparkle24Regular } from '@vicons/fluent'
import { checkUpdate, executeUpdate, getVersion, updateProgress, getUpdateMirror, setUpdateMirror } from '../api'

const message = useMessage()
const currentVersion = ref('')
const checking = ref(false)
const executing = ref(false)
const hasUpdate = ref(false)
const releaseUrl = ref('')
const latestVersion = ref('')
const updateMessage = ref('未检查更新')
const jobId = ref('')
const progressPercent = ref(0)
const progressStatus = ref('default')
let progressTimer = null
const mirrorEnabled = ref(true)
const mirrorBase = ref('')
const mirrorLoading = ref(false)
const mirrorSaving = ref(false)
const mirrorFeedback = ref('')
const mirrorFeedbackType = ref('default')

const statusType = computed(() => {
  if (progressStatus.value === 'error') return 'error'
  if (progressStatus.value === 'done') return 'success'
  if (progressStatus.value === 'checking') return 'info'
  if (executing.value) return 'warning'
  return 'default'
})

const statusIcon = computed(() => {
  if (progressStatus.value === 'error') return ErrorCircle24Regular
  if (progressStatus.value === 'done') return CheckmarkCircle24Regular
  if (progressStatus.value === 'checking' || executing.value) return ArrowSync24Regular
  return Sparkle24Regular
})

const openUrl = (url) => {
  window.open(url, '_blank')
}

const stopProgressPolling = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const loadVersion = async () => {
  try {
    const result = await getVersion()
    currentVersion.value = result?.version || result?.backend_version || ''
  } catch {
    currentVersion.value = ''
  }
}

const refreshUpdateStatus = async (silent = false) => {
  checking.value = true
  progressStatus.value = 'checking'
  try {
    const result = await checkUpdate()
    if (!result?.ok) {
      throw new Error(result?.error || '检查更新失败')
    }
    hasUpdate.value = !!result.has_update
    latestVersion.value = result.latest_version || ''
    releaseUrl.value = result.release_url || ''
    updateMessage.value = hasUpdate.value
      ? `发现新版本 ${latestVersion.value || '未知版本'}`
      : '当前已是最新版本'
    progressStatus.value = hasUpdate.value ? 'warning' : 'done'
    progressPercent.value = hasUpdate.value ? 0 : 100
    if (!silent) {
      message.success('更新状态已刷新')
    }
  } catch (error) {
    progressStatus.value = 'error'
    updateMessage.value = error?.message || '检查更新失败'
    if (!silent) {
      message.error(updateMessage.value)
    }
  } finally {
    checking.value = false
  }
}

const syncProgress = async (id) => {
  const result = await updateProgress(id)
  progressPercent.value = Number(result?.percent || 0)
  progressStatus.value = result?.status || 'default'
  updateMessage.value = result?.message || '处理中'
  latestVersion.value = result?.target_version || latestVersion.value
  if (['done', 'error'].includes(progressStatus.value)) {
    executing.value = false
    stopProgressPolling()
    if (progressStatus.value === 'done') {
      message.success(updateMessage.value)
      loadVersion()
    } else {
      message.error(updateMessage.value)
    }
  }
}

const startProgressPolling = (id) => {
  stopProgressPolling()
  progressTimer = setInterval(() => {
    syncProgress(id).catch(() => {})
  }, 1500)
}

const runAutoUpdate = async () => {
  executing.value = true
  progressPercent.value = 0
  progressStatus.value = 'running'
  updateMessage.value = '正在创建更新任务...'
  try {
    const result = await executeUpdate()
    if (!result?.ok || !result?.job_id) {
      throw new Error(result?.error || '启动更新失败')
    }
    jobId.value = result.job_id
    await syncProgress(jobId.value)
    if (executing.value) {
      startProgressPolling(jobId.value)
    }
  } catch (error) {
    executing.value = false
    progressStatus.value = 'error'
    updateMessage.value = error?.message || '启动更新失败'
    message.error(updateMessage.value)
  }
}

const loadUpdateMirrorConfig = async () => {
  mirrorLoading.value = true
  try {
    const result = await getUpdateMirror()
    if (!result?.ok) {
      throw new Error(result?.error || '读取镜像源设置失败')
    }
    mirrorEnabled.value = !!(result.enabled ?? result.update_mirror_enabled)
    mirrorBase.value = result.base || result.update_mirror_base || ''
  } catch (error) {
    mirrorFeedbackType.value = 'error'
    mirrorFeedback.value = error?.message || '读取镜像源设置失败'
  } finally {
    mirrorLoading.value = false
  }
}

const saveUpdateMirrorConfig = async () => {
  mirrorSaving.value = true
  mirrorFeedback.value = ''
  try {
    const result = await setUpdateMirror({
      enabled: mirrorEnabled.value,
      base: mirrorBase.value
    })
    if (!result?.ok) {
      throw new Error(result?.error || '保存镜像源设置失败')
    }
    mirrorEnabled.value = !!(result.enabled ?? mirrorEnabled.value)
    mirrorBase.value = result.base ?? mirrorBase.value
    mirrorFeedbackType.value = 'success'
    mirrorFeedback.value = '镜像源设置已保存'
    message.success('镜像源设置已保存')
  } catch (error) {
    mirrorFeedbackType.value = 'error'
    mirrorFeedback.value = error?.message || '保存镜像源设置失败'
    message.error(mirrorFeedback.value)
  } finally {
    mirrorSaving.value = false
  }
}

onMounted(async () => {
  await loadVersion()
  await loadUpdateMirrorConfig()
  await refreshUpdateStatus(true)
})

onBeforeUnmount(() => {
  stopProgressPolling()
})
</script>

<template>
  <div class="update-page">
    <div class="header-section">
      <div class="header-bg">
        <div class="glow glow-1"></div>
        <div class="glow glow-2"></div>
        <div class="mesh-grid"></div>
      </div>
      <div class="header-content">
        <div class="icon-wrapper">
          <NIcon size="48"><ArrowSync24Regular /></NIcon>
        </div>
        <h1 class="page-title">系统更新</h1>
        <p class="page-desc">保持系统处于最新状态，获取最新功能与修复</p>
        
        <div class="version-badges">
          <div class="version-badge current">
            <span class="badge-label">当前版本</span>
            <span class="badge-value">{{ currentVersion || '未知' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <NCard class="update-card" :bordered="false">
        <div class="status-container" :class="statusType">
          <div class="status-icon-area">
            <NIcon size="32" :class="{'spin': statusType === 'info' || statusType === 'warning' && executing}"><component :is="statusIcon" /></NIcon>
          </div>
          <div class="status-info">
            <div class="status-title">{{ updateMessage }}</div>
            <div class="status-meta" v-if="latestVersion">目标版本: {{ latestVersion }}</div>
          </div>
          
          <div class="status-action" v-if="!executing && !checking && statusType === 'default'">
             <NButton secondary type="primary" size="small" @click="refreshUpdateStatus(false)">立即检查</NButton>
          </div>
        </div>

        <div class="progress-container" v-if="executing || progressPercent > 0">
          <div class="progress-header">
            <span class="progress-label">更新进度</span>
            <span class="progress-value">{{ progressPercent }}%</span>
          </div>
          <NProgress 
            type="line" 
            :percentage="progressPercent" 
            :status="statusType" 
            :show-indicator="false" 
            processing
            :height="12"
            border-radius="6px"
          />
        </div>

        <div class="action-bar">
          <div class="mirror-settings">
            <div class="mirror-header">
              <div class="mirror-title">更新镜像源</div>
              <NSwitch v-model:value="mirrorEnabled" :loading="mirrorLoading">
                <template #checked>已启用</template>
                <template #unchecked>已关闭</template>
              </NSwitch>
            </div>
            <div class="mirror-desc">启用后，系统更新请求将优先使用镜像地址；关闭后将直接访问默认源。</div>
            <div class="mirror-form">
              <NInput
                v-model:value="mirrorBase"
                :disabled="mirrorLoading || mirrorSaving"
                placeholder="https://example.com/"
                clearable
              />
              <NButton
                type="primary"
                :loading="mirrorSaving"
                :disabled="mirrorLoading || mirrorSaving"
                @click="saveUpdateMirrorConfig"
              >
                保存镜像源
              </NButton>
            </div>
            <div v-if="mirrorFeedback" class="mirror-feedback" :class="mirrorFeedbackType">{{ mirrorFeedback }}</div>
          </div>

          <div class="action-grid">
            <NButton 
              size="large" 
              type="primary" 
              secondary 
              class="action-btn"
              :loading="checking" 
              :disabled="executing" 
              @click="refreshUpdateStatus(false)"
            >
              <template #icon><NIcon><ArrowSync24Regular /></NIcon></template>
              检查更新
            </NButton>
            
            <NButton 
              size="large" 
              type="primary" 
              class="action-btn primary-action"
              :loading="executing" 
              :disabled="!hasUpdate || checking || executing" 
              @click="runAutoUpdate"
            >
              <template #icon><NIcon><ArrowDownload24Regular /></NIcon></template>
              立即更新
            </NButton>
            
            <NButton 
              size="large" 
              secondary 
              class="action-btn"
              :disabled="!releaseUrl" 
              @click="openUrl(releaseUrl)"
            >
              <template #icon><NIcon><Info24Regular /></NIcon></template>
              查看发布页
            </NButton>
          </div>
        </div>
      </NCard>
    </div>
  </div>
</template>

<style scoped>
.update-page {
  padding: 24px;
  max-width: 720px;
  margin: 0 auto;
}

.header-section {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  padding: 56px 32px;
  text-align: center;
  margin-bottom: 32px;
  background: var(--surface2);
  border: 1px solid var(--border);
  box-shadow: 0 12px 32px rgba(0,0,0,0.03);
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
}

.glow-1 {
  top: -20%;
  left: -10%;
  width: 50%;
  height: 80%;
  background: rgba(0, 120, 212, 0.4);
}

.glow-2 {
  bottom: -30%;
  right: -10%;
  width: 60%;
  height: 80%;
  background: rgba(138, 43, 226, 0.2);
}

.mesh-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.4;
}

.header-content {
  position: relative;
  z-index: 1;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(var(--primary-color-rgb, 0, 120, 212), 0.1), rgba(var(--primary-color-rgb, 0, 120, 212), 0.02));
  color: var(--primary-color);
  margin-bottom: 24px;
  box-shadow: 0 12px 32px rgba(var(--primary-color-rgb, 0, 120, 212), 0.12);
  border: 1px solid rgba(var(--primary-color-rgb, 0, 120, 212), 0.2);
  backdrop-filter: blur(8px);
}

.page-title {
  font-size: 36px;
  font-weight: 900;
  margin: 0 0 12px;
  background: linear-gradient(135deg, var(--text-color) 0%, color-mix(in srgb, var(--text-color) 60%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

.page-desc {
  font-size: 16px;
  color: var(--muted);
  margin: 0 0 36px;
  line-height: 1.6;
}

.version-badges {
  display: flex;
  justify-content: center;
}

.version-badge {
  display: inline-flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 100px;
  overflow: hidden;
  font-size: 15px;
  font-family: var(--font-mono);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.badge-label {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.03);
  color: var(--muted);
  font-weight: 600;
}

html[data-theme="dark"] .badge-label {
  background: rgba(255, 255, 255, 0.05);
}

.badge-value {
  padding: 8px 20px;
  font-weight: 700;
}

.version-badge.current .badge-value {
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb, 0, 120, 212), 0.05);
}

.update-card {
  border-radius: 28px;
  background: var(--surface2);
  border: 1px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.update-card :deep(.n-card__content) {
  padding: 32px;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  margin-bottom: 32px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-container.success {
  background: rgba(24, 160, 88, 0.04);
  border-color: rgba(24, 160, 88, 0.2);
}
.status-container.success .status-icon-area { color: #18a058; background: rgba(24, 160, 88, 0.1); }

.status-container.warning {
  background: rgba(240, 160, 32, 0.04);
  border-color: rgba(240, 160, 32, 0.2);
}
.status-container.warning .status-icon-area { color: #f0a020; background: rgba(240, 160, 32, 0.1); }

.status-container.error {
  background: rgba(208, 48, 80, 0.04);
  border-color: rgba(208, 48, 80, 0.2);
}
.status-container.error .status-icon-area { color: #d03050; background: rgba(208, 48, 80, 0.1); }

.status-container.info {
  background: rgba(var(--primary-color-rgb, 0, 120, 212), 0.04);
  border-color: rgba(var(--primary-color-rgb, 0, 120, 212), 0.2);
}
.status-container.info .status-icon-area { color: var(--primary-color); background: rgba(var(--primary-color-rgb, 0, 120, 212), 0.1); }

.status-icon-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: var(--surface2);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-color);
}

.status-meta {
  font-size: 14px;
  color: var(--muted);
  font-family: var(--font-mono);
}

.progress-container {
  margin-bottom: 32px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.progress-value {
  font-size: 15px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--primary-color);
}

.progress-container :deep(.n-progress-graph-line-rail) {
  background-color: var(--border) !important;
}

.action-bar {
  padding-top: 32px;
  border-top: 1px dashed var(--border);
}

.mirror-settings {
  margin-bottom: 24px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--surface);
}

.mirror-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.mirror-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-color);
}

.mirror-desc {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--muted);
  line-height: 1.5;
}

.mirror-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.mirror-feedback {
  margin-top: 10px;
  font-size: 13px;
}

.mirror-feedback.success {
  color: #18a058;
}

.mirror-feedback.error {
  color: #d03050;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.action-btn {
  border-radius: 14px;
  font-weight: 600;
  height: 44px;
}

.primary-action {
  box-shadow: 0 4px 12px rgba(var(--primary-color-rgb, 0, 120, 212), 0.3);
}

@media (max-width: 640px) {
  .mirror-form {
    grid-template-columns: 1fr;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }
  
  .status-container {
    flex-direction: column;
    text-align: center;
    padding: 24px 16px;
  }
  
  .status-action {
    margin-top: 12px;
  }
}
</style>
