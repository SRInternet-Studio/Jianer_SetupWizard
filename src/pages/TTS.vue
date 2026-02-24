<script setup>
import { state } from '../store'
import { NForm, NFormItem, NSelect, NCard, NGrid, NGridItem, NText, NIcon, NSpace, NButton } from 'naive-ui'
import { Speaker216Regular, BookOpen24Regular } from '@vicons/fluent'

const rateOptions = Array.from({ length: 21 }, (_, i) => {
  const val = -100 + i * 10
  const label = `${val >= 0 ? '+' : ''}${val}%`
  return { label, value: label }
})
const volumeOptions = rateOptions
const pitchOptions = Array.from({ length: 21 }, (_, i) => {
  const val = -100 + i * 10
  const label = `${val >= 0 ? '+' : ''}${val}Hz`
  return { label, value: label }
})
</script>

<template>
  <div class="tts-page">
    <div class="page-header">
      <NSpace align="center" justify="space-between" style="width: 100%">
        <NSpace align="center">
          <NIcon size="24" color="#18a058"><Speaker216Regular /></NIcon>
          <h2 style="margin: 0">AI 语音回复设置</h2>
        </NSpace>
        <NButton text tag="a" href="https://jianer.sr-studio.cn/Configuring-AI-Functions.html" target="_blank" type="primary">
          <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
          查看文档
        </NButton>
      </NSpace>
      <NText depth="3" style="margin-top: 4px; display: block;">配置机器人回复时的语音音色、速率和音量</NText>
    </div>

    <NGrid :cols="1" :y-gap="16" style="margin-top: 20px">
      <NGridItem>
        <NCard title="基础语音配置" hoverable>
          <NForm label-placement="left" label-width="100" :show-feedback="false">
            <NGrid :cols="2" :x-gap="20" :y-gap="16">
              <NGridItem :span="2">
                <NFormItem label="选择音色">
                  <NSelect 
                    filterable
                    placeholder="搜索并选择音色 (例如: Xiaoyi)"
                    :options="state.voices.map(v => ({ 
                      label: `${v.FriendlyName} (${v.ShortName})`, 
                      value: v.ShortName 
                    }))" 
                    v-model:value="state.config.Others.TTS.voiceColor" 
                  />
                </NFormItem>
              </NGridItem>
              
              <NGridItem>
                <NFormItem label="语速调节">
                  <NSelect :options="rateOptions" v-model:value="state.config.Others.TTS.rate" />
                </NFormItem>
              </NGridItem>
              
              <NGridItem>
                <NFormItem label="音量调节">
                  <NSelect :options="volumeOptions" v-model:value="state.config.Others.TTS.volume" />
                </NFormItem>
              </NGridItem>
              
              <NGridItem>
                <NFormItem label="音调调节">
                  <NSelect :options="pitchOptions" v-model:value="state.config.Others.TTS.pitch" />
                </NFormItem>
              </NGridItem>
            </NGrid>
          </NForm>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.tts-page {
  padding: 4px;
}
.page-header {
  border-bottom: 1px solid var(--n-border-color);
  padding-bottom: 16px;
}
</style>
