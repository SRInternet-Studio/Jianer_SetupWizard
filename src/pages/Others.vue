<script setup>
import { computed } from 'vue'
import { state } from '../store'
import { NForm, NFormItem, NInput, NCard, NButton, NIcon } from 'naive-ui'
import { BookOpen24Regular } from '@vicons/fluent'

const sloganText = computed({
  get: () => {
    const v = state.config.Others.slogan
    if (Array.isArray(v)) return v.join('\n')
    return String(v || '')
  },
  set: (value) => {
    state.config.Others.slogan = String(value || '')
  }
})

const complimentText = computed({
  get: () => {
    const v = state.config.Others.compliment
    if (Array.isArray(v)) return v.join('\n')
    return String(v || '')
  },
  set: (value) => {
    state.config.Others.compliment = String(value || '')
      .split(/\r?\n/)
      .map(i => i.trim())
      .filter(Boolean)
  }
})

const pokeRejectText = computed({
  get: () => {
    const v = state.config.Others.poke_rejection_phrases
    if (Array.isArray(v)) return v.join('\n')
    return String(v || '')
  },
  set: (value) => {
    state.config.Others.poke_rejection_phrases = String(value || '')
      .split(/\r?\n/)
      .map(i => i.trim())
      .filter(Boolean)
  }
})
</script>

<template>
  <NCard title="其他设置">
    <template #header-extra>
      <NButton text tag="a" href="https://jianer.sr-studio.cn/guide/daily-use.html" target="_blank" type="primary">
        <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
        查看文档
      </NButton>
    </template>
    <NForm label-width="140">
      <NFormItem label="口号">
        <NInput v-model:value="sloganText" type="textarea" placeholder="按行填写" />
      </NFormItem>
      <NFormItem label="夸奖语">
        <NInput v-model:value="complimentText" type="textarea" placeholder="一行一个" />
      </NFormItem>
      <NFormItem label="戳一戳拒绝语">
        <NInput v-model:value="pokeRejectText" type="textarea" placeholder="一行一个" />
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped>
</style>
