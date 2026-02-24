<script setup>
import { computed } from 'vue'
import { state } from '../store'
import { NForm, NFormItem, NSelect, NInput, NCard, NButton, NIcon } from 'naive-ui'
import { BookOpen24Regular } from '@vicons/fluent'

const proxyOptions = [
  { label: 'Master - cloudflare', value: 'https://sign.lagrangecore.org/api/sign/30366' },
  { label: 'Master - mainland', value: 'http://106.54.14.24:8084/api/sign/30366' },
  { label: 'Mirror - hk > cloudflare', value: 'https://sign.0w0.ing/api/sign/30366' }
]

const blackListText = computed({
  get: () => {
    const v = state.config.black_list
    if (Array.isArray(v)) return v.join('\n')
    return String(v || '')
  },
  set: (value) => {
    state.config.black_list = String(value || '')
      .split(/\r?\n/)
      .map(i => i.trim())
      .filter(Boolean)
  }
})
</script>

<template>
  <NCard title="框架设置">
    <template #header-extra>
      <NButton text tag="a" href="https://jianer.sr-studio.cn/faststart.html" target="_blank" type="primary">
        <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
        查看文档
      </NButton>
    </template>
    <NForm label-width="140">
      <NFormItem label="连接 Host">
        <NInput v-model:value="state.config.Connection.host" />
      </NFormItem>
      <NFormItem label="连接 Port">
        <NInput v-model:value="state.config.Connection.port" />
      </NFormItem>
      <NFormItem label="日志等级">
        <NSelect :options="['DEBUG', 'TRACE', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map(i => ({ label: i, value: i }))" v-model:value="state.config.Log_level" />
      </NFormItem>
      <NFormItem label="黑名单">
        <NInput v-model:value="blackListText" type="textarea" placeholder="一行一个" />
      </NFormItem>
      <NFormItem label="签名服务器（已过时）">
        <NSelect :options="proxyOptions" v-model:value="state.appsettings.SignServerUrl" />
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped>
</style>
