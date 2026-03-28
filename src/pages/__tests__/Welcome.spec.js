import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import Welcome from '../Welcome.vue'
import { getVersion, napcatStatus, jianerStatus } from '../../api'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

vi.mock('../../api', () => ({
  getVersion: vi.fn(),
  napcatStatus: vi.fn(),
  napcatWebui: vi.fn(),
  jianerStatus: vi.fn(),
  jianerStart: vi.fn(),
  jianerStop: vi.fn()
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

describe('Welcome v1', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getVersion.mockResolvedValue({ backend_version: '1.0.0.1', frontend_version: '1.0.0.1', version: '1.0.0.1' })
    napcatStatus.mockResolvedValue({ running: true, install_path: 'D:/NapCat' })
    jianerStatus.mockResolvedValue({ running: false })
  })

  it('通过 v1 接口读取 NapCat 状态', async () => {
    const wrapper = shallowMount(Welcome)
    await flushPromises()

    expect(napcatStatus).toHaveBeenCalled()
    expect(jianerStatus).toHaveBeenCalled()
    expect(getVersion).toHaveBeenCalled()
    expect(wrapper.vm.napcatRunning).toBe(true)
    expect(wrapper.vm.napcatInstallPath).toBe('D:/NapCat')
    expect(wrapper.vm.currentVersion).toBe('1.0.0.1')
  })
})
