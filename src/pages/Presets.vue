<script setup>
import { ref } from 'vue'
import { state } from '../store'
import { getPresetContent, savePresetContent, deletePreset, savePresets as savePresetsApi } from '../api'
import { 
  NCard, NButton, NInput, NModal, NForm, NFormItem, 
  NList, NListItem, NMessageProvider, useMessage,
  NGrid, NGridItem, NSpace, NText, NEmpty, NIcon, NSpin, NDynamicTags, NAlert
} from 'naive-ui'
import { Add16Regular, Edit16Regular, Delete16Regular, Save16Regular, Dismiss16Regular } from '@vicons/fluent'

const show = ref(false)
const editing = ref(null)
const content = ref('')
const loadingContent = ref(false)
const savingContent = ref(false)
const savingPresets = ref(false)
const message = useMessage()
const showIntro = ref(true)

function onCreateUid(label) {
  const s = String(label || '').trim()
  if (!/^\d+$/.test(s)) {
    message.error('只能输入数字')
    return false
  }
  return s
}

function normalizeUid(list) {
  const seen = new Set()
  const out = []
  for (const x of Array.isArray(list) ? list : []) {
    const s = String(x || '').trim()
    if (/^\d+$/.test(s) && !seen.has(s)) {
      seen.add(s)
      out.push(s)
    }
  }
  return out
}

function addPreset() {
  const id = 'p' + Math.floor(1000000 + Math.random() * 9000000)
  state.presets.push({ id, name: '新预设', info: '请输入预设介绍', uid: [], path: `${id}.txt` })
  message.info('已新增预设')
}

function removePreset(id) {
  if (id === 'Normal') {
    message.warning('默认预设不可删除')
    return
  }
  deletePreset(id).then((r) => {
    if (r && r.ok) {
      state.presets = state.presets.filter(p => p.id !== id)
      message.success('已删除预设')
    } else {
      message.error(r?.error?.message || r?.error || '删除失败')
    }
  }).catch(() => {
    message.error('删除失败，请检查后端连接')
  })
}

async function editContent(p) {
  editing.value = p
  loadingContent.value = true
  try {
    const res = await getPresetContent(p.id)
    content.value = res || ''
    show.value = true
  } catch (err) {
    console.error('Failed to fetch preset content:', err)
    message.error('无法获取预设内容，请检查后端连接')
  } finally {
    loadingContent.value = false
  }
}

async function saveContent() {
  if (!editing.value) return
  savingContent.value = true
  try {
    const r = await savePresetContent(editing.value.id, content.value)
    if (r && (r.ok || r.status === 'success')) {
      message.success('预设内容已保存')
      show.value = false
    } else {
      message.error(r?.error || '保存失败')
    }
  } catch (err) {
    console.error('Failed to save preset content:', err)
    message.error('保存失败，请检查网络连接')
  } finally {
    savingContent.value = false
  }
}

async function savePresets() {
  savingPresets.value = true
  try {
    const r = await savePresetsApi(state.presets)
    if (r && r.ok) message.success('预设已保存')
    else message.error(r?.error || '保存失败')
  } catch {
    message.error('保存失败，请检查后端连接')
  } finally {
    savingPresets.value = false
  }
}
</script>

<template>
  <div class="presets-page">
    <div class="page-header">
      <div class="header-row">
        <div class="header-title">
          <h2 class="header-h2">AI 预设管理</h2>
          <NText class="header-sub" depth="3">管理不同用户的 AI 人设和提示词</NText>
        </div>
        <div class="header-actions">
          <NSpace :wrap="true" size="small">
            <NButton secondary type="primary" :loading="savingPresets" @click="savePresets">
              <template #icon><NIcon><Save16Regular /></NIcon></template>
              保存预设
            </NButton>
            <NButton type="primary" @click="addPreset">
              <template #icon><NIcon><Add16Regular /></NIcon></template>
              新增预设
            </NButton>
          </NSpace>
        </div>
      </div>
    </div>
    <div v-if="showIntro" style="margin-top: 12px">
      <NAlert title="可用变量说明" type="info" closable @close="showIntro = false">
        <div>在预设文本中可使用以下变量：</div>
        <div style="margin-top:6px">
          <code>{self.bot_name}</code> 机器人的昵称，
          <code>{self.event_user}</code> 用户昵称，
          <code>{self.event_user_id}</code> 用户 QQ 号
        </div>
      </NAlert>
    </div>

    <NGrid :cols="1" :y-gap="16" style="margin-top: 20px">
      <NGridItem v-if="!state.presets.length">
        <NCard>
          <NEmpty description="暂无预设，点击右上角新增" />
        </NCard>
      </NGridItem>
      
      <NGridItem v-for="p in state.presets" :key="p.id">
        <NCard hoverable>
          <template #header>
            <NSpace align="center">
              <NIcon size="20" color="#18a058"><Edit16Regular /></NIcon>
              <span>{{ p.name || '未命名预设' }}</span>
              <NText depth="3" style="font-size: 12px">ID: {{ p.id }}</NText>
            </NSpace>
          </template>
          
          <template #header-extra>
            <NSpace>
              <NButton size="small" secondary type="primary" @click="editContent(p)" :loading="loadingContent && editing?.id === p.id">
                <template #icon><NIcon><Edit16Regular /></NIcon></template>
                编辑内容
              </NButton>
              <NButton size="small" secondary type="error" @click="removePreset(p.id)" :disabled="p.id === 'Normal'">
                <template #icon><NIcon><Delete16Regular /></NIcon></template>
                删除
              </NButton>
            </NSpace>
          </template>

          <NForm label-placement="left" label-width="80" :show-feedback="false">
            <NGrid :cols="2" :x-gap="12" :y-gap="12">
              <NGridItem>
                <NFormItem label="预设名称">
                  <NInput v-model:value="p.name" placeholder="例如：傲娇萝莉" />
                </NFormItem>
              </NGridItem>
              <NGridItem>
                <NFormItem label="介绍信息">
                  <NInput v-model:value="p.info" placeholder="简短的描述" />
                </NFormItem>
              </NGridItem>
              <NGridItem :span="2">
                <NFormItem label="适用用户">
                  <NDynamicTags
                    :key="p.id"
                    v-model:value="p.uid"
                    @update:value="v => (p.uid = normalizeUid(v))"
                    :on-create="onCreateUid"
                    size="medium"
                    :max="64"
                    input-placeholder="输入 QQ 号后回车添加"
                  />
                </NFormItem>
              </NGridItem>
            </NGrid>
          </NForm>
        </NCard>
      </NGridItem>
    </NGrid>

    <NModal v-model:show="show" transform-origin="center">
      <NCard 
        style="width: 800px; max-width: 90vw; --n-color: color-mix(in srgb, var(--bg2) 92%, transparent); --n-color-modal: color-mix(in srgb, var(--bg2) 92%, transparent); --n-color-embedded: color-mix(in srgb, var(--bg2) 92%, transparent); --n-color-embedded-modal: color-mix(in srgb, var(--bg2) 92%, transparent);" 
        :title="'编辑预设内容 - ' + (editing?.name || '')" 
        bordered 
        size="huge" 
        role="dialog" 
        aria-modal="true"
      >
        <template #header-extra>
          <NButton circle quaternary @click="show = false">
            <template #icon><NIcon><Dismiss16Regular /></NIcon></template>
          </NButton>
        </template>

        <NSpin :show="savingContent">
          <NInput 
            v-model:value="content" 
            type="textarea" 
            :rows="18" 
            placeholder="在这里输入 AI 的人设、规则和提示词..."
          />
        </NSpin>

        <template #footer>
          <NSpace justify="end">
            <NButton @click="show = false">取消</NButton>
            <NButton type="primary" @click="saveContent" :loading="savingContent">
              <template #icon><NIcon><Save16Regular /></NIcon></template>
              保存内容
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>

<style scoped>
.presets-page {
  padding: 4px;
}
.page-header {
  border-bottom: 1px solid var(--n-border-color);
  padding-bottom: 16px;
}
.header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.header-title {
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.header-h2 {
  margin: 0;
  line-height: 1.15;
}
.header-actions {
  display: flex;
  align-items: center;
}
</style>
