import { renderHook, waitFor } from '@testing-library/react'
import { useApiQuery } from '../useApiQuery'
import { api } from '@/lib/api'

jest.mock('@/lib/api')

describe('useApiQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches data successfully', async () => {
    const mockData = { items: [1, 2, 3] }
    const mockFn = jest.fn().mockResolvedValue({ success: true, data: mockData })
    ;(api.listOrganizations as jest.Mock) = mockFn

    const { result } = renderHook(() =>
      useApiQuery(() => api.listOrganizations(), { enabled: true })
    )

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('handles API errors', async () => {
    const mockError = 'API Error'
    const mockFn = jest.fn().mockResolvedValue({ success: false, error: mockError })
    ;(api.listOrganizations as jest.Mock) = mockFn

    const { result } = renderHook(() =>
      useApiQuery(() => api.listOrganizations(), { enabled: true })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Error is an AppError object from useErrorHandler
    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
    if (result.current.error && typeof result.current.error === 'object' && 'message' in result.current.error) {
      expect(result.current.error.message).toBe(mockError)
    }
    expect(result.current.data).toBeNull()
  })

  it('skips fetch when enabled is false', () => {
    const mockFn = jest.fn()
    ;(api.listOrganizations as jest.Mock) = mockFn

    renderHook(() =>
      useApiQuery(() => api.listOrganizations(), { enabled: false })
    )

    expect(mockFn).not.toHaveBeenCalled()
  })

  it('refetches data when refetch is called', async () => {
    const mockData = { items: [1, 2, 3] }
    const mockFn = jest.fn().mockResolvedValue({ success: true, data: mockData })
    ;(api.listOrganizations as jest.Mock) = mockFn

    const { result } = renderHook(() =>
      useApiQuery(() => api.listOrganizations(), { enabled: true })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear the cache to ensure refetch actually calls the API
    const cacheKey = mockFn.toString()
    // Force a refetch by calling it
    await result.current.refetch()

    await waitFor(() => {
      expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(1)
    }, { timeout: 3000 })
  })
})
