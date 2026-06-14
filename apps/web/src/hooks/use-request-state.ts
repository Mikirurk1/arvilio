import { useMemo } from 'react'

type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

interface RequestSlice<T> {
  status: RequestStatus
  data?: T | null
  error?: string | null
}

interface RequestState<T> {
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  data: T | null
}

export function useRequestState<T>(slice: RequestSlice<T>): RequestState<T> {
  return useMemo(
    () => ({
      isLoading: slice.status === 'loading' || slice.status === 'idle',
      isError: slice.status === 'error',
      isSuccess: slice.status === 'success',
      data: slice.data ?? null,
    }),
    [slice.status, slice.data],
  )
}
