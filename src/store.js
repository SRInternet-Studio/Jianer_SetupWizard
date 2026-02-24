import { reactive } from 'vue'
import { getSettings, saveSettings, getVoices } from './api'

export const state = reactive({
  config: {
    owner: [],
    Connection: { host: '127.0.0.1', port: 5004 },
    Log_level: 'INFO',
    black_list: [],
    Others: {
      gemini_key: '',
      openai_key: '',
      deepseek_key: '',
      default_mode: 'DeepSeek (深度)',
      bot_name: '简儿',
      bot_name_en: 'Jianer',
      ROOT_User: [],
      Auto_approval: [],
      reminder: '/',
      slogan: '',
      TTS: { voiceColor: 'zh-CN-XiaoyiNeural', rate: '+0%', volume: '+0%', pitch: '+0Hz' },
      compliment: [],
      poke_rejection_phrases: []
    }
  },
  appsettings: {
    Account: { Uin: 0, Protocol: 'Linux' },
    Implementations: [{ Host: '127.0.0.1', Port: 5004 }],
    SignServerUrl: ''
  },
  presets: [],
  voices: [],
  pluginsCache: {
    loaded: false,
    remote: [],
    local: [],
    updatable: [],
    intros: {},
    enabled: {},
    lastUpdated: 0
  }
})

function withTimeout(promise, ms) {
  let t
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error('timeout')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t))
}

export async function loadAll() {
  try {
    const data = await withTimeout(getSettings(), 6000)
    if (data?.config && Object.keys(data.config).length) {
      state.config = data.config
      // Clean default_mode for UI compatibility
      if (state.config.Others?.default_mode) {
        state.config.Others.default_mode = state.config.Others.default_mode.replace(/\s*\(.*\)$/, '')
      }
    }
    if (data?.appsettings && Object.keys(data.appsettings).length) state.appsettings = data.appsettings
    state.presets = Object.entries(data?.presets || {}).map(([id, v]) => ({
      id,
      ...v,
      uid: Array.isArray(v.uid)
        ? v.uid.map(x => String(x)).filter(i => i)
        : String(v.uid || '').split(/\s*,\s*|\n/).map(i => i).filter(i => i)
    }))
  } catch { }

  try {
    const vs = await withTimeout(getVoices(), 6000)
    state.voices = vs?.voices || []
  } catch { }
}

export async function saveAll() {
  const toList = v => Array.isArray(v) ? v : String(v || '').split(/\s*,\s*|\n/).map(i => i).filter(i => i)
  const toLineList = v => Array.isArray(v) ? v : String(v || '').split(/\r?\n/).map(i => i.trim()).filter(i => i)
  const cfg = JSON.parse(JSON.stringify(state.config))
  cfg.owner = toList(cfg.owner)
  cfg.black_list = toLineList(cfg.black_list)
  cfg.Others.ROOT_User = toList(cfg.Others.ROOT_User)
  cfg.Others.Auto_approval = toList(cfg.Others.Auto_approval)
  cfg.Others.compliment = toLineList(cfg.Others.compliment)
  cfg.Others.poke_rejection_phrases = toLineList(cfg.Others.poke_rejection_phrases)
  if (cfg.Others.default_mode) {
    cfg.Others.default_mode = cfg.Others.default_mode.replace(/\s*\(.*\)$/, '')
  }
  cfg.Connection.port = Number(cfg.Connection.port || 5004)
  const app = JSON.parse(JSON.stringify(state.appsettings))
  app.Account.Uin = Number(app.Account.Uin || 0)
  app.Implementations[0].Port = Number(app.Implementations?.[0]?.Port || cfg.Connection.port)
  const payload = {
    config: cfg,
    appsettings: app,
    presets: Object.fromEntries(state.presets.map(p => [p.id, { name: p.name, info: p.info, uid: toList(p.uid), path: p.path || `${p.id}.txt` }]))
  }
  return await saveSettings(payload)
}
