import { HouseDto, PagedData } from '../types/app.types'
import { ApiResponse, MetaData } from '../types/room.types'
import { api } from './apiClient'

export interface HouseFilters {
  page?: number
  pageSize?: number
  search?: string
}

const defaultMeta: MetaData = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPage: 1,
}

export const fetchHouses = async (filters?: HouseFilters): Promise<PagedData<HouseDto>> => {
  const params = new URLSearchParams()
  if (filters?.page) {
    params.append('page', String(filters.page))
  }
  if (filters?.pageSize) {
    params.append('pageSize', String(filters.pageSize))
  }
  if (filters?.search?.trim()) {
    params.append('search', filters.search.trim())
  }

  const query = params.toString()
  const response = await api.get<unknown, ApiResponse<HouseDto[]>>(`/Houses${query ? `?${query}` : ''}`)

  return {
    items: response.data,
    meta: response.metaData ?? defaultMeta,
  }
}
