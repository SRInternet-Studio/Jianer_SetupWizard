import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export const getSettings = () => api.get('/settings').then(r => r.data)
export const saveSettings = (payload) => api.post('/settings', payload).then(r => r.data)
export const getVoices = () => api.get('/voices').then(r => r.data)
export const listPresets = () => api.get('/presets').then(r => Object.entries(r.data).map(([id, v]) => ({ id, ...v })))
export const getPresetContent = (id) => api.get(`/presets/${id}/content`).then(r => r.data.content)
export const savePresetContent = (id, content) => api.put(`/presets/${id}`, { content }).then(r => r.data)
export const deletePreset = (id) => api.delete(`/presets/${id}`).then(r => r.data)
export const savePresets = (presets) => api.post('/presets/save', { presets }).then(r => r.data)

export const pluginsRemote = () => api.get('/plugins/remote').then(r => {
  const d = r.data
  if (d && d.ok === false) {
    const msg = (d.error && d.error.message) || d.error || '远程插件列表获取失败'
    throw new Error(msg)
  }
  return (d && d.plugins) || []
})
export const pluginsLocal = () => api.get('/plugins/local').then(r => r.data.plugins || [])
export const pluginInfo = (name) => api.get(`/plugins/info/${name}`).then(r => r.data)
export const pluginInstall = (name) => api.post('/plugins/install', { name }).then(r => r.data)
export const pluginRemove = (name) => api.post('/plugins/remove', { name }).then(r => r.data)
export const pluginToggle = (name) => api.post('/plugins/toggle', { name }).then(r => r.data)
export const pluginCheckUpdate = (name) => api.get(`/plugins/check-update/${name}`).then(r => !!r.data.update)
export const pluginProgress = (name) => api.get(`/plugins/progress/${name}`).then(r => r.data)
export const pluginState = (name) => api.get(`/plugins/state/${name}`).then(r => r.data.enabled)
export const pluginStates = (names) => api.get(`/plugins/states`, { params: { names: names.join(',') } }).then(r => r.data)
export const pluginInfos = (names) => {
  const arr = Array.isArray(names) ? names : []
  if (!arr.length) return Promise.resolve({})
  return api.get(`/plugins/infos`, { params: { names: arr.join(',') } }).then(r => r.data)
}
export const getGithubToken = () => api.get('/github/token').then(r => r.data.token || '')
export const setGithubToken = (token) => api.post('/github/token', { token }).then(r => r.data)
export const getPipConfig = () => api.get('/pip/config').then(r => r.data)
export const setPipConfig = (payload) => api.post('/pip/config', payload).then(r => r.data)
export const pluginCheckUpdates = (names) => api.get(`/plugins/check-updates`, { params: { names: names.join(',') } }).then(r => r.data)
export const getGithubProxy = () => api.get('/github/proxy').then(r => r.data)
export const setGithubProxy = (payload) => api.post('/github/proxy', payload).then(r => r.data)
export const jianerConfigGet = () => api.get('/jianer/config').then(r => r.data)
export const jianerConfigSave = (payload) => api.post('/jianer/config', payload).then(r => r.data)
export const jianerStatus = () => api.get('/jianer/status').then(r => r.data)
export const jianerStart = () => api.post('/jianer/start').then(r => r.data)
export const jianerStop = () => api.post('/jianer/stop').then(r => r.data)
export const jianerLogs = () => api.get('/jianer/logs').then(r => r.data)
export const jianerInstallRequirements = () => api.post('/jianer/install-requirements').then(r => r.data)

export const getSystemInfo = () => api.get('/system/info').then(r => r.data)
export const getNapcatConfig = () => api.get('/napcat/config').then(r => r.data)
export const setNapcatConfig = (payload) => api.post('/napcat/config', payload).then(r => r.data)
export const napcatDeploy = (payload) => api.post('/napcat/deploy', payload).then(r => r.data)
export const napcatProgress = (jobId) => api.get(`/napcat/progress/${jobId}`).then(r => r.data)
export const napcatCancel = (jobId) => api.post('/napcat/cancel', { job_id: jobId }).then(r => r.data)
export const napcatStatus = () => api.get('/napcat/status').then(r => r.data)
export const napcatStart = () => api.post('/napcat/start').then(r => r.data)
export const napcatStop = () => api.post('/napcat/stop').then(r => r.data)
export const napcatLogs = () => api.get('/napcat/logs').then(r => r.data)
export const napcatWebui = () => api.get('/napcat/webui').then(r => r.data)
export const napcatSetPath = (path) => api.post('/napcat/path', { path }).then(r => r.data)
export const systemOpenDialog = () => api.post('/system/open-dialog').then(r => r.data)
