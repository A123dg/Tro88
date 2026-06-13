import { ApiResponse, MetaData, RoomDto } from '../types/room.types'
import { api } from './apiClient'

export interface RoomSearchFilters {
  keyword?: string
  province?: string
  district?: string
  maxOccupants?: number
  monthlyRent?: number
  page?: number
  pageSize?: number
  sortBy?: 'newest' | 'priceAsc' | 'priceDesc' | 'capacityDesc'
}

export interface RoomSearchResult {
  rooms: RoomDto[]
  meta: MetaData
}

export interface SearchAvailableRoomsResponse {
  code: number
  success: boolean
  message: string
  data: RoomDto[]
  metaData?: MetaData
}

const defaultMeta: MetaData = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPage: 1,
}

export const searchAvailableRooms = async (filters: RoomSearchFilters): Promise<RoomSearchResult> => {
  const params = new URLSearchParams()

  if (filters.keyword?.trim()) {
    params.append('keyword', filters.keyword.trim())
  }
  if (filters.province) {
    params.append('province', filters.province)
  }
  if (filters.district) {
    params.append('district', filters.district)
  }
  if (filters.maxOccupants) {
    params.append('maxOccupants', String(filters.maxOccupants))
  }
  if (filters.monthlyRent) {
    params.append('monthlyRent', String(filters.monthlyRent))
  }
  if (filters.page) {
    params.append('page', String(filters.page))
  }
  if (filters.pageSize) {
    params.append('pageSize', String(filters.pageSize))
  }
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy)
  }

  const query = params.toString()

  // Use the existing API endpoint for searching available rooms
  const response = await api.get<unknown, SearchAvailableRoomsResponse>(
    `/Rooms/search/available${query ? `?${query}` : ''}`
  )

  return {
    rooms: response.data,
    meta: response.metaData ?? defaultMeta,
  }
}
