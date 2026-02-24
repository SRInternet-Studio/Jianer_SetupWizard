<script setup>
import { state } from '../store'
import { NForm, NFormItem, NInput, NButton, NCard, NIcon } from 'naive-ui'
import { BookOpen24Regular } from '@vicons/fluent'
</script>

<template>
  <NCard title="基本信息设置">
    <template #header-extra>
      <NButton text tag="a" href="https://jianer.sr-studio.cn/faststart.html" target="_blank" type="primary">
        <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
        查看文档
      </NButton>
    </template>
    <NForm label-width="140">
      <NFormItem label="机器人中文名">
        <NInput v-model:value="state.config.Others.bot_name" />
      </NFormItem>
      <NFormItem label="机器人英文名">
        <NInput v-model:value="state.config.Others.bot_name_en" />
      </NFormItem>
      <NFormItem label="管理员QQ">
        <NInput v-model:value="state.config.owner" type="textarea" placeholder="一行一个或逗号分隔" />
      </NFormItem>
      <NFormItem label="触发提醒词">
        <NInput v-model:value="state.config.Others.reminder" />
      </NFormItem>
      <NFormItem label="登录QQ号">
        <NInput v-model:value="state.appsettings.Account.Uin" />
      </NFormItem>
    </NForm>
  </NCard>
</template>

<style scoped>
</style>
