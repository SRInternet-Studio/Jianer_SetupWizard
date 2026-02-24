import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'

function readMaybe(filePath) {
  try {
    if (!filePath) return undefined
    const p = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath)
    return fs.readFileSync(p)
  } catch {
    return undefined
  }
}

function resolveHttps() {
  const enabled = String(process.env.VITE_DEV_HTTPS || '').toLowerCase()
  if (!['1', 'true', 'yes', 'on'].includes(enabled)) return false

  const key = readMaybe(process.env.VITE_DEV_HTTPS_KEY)
  const cert = readMaybe(process.env.VITE_DEV_HTTPS_CERT)
  const ca = readMaybe(process.env.VITE_DEV_HTTPS_CA)

  if (key && cert) return { key, cert, ca }
  return true
}

function resolveAllowedHosts() {
  const fromEnv = String(process.env.VITE_ALLOWED_HOSTS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const base = ['test111.moonpeach.top']
  return Array.from(new Set([...base, ...fromEnv]))
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    port: 5174,
    https: resolveHttps(),
    allowedHosts: resolveAllowedHosts(),
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 5174,
    https: resolveHttps(),
    allowedHosts: resolveAllowedHosts()
  },
  build: {
    // Increase warning limit to 1000KB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Separate large third-party libraries into independent chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('naive-ui')) {
              return 'naive-ui'
            }
            if (id.includes('@vicons')) {
              return 'icons'
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
