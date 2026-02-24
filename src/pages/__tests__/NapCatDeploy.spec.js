import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import NapCatDeploy from '../NapCatDeploy.vue'
import { getSystemInfo, getNapcatConfig, napcatStatus, napcatLogs } from '../../api'

vi.mock('../../components/TerminalWindow.vue', () => ({
  default: {
    name: 'TerminalWindow',
    template: '<div class="terminal-window-stub" />'
  }
}))

vi.mock('../../api', () => ({
  getSystemInfo: vi.fn(),
  getNapcatConfig: vi.fn(),
  setNapcatConfig: vi.fn(),
  napcatDeploy: vi.fn(),
  napcatProgress: vi.fn(),
  napcatCancel: vi.fn(),
  napcatStatus: vi.fn(),
  napcatStart: vi.fn(),
  napcatStop: vi.fn(),
  napcatLogs: vi.fn(),
  napcatWebui: vi.fn(),
  napcatSetPath: vi.fn(),
  systemOpenDialog: vi.fn()
}))

vi.mock('naive-ui', async () => {
  const actual = await vi.importActual('naive-ui')
  return {
    ...actual,
    useMessage: () => ({
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    })
  }
})

describe('NapCatDeploy v1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSystemInfo.mockResolvedValue({ platform: 'windows', system: 'Windows', release: '11', machine: 'x64', is_admin: true })
    getNapcatConfig.mockResolvedValue({ ok: true, installer_base: '', bases: [] })
    napcatStatus.mockResolvedValue({ running: false, install_path: '' })
    napcatLogs.mockResolvedValue({ logs: [] })
  })

  it('初始化时读取 v1 状态接口', async () => {
    const wrapper = shallowMount(NapCatDeploy)
    await flushPromises()

    expect(getSystemInfo).toHaveBeenCalled()
    expect(getNapcatConfig).toHaveBeenCalled()
    expect(napcatStatus).toHaveBeenCalled()
    expect(wrapper.exists()).toBe(true)
  })
})