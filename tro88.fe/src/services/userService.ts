import { PagedData, UserDto } from '../types/app.types'
import { ApiResponse, MetaData } from '../types/room.types'
import { api } from './apiClient'

export const fetchCurrentUser = async (): Promise<ApiResponse<UserDto>> => {
  return api.get<unknown, ApiResponse<UserDto>>('/Users/me')
}

export interface UserFilters {
  page?: number
  pageSize?: number
  search?: string
  role?: string
}

export interface SaveUserPayload {
  id?: string
  fullName: string
  email: string
  phoneNumber?: string
  password?: string
  role: 'Admin' | 'Owner' | 'Tenant'
  nationalId?: string
  dateOfBirth?: string
  isActive: boolean
}

export interface UpdateProfilePayload {
  fullName: string
  phoneNumber: string
  nationalId?: string
  dateOfBirth?: string
}

const defaultMeta: MetaData = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPage: 1,
}

export const fetchUsers = async (filters?: UserFilters): Promise<PagedData<UserDto>> => {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', String(filters.page))
  if (filters?.pageSize) params.append('pageSize', String(filters.pageSize))
  if (filters?.search?.trim()) params.append('search', filters.search.trim())
  if (filters?.role) params.append('role', filters.role)

  const query = params.toString()
  const response = await api.get<unknown, ApiResponse<UserDto[]>>(`/Users${query ? `?${query}` : ''}`)

  return {
    items: response.data,
    meta: response.metaData ?? defaultMeta,
  }
}

export const createUser = async (payload: SaveUserPayload): Promise<ApiResponse<UserDto>> => {
  return api.post<unknown, ApiResponse<UserDto>>('/Users', payload)
}

export const updateUser = async (payload: SaveUserPayload): Promise<ApiResponse<UserDto>> => {
  return api.put<unknown, ApiResponse<UserDto>>(`/Users/${payload.id}`, payload)
}

export const deleteUser = async (id: string): Promise<ApiResponse<object | null>> => {
  return api.delete<unknown, ApiResponse<object | null>>(`/Users/${id}`)
}

export const updateCurrentUser = async (payload: UpdateProfilePayload): Promise<ApiResponse<UserDto>> => {
  return api.put<unknown, ApiResponse<UserDto>>('/Users/me', payload)
}

export const checkEmailExists = async (email: string): Promise<ApiResponse<UserDto>> => {
  return api.get<unknown, ApiResponse<UserDto>>(`/Users/check-email?email=${encodeURIComponent(email)}`)
}
