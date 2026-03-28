<script setup>
import { NCard, NGrid, NGridItem, NTag, NButton, NSpace, NIcon } from 'naive-ui'
import { Open24Regular, Handshake24Regular, Code24Regular, ChatHelp24Regular, Heart24Regular } from '@vicons/fluent'

const openUrl = (url) => {
  window.open(url, '_blank')
}
</script>

<template>
  <div class="about-page">
    <NGrid cols="1 m:2" responsive="screen" :x-gap="20" :y-gap="20">
      <NGridItem span="1 m:2">
        <NCard class="hero-card" :bordered="false">
          <div class="hero-bg">
            <div class="glow-blob glow-1"></div>
            <div class="glow-blob glow-2"></div>
            <div class="noise-overlay"></div>
          </div>
          <div class="hero-content">
            <div class="hero-header">
              <div class="logo-box">
                <img src="/logo.png" alt="Logo" class="logo-img" />
              </div>
              <div class="title-area">
                <h1 class="hero-title">Jianer WebUI</h1>
                <p class="hero-sub">
                  面向简儿 QQ 机器人的现代本地化配置与管理界面。<br/>
                  按步骤完成配置、统一管理插件与运行环境。
                </p>
              </div>
            </div>
            
            <div class="tags-strip">
              <div class="custom-tag outline"><NIcon><Code24Regular /></NIcon>开源 · 共创</div>
              <div class="custom-tag fill-green"><NIcon><Bot24Regular /></NIcon>AI · QQ 机器人</div>
              <div class="custom-tag fill-orange"><NIcon><PlugConnected24Regular /></NIcon>OneBot v11</div>
            </div>

            <div class="action-strip">
              <NButton type="primary" size="large" @click="openUrl('https://jianer.sr-studio.cn/')">
                <template #icon><NIcon><BookOpen24Regular /></NIcon></template>
                查看在线文档
              </NButton>
              <NButton secondary size="large" @click="openUrl('https://github.com/SRInternet-Studio/Jianer_QQ_bot/blob/NEXT-PREVIEW/README.md')">
                <template #icon><NIcon><Open24Regular /></NIcon></template>
                项目 README
              </NButton>
              <NButton secondary size="large" @click="openUrl('https://jianer.sr-studio.cn/%E7%AE%80%E5%84%BF%E9%97%AE%E9%A2%98%26%E8%A7%A3%E5%86%B3%E6%96%B9%E6%B3%95%E6%B1%87%E6%80%BB.html')">
                <template #icon><NIcon><ChatHelp24Regular /></NIcon></template>
                问题排查
              </NButton>
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem span="1">
        <NCard class="feature-card" title="项目特性" :bordered="false">
          <template #header-extra>
            <div class="icon-accent"><NIcon><Star24Regular /></NIcon></div>
          </template>
          <div class="list">
            <div class="li">
              <div class="li-icon bg-blue"><NIcon><BrainCircuit24Regular /></NIcon></div>
              <div class="li-body">
                <div class="li-title">强大的 AI 能力</div>
                <div class="li-desc">集成 DeepSeek、Google Gemini、ChatGPT 及 EdgeTTS 语音回复，打造全能对话体验。</div>
              </div>
            </div>
            <div class="li">
              <div class="li-icon bg-purple"><NIcon><Person24Regular /></NIcon></div>
              <div class="li-body">
                <div class="li-title">预设与上下文隔离</div>
                <div class="li-desc">按用户分别存储预设与上下文，支持沉浸式群聊角色扮演。</div>
              </div>
            </div>
            <div class="li">
              <div class="li-icon bg-green"><NIcon><ShieldTask24Regular /></NIcon></div>
              <div class="li-body">
                <div class="li-title">群管与运行调度</div>
                <div class="li-desc">撤回、禁言、移出群聊、查看运行状态、定时群发与自动审批，管理更省心。</div>
              </div>
            </div>
            <div class="li">
              <div class="li-icon bg-orange"><NIcon><Games24Regular /></NIcon></div>
              <div class="li-body">
                <div class="li-title">丰富的娱乐生态</div>
                <div class="li-desc">支持 ACG 生图、Pixiv、动态壁纸、头像生成、Hitokoto 等多种互动插件。</div>
              </div>
            </div>
          </div>
        </NCard>
      </NGridItem>

      <NGridItem span="1">
        <NSpace vertical :size="20" style="height: 100%;">
          <NCard class="info-card" title="使用提醒" :bordered="false">
            <template #header-extra>
              <div class="icon-accent warning"><NIcon><Warning24Regular /></NIcon></div>
            </template>
            <div class="callout-grid">
              <div class="modern-callout">
                <div class="mc-title">群内帮助</div>
                <div class="mc-desc">在群聊中 @简儿 可以查看更详细的帮助内容和指令列表。</div>
              </div>
              <div class="modern-callout">
                <div class="mc-title">昵称与头像规范</div>
                <div class="mc-desc">自行部署时请避免使用与官方账号易混淆的昵称或头像，以免造成用户误解。</div>
              </div>
              <div class="modern-callout highlight">
                <div class="mc-title">免责声明</div>
                <div class="mc-desc">我们不对机器人在您的群聊中产生的任何内容及潜在风险负责。请合规使用。</div>
              </div>
            </div>
          </NCard>

          <NCard class="support-card" title="反馈与支持" :bordered="false" style="flex: 1;">
            <template #header-extra>
              <div class="icon-accent pink"><NIcon><Heart24Regular /></NIcon></div>
            </template>
            <div class="support-content">
              <p class="support-text">本项目由 SR思锐团队 开发并维护，框架基于 HypeR_Bot。如果您喜欢 Jianer，请支持我们！</p>
              <div class="support-actions">
                <NButton type="primary" secondary @click="openUrl('https://github.com/SRInternet-Studio/Jianer_QQ_bot')">
                  <template #icon><NIcon><Code24Regular /></NIcon></template>
                  GitHub 仓库
                </NButton>
                <NButton secondary @click="openUrl('https://sr-studio.cn/')">
                  <template #icon><NIcon><Handshake24Regular /></NIcon></template>
                  SR Studio 官网
                </NButton>
              </div>
            </div>
          </NCard>
        </NSpace>
      </NGridItem>
    </NGrid>
  </div>
</template>

<script>
import { 
  Bot24Regular, PlugConnected24Regular, BookOpen24Regular, Star24Regular, 
  BrainCircuit24Regular, Person24Regular, ShieldTask24Regular, Games24Regular, 
  Warning24Regular 
} from '@vicons/fluent'

export default {
  components: {
    Bot24Regular, PlugConnected24Regular, BookOpen24Regular, Star24Regular,
    BrainCircuit24Regular, Person24Regular, ShieldTask24Regular, Games24Regular,
    Warning24Regular
  }
}
</script>

<style scoped>
.about-page {
  padding: 12px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-card {
  position: relative;
  border-radius: 28px;
  overflow: hidden;
  background: var(--surface2);
  border: 1px solid var(--border);
  box-shadow: 0 12px 32px rgba(0,0,0,0.03);
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.glow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.glow-1 {
  top: -20%;
  left: -10%;
  width: 50%;
  height: 80%;
  background: rgba(0, 120, 212, 0.4);
}

.glow-2 {
  bottom: -30%;
  right: -10%;
  width: 60%;
  height: 80%;
  background: rgba(46, 160, 67, 0.3);
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.8;
  mix-blend-mode: overlay;
}

html[data-theme="dark"] .noise-overlay {
  opacity: 0.4;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 32px 24px;
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
}

.logo-box {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  flex-shrink: 0;
}

.logo-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.hero-title {
  font-size: 42px;
  font-family: var(--font-brand, 'Segoe UI', system-ui, sans-serif);
  font-weight: 900;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, var(--text-color) 0%, color-mix(in srgb, var(--text-color) 60%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}

.hero-sub {
  font-size: 16px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
}

.tags-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 32px;
}

.custom-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.custom-tag :deep(.n-icon) {
  font-size: 16px;
}

.custom-tag.outline {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-color);
}

.custom-tag.fill-green {
  background: rgba(24, 160, 88, 0.1);
  color: #18a058;
  border: 1px solid rgba(24, 160, 88, 0.2);
}

.custom-tag.fill-orange {
  background: rgba(240, 160, 32, 0.1);
  color: #d08010;
  border: 1px solid rgba(240, 160, 32, 0.2);
}

html[data-theme="dark"] .custom-tag.fill-orange {
  color: #f0a020;
}

.action-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.feature-card, .info-card, .support-card {
  height: 100%;
  border-radius: 24px;
  background: var(--surface2);
  border: 1px solid var(--border);
}

.icon-accent {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(var(--primary-color-rgb, 0, 120, 212), 0.1);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.icon-accent.warning {
  background: rgba(240, 160, 32, 0.1);
  color: #f0a020;
}

.icon-accent.pink {
  background: rgba(208, 48, 80, 0.1);
  color: #d03050;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 8px;
}

.li {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.li-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.bg-blue { background: rgba(0, 120, 212, 0.1); color: #0078d4; }
.bg-purple { background: rgba(138, 43, 226, 0.1); color: #8a2be2; }
.bg-green { background: rgba(24, 160, 88, 0.1); color: #18a058; }
.bg-orange { background: rgba(240, 160, 32, 0.1); color: #f0a020; }

html[data-theme="dark"] .bg-blue { color: #4cc2ff; }
html[data-theme="dark"] .bg-purple { color: #b87df8; }

.li-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-color);
}

.li-desc {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.callout-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 8px;
}

.modern-callout {
  padding: 16px;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.modern-callout:hover {
  background: color-mix(in srgb, var(--surface) 90%, var(--primary-color) 10%);
  border-color: color-mix(in srgb, var(--border) 80%, var(--primary-color) 20%);
}

.modern-callout.highlight {
  background: rgba(240, 160, 32, 0.05);
  border-color: rgba(240, 160, 32, 0.2);
}

.mc-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 6px;
  color: var(--text-color);
}

.modern-callout.highlight .mc-title {
  color: #d08010;
}
html[data-theme="dark"] .modern-callout.highlight .mc-title {
  color: #f0a020;
}

.mc-desc {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.support-content {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.support-text {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
}

.support-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

@media (max-width: 768px) {
  .hero-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
