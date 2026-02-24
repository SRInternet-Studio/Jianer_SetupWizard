<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

const props = defineProps({
  lines: { type: Array, default: () => [] },
  fontFamily: { type: String, default: 'var(--font-mono)' },
  fontSize: { type: Number, default: 13 },
  rows: { type: Number, default: 24 },
  follow: { type: Boolean, default: true },
  height: { type: [String, Number], default: '420px' }
})

const rootRef = ref(null)
let term = null
let fit = null
let ro = null
let lastLen = 0
const surfaceHeight = computed(() => {
  if (typeof props.height === 'number') return `${props.height}px`
  return props.height || '420px'
})

function normalizeLine(s) {
  if (s == null) return ''
  const str = String(s)
  return str.endsWith('\n') || str.endsWith('\r') ? str : str + '\r\n'
}

function writeAll() {
  if (!term) return
  term.reset()
  term.clear()
  for (const l of props.lines) term.write(normalizeLine(l))
  lastLen = props.lines.length
  if (props.follow) term.scrollToBottom()
}

function appendFrom(startIndex) {
  if (!term) return
  for (let i = startIndex; i < props.lines.length; i++) term.write(normalizeLine(props.lines[i]))
  lastLen = props.lines.length
  if (props.follow) term.scrollToBottom()
}

onMounted(() => {
  term = new Terminal({
    convertEol: true,
    disableStdin: true,
    cursorBlink: false,
    scrollback: 5000,
    fontFamily: props.fontFamily,
    fontSize: props.fontSize,
    theme: {
      background: '#0b0f14',
      foreground: '#d6dde7',
      cursor: '#d6dde7',
      selectionBackground: 'rgba(214, 221, 231, 0.25)',
      black: '#10161d',
      brightBlack: '#3a4250',
      red: '#ff5c7c',
      brightRed: '#ff5c7c',
      green: '#28d17c',
      brightGreen: '#28d17c',
      yellow: '#ffd166',
      brightYellow: '#ffd166',
      blue: '#4ea1ff',
      brightBlue: '#4ea1ff',
      magenta: '#b392f0',
      brightMagenta: '#b392f0',
      cyan: '#2dd4bf',
      brightCyan: '#2dd4bf',
      white: '#d6dde7',
      brightWhite: '#f6f7fb'
    }
  })
  fit = new FitAddon()
  term.loadAddon(fit)
  term.open(rootRef.value)
  fit.fit()
  writeAll()

  ro = new ResizeObserver(() => {
    try { fit.fit() } catch { }
  })
  ro.observe(rootRef.value)
})

onBeforeUnmount(() => {
  try { ro?.disconnect() } catch { }
  ro = null
  try { term?.dispose() } catch { }
  term = null
  fit = null
})

watch(() => props.fontFamily, (v) => {
  if (!term) return
  term.options.fontFamily = v
  try { fit?.fit() } catch { }
})

watch(() => props.fontSize, (v) => {
  if (!term) return
  term.options.fontSize = v
  try { fit?.fit() } catch { }
})

watch(() => props.lines, () => {
  if (!term) return
  if (props.lines.length < lastLen) {
    writeAll()
    return
  }
  appendFrom(lastLen)
}, { deep: true })
</script>

<template>
  <div class="term-shell">
    <div class="term-surface" :style="{ height: surfaceHeight }" ref="rootRef" />
  </div>
</template>

<style scoped>
.term-shell {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--stroke) 70%, transparent);
  background: radial-gradient(1200px 700px at 20% 0%, rgba(78, 161, 255, 0.08), transparent 55%),
    radial-gradient(900px 600px at 80% 20%, rgba(40, 209, 124, 0.06), transparent 55%),
    #0b0f14;
}

.term-surface {
  padding: 10px 12px;
}
</style>
