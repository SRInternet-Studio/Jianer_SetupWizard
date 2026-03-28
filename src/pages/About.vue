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
  padding: 16px;
  animation: page-enter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes page-enter {
  0% { opacity: 0; transform: translateY(20px) scale(0.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
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
  border-radius: 16px !important;
  background: color-mix(in srgb, var(--n-color, var(--surface)) 60%, transparent) !important;
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  border: 1px solid color-mix(in srgb, var(--n-border-color, var(--border)) 40%, transparent) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03) !important;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform, box-shadow;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.about-card:hover {
  transform: translateY(-4px) translateZ(0);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08) !important;
}

.about-card :deep(.n-card__content) {
  flex: 1;
}

.hero {
  background: linear-gradient(135deg, color-mix(in srgb, var(--n-color-target, #0078d4) 8%, transparent), color-mix(in srgb, #8a2be2 8%, transparent)) !important;
  border: 1px solid color-mix(in srgb, var(--n-color-target, #0078d4) 20%, transparent) !important;
}

.hero :deep(.n-card-header__main) {
  font-weight: 850;
  letter-spacing: 0.2px;
}

.hero-title {
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.5px;
  background: linear-gradient(120deg, var(--n-color-target, #0078d4), #8a2be2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  transform: translateZ(0);
}

.hero-sub {
  margin-top: 8px;
  color: var(--n-text-color-3, var(--muted));
  line-height: 1.65;
  font-size: 15px;
}

.list {
  display: grid;
  gap: 12px;
}

.li {
  display: grid;
  grid-template-columns: 12px 1fr;
  gap: 12px;
  align-items: start;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.li:hover {
  background: color-mix(in srgb, var(--n-color-target, #0078d4) 5%, transparent);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-top: 8px;
  background: color-mix(in srgb, var(--n-color-target, #0078d4) 60%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--n-color-target, #0078d4) 40%, transparent);
}

.dot-accent {
  background: color-mix(in srgb, #f0a020 85%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, #f0a020 40%, transparent);
}

.li-title {
  font-weight: 700;
  font-size: 15px;
  color: var(--n-text-color-1);
}

.li-desc {
  margin-top: 4px;
  color: var(--n-text-color-3, var(--muted));
  line-height: 1.55;
  font-size: 13px;
}

.callouts {
  display: grid;
  gap: 12px;
}

.callout {
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid color-mix(in srgb, var(--n-border-color, var(--stroke2)) 40%, transparent);
  background: color-mix(in srgb, var(--n-color, var(--surface)) 40%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
}

.callout:hover {
  transform: translateX(4px) translateZ(0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border-color: color-mix(in srgb, var(--n-color-target, #0078d4) 30%, transparent);
}

.callout-title {
  font-weight: 700;
  font-size: 14px;
  color: var(--n-text-color-1);
}

.callout-desc {
  margin-top: 6px;
  color: var(--n-text-color-3, var(--muted));
  line-height: 1.55;
  font-size: 13px;
}

.text-block {
  padding: 8px;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.text-block:hover {
  background: color-mix(in srgb, var(--n-color-target, #0078d4) 4%, transparent);
}

.text-block .text-title {
  font-weight: 800;
  font-size: 15px;
  color: var(--n-text-color-1);
}

.text-block .text-desc {
  margin-top: 6px;
  color: var(--n-text-color-3, var(--muted));
  line-height: 1.65;
  font-size: 14px;
}
</style>
