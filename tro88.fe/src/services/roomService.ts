import { ApiResponse, RoomDto, RoomFilters, RoomStatus } from '../types/room.types'
import { api } from './apiClient'

export const fetchRooms = async (
  houseId: string,
  filters?: RoomFilters,
): Promise<ApiResponse<RoomDto[]>> => {
  const params = new URLSearchParams()

  if (filters?.status && filters.status !== 'all') {
    params.append('status', filters.status)
  }
  if (filters?.page) {
    params.append('page', String(filters.page))
  }
  if (filters?.pageSize) {
    params.append('pageSize', String(filters.pageSize))
  }
  if (filters?.search?.trim()) {
    params.append('search', filters.search.trim())
  }
  if (filters?.sort) {
    params.append('sort', filters.sort)
  }

  const query = params.toString()
  const path = `/Rooms/house/${houseId}${query ? `?${query}` : ''}`
  return api.get<unknown, ApiResponse<RoomDto[]>>(path)
}

export const changeRoomStatus = async (
  id: string,
  status: RoomStatus,
): Promise<ApiResponse<RoomDto>> => {
  return api.patch<unknown, ApiResponse<RoomDto>>(`/Rooms/${id}/status`, { status })
}
