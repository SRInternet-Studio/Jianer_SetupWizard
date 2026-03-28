<script setup>
import { NCard, NGrid, NGridItem, NTag, NText, NButton, NSpace, NDivider } from 'naive-ui'

const openUrl = (url) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="about-page">
    <NGrid cols="1 s:2 m:3" responsive="screen" :x-gap="16" :y-gap="16">
      <NGridItem span="1 s:2 m:3">
        <NCard class="hero about-card" size="large" title="关于 Jianer WebUI">
          <div class="hero-content">
            <div class="hero-title">Jianer WebUI</div>
            <div class="hero-sub">
              面向简儿 QQ 机器人的本地配置与管理界面：按步骤完成配置、统一管理插件与运行环境。
            </div>
            <NSpace size="small" style="margin-top: 10px;" :wrap="true">
              <NTag type="info" bordered>开源 · 共创</NTag>
              <NTag type="success" bordered>AI · QQ 机器人</NTag>
              <NTag type="warning" bordered>OneBot v11</NTag>
              <NTag bordered>插件生态</NTag>
            </NSpace>
          </div>

          <NSpace :wrap="true" style="margin-top: 14px;">
            <NButton @click="openUrl('https://jianer.sr-studio.cn/')" type="primary">
              查看在线文档
            </NButton>
            <NButton @click="openUrl('https://github.com/SRInternet-Studio/Jianer_QQ_bot/blob/NEXT-PREVIEW/README.md')" secondary>
              查看项目 README
            </NButton>
            <NButton @click="openUrl('https://sr-studio.cn/')" secondary>
              访问 SR Studio 官网
            </NButton>
            <NButton @click="openUrl('https://jianer.sr-studio.cn/%E7%AE%80%E5%84%BF%E9%97%AE%E9%A2%98%26%E8%A7%A3%E5%86%B3%E6%96%B9%E6%B3%95%E6%B1%87%E6%80%BB.html')" secondary>
              问题排查
            </NButton>
          </NSpace>
        </NCard>
      </NGridItem>

      <NGridItem span="1">
        <NCard class="about-card" title="项目特性" size="medium">
          <div class="list">
            <div class="li">
              <span class="dot" />
              <div class="li-body">
                <div class="li-title">AI 能力</div>
                <div class="li-desc">DeepSeek、Google Gemini、ChatGPT、EdgeTTS 语音回复</div>
              </div>
            </div>
            <div class="li">
              <span class="dot" />
              <div class="li-body">
                <div class="li-title">预设与上下文</div>
                <div class="li-desc">按用户分别存储预设与上下文；支持群聊角色扮演与清空上下文</div>
              </div>
            </div>
            <div class="li">
              <span class="dot" />
              <div class="li-body">
                <div class="li-title">群管与运行</div>
                <div class="li-desc">撤回、禁言、移出群聊、查看运行状态、定时群发与自动审批</div>
              </div>
            </div>
            <div class="li">
              <span class="dot" />
              <div class="li-body">
                <div class="li-title">娱乐生态</div>
                <div class="li-desc">ACG 生图、Pixiv、生图壁纸/头像、名人名言二代、Hitokoto 等</div>
              </div>
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem span="1">
        <NCard class="about-card" title="使用提醒" size="medium">
          <div class="callouts">
            <div class="callout">
              <div class="callout-title">群内帮助</div>
              <div class="callout-desc">在群聊中 @简儿 可以查看更详细的帮助内容。</div>
            </div>
            <div class="callout">
              <div class="callout-title">昵称与头像</div>
              <div class="callout-desc">
                自行部署时请避免使用与官方账号易混淆的昵称或头像，以免造成误解。
              </div>
            </div>
            <div class="callout">
              <div class="callout-title">声明</div>
              <div class="callout-desc">我们不对机器人在你的群聊中产生的任何消息负责。</div>
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem span="1">
        <NCard class="about-card" title="SR Studio" size="medium">
          <div class="text-block">
            <div class="text-title">我们是谁</div>
            <div class="text-desc">
              SR思锐团队是以青少年编程为中心的学习与实践社区，倡导开源共享，鼓励学习与二次开发。
            </div>
          </div>
          <div class="text-block" style="margin-top: 10px;">
            <div class="text-title">理念</div>
            <div class="text-desc">
              为民之所好，为众之所爱，坚持探索，只为更好。期待与你一起创造更多可能。
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem span="1 s:2 m:1">
        <NCard class="about-card" title="本地数据" size="medium">
          <div class="list">
            <div class="li">
              <span class="dot" />
              <div class="li-body">
                <div class="li-title">机器人配置</div>
                <div class="li-desc">保存在本机的 config.json</div>
              </div>
            </div>
            <div class="li">
              <span class="dot" />
              <div class="li-body">
                <div class="li-title">WebUI 配置</div>
                <div class="li-desc">保存在本机的 webui.json（包含下载源、代理、NapCat 路径等）</div>
              </div>
            </div>
            <div class="li">
              <span class="dot" />
              <div class="li-body">
                <div class="li-title">如何吞下玻璃而不伤身体？</div>
                <div class="li-desc">如何吞下身体而不伤玻璃？</div>
              </div>
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem span="1 s:2 m:2">
        <NCard class="about-card" title="反馈与支持" size="medium">
          <div class="list">
            <div class="li">
              <span class="dot dot-accent" />
              <div class="li-body">
                <div class="li-title">问题反馈</div>
                <div class="li-desc">反馈问题直接上Github提Issue或者访问官网加入用户群</div>
              </div>
            </div>
            <div class="li">
              <span class="dot dot-accent" />
              <div class="li-body">
                <div class="li-title">支持项目</div>
                <div class="li-desc">访问我们的爱发电支持我们吧</div>
              </div>
            </div>
            <div class="li">
              <span class="dot dot-accent" />
              <div class="li-body">
                <div class="li-title">鸣谢</div>
                <div class="li-desc">本项目框架 HypeR_Bot 由 HarcicYang 开发。</div>
              </div>
            </div>
          </div>

          <template #footer>
            <NSpace :wrap="true">
              <NButton @click="openUrl('https://github.com/SRInternet-Studio/Jianer_QQ_bot')" type="primary">
                打开 GitHub 仓库
              </NButton>
              <NButton @click="openUrl('https://sr-studio.cn/')" secondary>
                SR Studio
              </NButton>
            </NSpace>
          </template>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.about-page {
  padding: 4px;
}

.about-page :deep(.n-grid) {
  align-items: stretch;
}

.about-page :deep(.n-grid-item) {
  display: flex;
}

.about-page :deep(.n-grid-item > *) {
  flex: 1;
  min-width: 0;
}

.about-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.about-card :deep(.n-card__content) {
  flex: 1;
}

.hero :deep(.n-card-header__main) {
  font-weight: 850;
  letter-spacing: 0.2px;
}

.hero-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.2px;
}

.hero-sub {
  margin-top: 8px;
  color: var(--muted);
  line-height: 1.65;
}

.list {
  display: grid;
  gap: 10px;
}

.li {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 10px;
  align-items: start;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-top: 6px;
  background: color-mix(in srgb, var(--stroke2) 80%, transparent);
}

.dot-accent {
  background: color-mix(in srgb, var(--accent) 85%, transparent);
}

.li-title {
  font-weight: 750;
}

.li-desc {
  margin-top: 2px;
  color: var(--muted);
  line-height: 1.55;
}

.callouts {
  display: grid;
  gap: 10px;
}

.callout {
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--stroke2) 55%, transparent);
  background: color-mix(in srgb, var(--surface) 85%, transparent);
}

.callout-title {
  font-weight: 780;
}

.callout-desc {
  margin-top: 4px;
  color: var(--muted);
  line-height: 1.55;
}

.text-block .text-title {
  font-weight: 800;
}

.text-block .text-desc {
  margin-top: 6px;
  color: var(--muted);
  line-height: 1.65;
}
</style>
