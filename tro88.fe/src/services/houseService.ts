import { HouseDto, PagedData } from '../types/app.types'
import { ApiResponse, MetaData } from '../types/room.types'
import { api } from './apiClient'

export interface HouseFilters {
  page?: number
  pageSize?: number
  search?: string
}

export interface CreateHousePayload {
  name: string
  address: string
  province?: string
  district?: string
  description?: string
  files?: File[]
}

export interface UpdateHousePayload extends CreateHousePayload {
  id: string
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

export const createHouse = async (payload: CreateHousePayload): Promise<ApiResponse<HouseDto>> => {
  const form = new FormData()
  form.append('name', payload.name)
  form.append('address', payload.address)

  if (payload.province) form.append('province', payload.province)
  if (payload.district) form.append('district', payload.district)
  if (payload.description) form.append('description', payload.description)
  payload.files?.forEach((file) => form.append('files', file))

  return api.post<unknown, ApiResponse<HouseDto>>('/Houses', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const fetchHouseDetail = async (id: string): Promise<HouseDto> => {
  const response = await api.get<unknown, ApiResponse<HouseDto>>(`/Houses/${id}`)
  return response.data
}

export const updateHouse = async (payload: UpdateHousePayload): Promise<ApiResponse<HouseDto>> => {
  const form = new FormData()
  form.append('name', payload.name)
  form.append('address', payload.address)

  if (payload.province) form.append('province', payload.province)
  if (payload.district) form.append('district', payload.district)
  if (payload.description) form.append('description', payload.description)
  payload.files?.forEach((file) => form.append('files', file))

  return api.put<unknown, ApiResponse<HouseDto>>(`/Houses/${payload.id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const changeHouseStatus = async (
  id: string,
  status: 'PendingApproval' | 'Active' | 'Inactive',
): Promise<ApiResponse<HouseDto>> => {
  return api.patch<unknown, ApiResponse<HouseDto>>(`/Houses/${id}/status`, { id, status })
}
