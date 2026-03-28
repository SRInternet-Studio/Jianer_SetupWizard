import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'
import Update from '../Update.vue'
import { getVersion, checkUpdate, executeUpdate, updateProgress } from '../../api'

vi.mock('../../api', () => ({
  getVersion: vi.fn(),
  checkUpdate: vi.fn(),
  executeUpdate: vi.fn(),
  updateProgress: vi.fn()
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

describe('Update 自动更新', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getVersion.mockResolvedValue({ backend_version: '1.0.0.1', frontend_version: '1.0.0.1', version: '1.0.0.1' })
    checkUpdate.mockResolvedValue({ ok: true, has_update: true, latest_version: '1.0.0.2', release_url: 'https://example.com/release' })
    executeUpdate.mockResolvedValue({ ok: true, job_id: 'job-1' })
    updateProgress.mockResolvedValue({ percent: 100, status: 'done', message: '更新完成', target_version: '1.0.0.2' })
  })

  it('初始化时读取版本并检查更新', async () => {
    const wrapper = shallowMount(Update)
    await flushPromises()

    expect(getVersion).toHaveBeenCalled()
    expect(checkUpdate).toHaveBeenCalled()
    expect(wrapper.vm.currentVersion).toBe('1.0.0.1')
    expect(wrapper.vm.hasUpdate).toBe(true)
    expect(wrapper.vm.latestVersion).toBe('1.0.0.2')
  })

  it('触发更新时调用执行与进度接口', async () => {
    const wrapper = shallowMount(Update)
    await flushPromises()

    await wrapper.vm.runAutoUpdate()
    await flushPromises()

    expect(executeUpdate).toHaveBeenCalled()
    expect(updateProgress).toHaveBeenCalledWith('job-1')
    expect(wrapper.vm.executing).toBe(false)
    expect(wrapper.vm.progressStatus).toBe('done')
  })
})
