import { ApiResponse, RoomDto, RoomFilters, RoomStatus } from '../types/room.types'
import { api } from './apiClient'

export interface RoomPayload {
  roomNumber: string
  floor: number
  area: number
  maxOccupants: number
  monthlyRent: number
  depositAmount: number
  electricityUnitPrice: number
  waterUnitPrice: number
  description?: string | null
}

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

export const createRoom = async (
  houseId: string,
  payload: RoomPayload,
): Promise<ApiResponse<RoomDto>> => {
  return api.post<unknown, ApiResponse<RoomDto>>(`/Rooms/house/${houseId}`, payload)
}

export const updateRoom = async (
  id: string,
  payload: RoomPayload,
): Promise<ApiResponse<RoomDto>> => {
  return api.put<unknown, ApiResponse<RoomDto>>(`/Rooms/${id}`, payload)
}

export const deleteRoom = async (id: string): Promise<ApiResponse<object>> => {
  return api.delete<unknown, ApiResponse<object>>(`/Rooms/${id}`)
}
