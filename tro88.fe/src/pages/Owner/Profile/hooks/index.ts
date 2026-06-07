import { useQuery, useMutation, useQueryClient } from 'react-query'
import { api } from '../../../../services/apiClient'
import { QK } from '../../../../queryClient'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface EmptyApiResponse {
  success: boolean
  message?: string
  data?: unknown
}

export interface UserProfile {
  id: string
  fullName: string
  email: string
  phoneNumber?: string
  citizenId?: string
  dateOfBirth?: string
  role: string
  isActive: boolean
  avatarUrl?: string
  createdAt: string
}

export interface UpdateProfileRequest {
  fullName?: string
  phoneNumber?: string
  citizenId?: string
  dateOfBirth?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export function useProfile() {
  return useQuery(
    QK.me,
    async () => {
      const response = await api.get<unknown, ApiResponse<UserProfile>>('/Users/me')
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data
    },
    {
      staleTime: 1000 * 60 * 10
    }
  )
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation(
    (data: UpdateProfileRequest) =>
      api.put<UpdateProfileRequest, ApiResponse<UserProfile>>('/Users/me', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QK.me)
      }
    }
  )
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation(
    async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post<FormData, ApiResponse<UserProfile>>('/Users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(QK.me)
      }
    }
  )
}

export function useChangePassword() {
  return useMutation(
    (data: ChangePasswordRequest) =>
      api.post<ChangePasswordRequest, EmptyApiResponse>('/Users/me/password', data)
  )
}
