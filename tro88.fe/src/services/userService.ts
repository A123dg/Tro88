import { UserDto } from '../types/app.types'
import { ApiResponse } from '../types/room.types'
import { api } from './apiClient'

export const fetchCurrentUser = async (): Promise<ApiResponse<UserDto>> => {
  return api.get<unknown, ApiResponse<UserDto>>('/Users/me')
}
