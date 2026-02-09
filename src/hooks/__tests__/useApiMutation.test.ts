import { renderHook, waitFor, act } from '@testing-library/react'
import { useApiMutation } from '../useApiMutation'
import { api } from '@/lib/api'

jest.mock('@/lib/api')

describe('useApiMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('executes mutation successfully', async () => {
    const mockData = { id: '1', name: 'Test' }
    const mockFn = jest.fn().mockResolvedValue({ success: true, data: mockData })
    ;(api.createOrganization as jest.Mock) = mockFn

    const { result } = renderHook(() =>
      useApiMutation((data: { name: string }) => api.createOrganization(data))
    )

    expect(result.current.loading).toBe(false)

    let mutationResult: typeof mockData | undefined
    await act(async () => {
      mutationResult = await result.current.mutate({ name: 'Test Org' })
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mutationResult).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('handles mutation errors', async () => {
    const mockError = 'Creation failed'
    const mockFn = jest.fn().mockResolvedValue({ success: false, error: mockError })
    ;(api.createOrganization as jest.Mock) = mockFn

    const { result } = renderHook(() =>
      useApiMutation((data: { name: string }) => api.createOrganization(data))
    )

    await act(async () => {
      try {
        await result.current.mutate({ name: 'Test Org' })
      } catch (err) {
        // Expected to throw
      }
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Error is an AppError object from useErrorHandler
    expect(result.current.error).toBeTruthy()
    expect(result.current.error).toHaveProperty('message', mockError)
    expect(result.current.error).toHaveProperty('originalError', mockError)
  })

  it('calls onSuccess callback', async () => {
    const mockData = { id: '1' }
    const mockFn = jest.fn().mockResolvedValue({ success: true, data: mockData })
    ;(api.createOrganization as jest.Mock) = mockFn
    const onSuccess = jest.fn()

    const { result } = renderHook(() =>
      useApiMutation(
        (data: { name: string }) => api.createOrganization(data),
        { onSuccess }
      )
    )

    await act(async () => {
      result.current.mutate({ name: 'Test' })
    })

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData)
    })
  })

  it('calls onError callback', async () => {
    const mockError = 'Error occurred'
    const mockFn = jest.fn().mockResolvedValue({ success: false, error: mockError })
    ;(api.createOrganization as jest.Mock) = mockFn
    const onError = jest.fn()

    const { result } = renderHook(() =>
      useApiMutation(
        (data: { name: string }) => api.createOrganization(data),
        { onError }
      )
    )

    await act(async () => {
      try {
        await result.current.mutate({ name: 'Test' })
      } catch (err) {
        // Expected to throw
      }
    })

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(mockError)
    })
  })
})
