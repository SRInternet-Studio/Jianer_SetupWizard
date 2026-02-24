<script setup>
import { state } from '../store'
import { NForm, NFormItem, NInput, NSelect, NCard, NButton, NIcon } from 'naive-ui'
import { BookOpen24Regular } from '@vicons/fluent'

const modeOptions = [
  { label: 'DeepSeek (深度)', value: 'DeepSeek' },
  { label: 'Google Gemini (读图)', value: 'Google Gemini' },
  { label: 'ChatGPT-4 (默认4)', value: 'ChatGPT-4' },
  { label: 'ChatGPT-3.5 (默认3.5)', value: 'ChatGPT-3.5' }
]
</script> 

<template>
  <NCard title="AI 设置">
    <template #header-extra>
      <NButton text tag="a" href="https://jianer.sr-studio.cn/Configuring-AI-Functions.html" target="_blank" type="primary">
        <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
        查看文档
      </NButton>
    </template>
    <NForm label-width="140">
      <NFormItem label="DeepSeek Key">
        <NInput v-model:value="state.config.Others.deepseek_key" />
      </NFormItem>
      <NFormItem label="OpenAI Key">
        <NInput v-model:value="state.config.Others.openai_key" />
      </NFormItem>
      <NFormItem label="Gemini Key">
        <NInput v-model:value="state.config.Others.gemini_key" />
      </NFormItem>
      <NFormItem label="默认模式">
        <NSelect :options="modeOptions" v-model:value="state.config.Others.default_mode" />
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped>
</style>
