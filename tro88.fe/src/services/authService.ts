import { AuthResponseDto, GoogleLoginRequest, LoginRequest } from '../types/auth.types'
import { ApiResponse } from '../types/room.types'
import { api } from './apiClient'

export const login = async (payload: LoginRequest): Promise<ApiResponse<AuthResponseDto>> => {
  return api.post<unknown, ApiResponse<AuthResponseDto>>('/Auth/login', payload)
}

export const googleLogin = async (payload: GoogleLoginRequest): Promise<ApiResponse<AuthResponseDto>> => {
  return api.post<unknown, ApiResponse<AuthResponseDto>>('/Auth/google', payload)
}

export const logout = async (): Promise<ApiResponse<object | null>> => {
  return api.post<unknown, ApiResponse<object | null>>('/Auth/logout')
}

export function persistAuth(data: AuthResponseDto) {
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  localStorage.setItem('authUserId', data.userId)
  localStorage.setItem('authFullName', data.fullName)
  localStorage.setItem('authEmail', data.email)
  localStorage.setItem('authRole', data.role)
}

export function clearAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('authUserId')
  localStorage.removeItem('authFullName')
  localStorage.removeItem('authEmail')
  localStorage.removeItem('authRole')
}
