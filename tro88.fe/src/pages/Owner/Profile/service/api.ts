import { api } from '../../../../services/apiClient'

interface ProfileApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

interface EmptyApiResponse {
  success: boolean
  message?: string
  data?: unknown
}

export const fetchCurrentUser = async () => {
  const response = await api.get<unknown, ProfileApiResponse<UserProfile>>('/Users/me')
  if (!response.success) {
    throw new Error(response.message)
  }
  return response.data
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

export const updateProfile = async (data: UpdateProfileRequest) => {
  const response = await api.put<UpdateProfileRequest, ProfileApiResponse<UserProfile>>('/Users/me', data)
  if (!response.success) {
    throw new Error(response.message)
  }
  return response.data
}

export const changePassword = async (data: ChangePasswordRequest) => {
  const response = await api.post<ChangePasswordRequest, EmptyApiResponse>('/Users/change-password', data)
  if (!response.success) {
    throw new Error(response.message)
  }
  return response.data
}
