<script setup>
import { state, saveAll } from '../store'
import { NCard, NButton, NCode, useMessage, NIcon } from 'naive-ui'
import { BookOpen24Regular } from '@vicons/fluent'

const message = useMessage()
async function apply() {
  const r = await saveAll()
  if (r && r.ok) message.success('已成功保存')
  else message.error('保存失败')
}
</script>

<template>
  <NCard title="核对并应用设置">
    <template #header-extra>
      <NButton text tag="a" href="https://jianer.sr-studio.cn/faststart.html" target="_blank" type="primary">
        <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
        查看文档
      </NButton>
    </template>
    <NButton type="primary" @click="apply">应用</NButton>
    <NCode :code="JSON.stringify({ config: state.config, appsettings: state.appsettings }, null, 2)" language="json" style="display:block;margin-top:12px" />
  </NCard>
</template>

<style scoped>
</style>
