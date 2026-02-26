<script setup>
import { ref, watch, onMounted } from 'vue'
import { state } from '../store'
import { NForm, NFormItem, NCard, NButton, NIcon, NDynamicInput } from 'naive-ui'
import { BookOpen24Regular } from '@vicons/fluent'

const sloganList = ref([])
const complimentList = ref([])
const pokeRejectList = ref([])

onMounted(() => {
  const s = state.config.Others.slogan
  sloganList.value = Array.isArray(s) ? s : String(s || '').split(/\r?\n/).filter(i => i)
  
  const c = state.config.Others.compliment
  complimentList.value = Array.isArray(c) ? c : []
  
  const p = state.config.Others.poke_rejection_phrases
  pokeRejectList.value = Array.isArray(p) ? p : []
})

watch(sloganList, (v) => {
  state.config.Others.slogan = v.join('\n')
}, { deep: true })

watch(complimentList, (v) => {
  state.config.Others.compliment = v
}, { deep: true })

watch(pokeRejectList, (v) => {
  state.config.Others.poke_rejection_phrases = v
}, { deep: true })
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
        <NDynamicInput v-model:value="sloganList" preset="input" :on-create="() => ''" placeholder="输入口号" />
      </NFormItem>
      <NFormItem label="夸奖语">
        <NDynamicInput v-model:value="complimentList" preset="input" :on-create="() => ''" placeholder="输入夸奖语" />
      </NFormItem>
      <NFormItem label="戳一戳拒绝语">
        <NDynamicInput v-model:value="pokeRejectList" preset="input" :on-create="() => ''" placeholder="输入拒绝语" />
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped>
</style>
