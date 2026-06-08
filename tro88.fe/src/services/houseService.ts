import { HouseDto, PagedData } from '../types/app.types'
import { ApiResponse, MetaData } from '../types/room.types'
import { api } from './apiClient'

export interface HouseFilters {
  page?: number
  pageSize?: number
  search?: string
  keyword?: string
  minPrice?: number
  maxPrice?: number
}

export interface CreateHousePayload {
  name: string
  address: string
  province?: string
  district?: string
  description?: string
  files?: File[]
  services?: Array<{ serviceId: string; amount: number }>
}

export interface UpdateHousePayload extends CreateHousePayload {
  id: string
  mediaUrls?: string[]
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
  const keyword = filters?.keyword ?? filters?.search
  if (keyword?.trim()) {
    params.append('keyword', keyword.trim())
  }
  if (filters?.minPrice !== undefined) {
    params.append('minPrice', String(filters.minPrice))
  }
  if (filters?.maxPrice !== undefined) {
    params.append('maxPrice', String(filters.maxPrice))
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
  payload.services?.forEach((service, index) => {
    form.append(`services[${index}].serviceId`, service.serviceId)
    form.append(`services[${index}].amount`, String(service.amount))
  })

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
  payload.mediaUrls?.forEach((url) => form.append('mediaUrls', url))

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

export const contactHouse = async (houseId: string, contactType: string): Promise<ApiResponse<{ phoneNumber: string }>> => {
  return api.post<unknown, ApiResponse<{ phoneNumber: string }>>(`/Houses/${houseId}/contact`, { contactType })
}

export const toggleFavoriteHouse = async (houseId: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
  return api.post<unknown, ApiResponse<{ isFavorite: boolean }>>(`/Houses/${houseId}/favorite`)
}

export const fetchFavoriteHouses = async (): Promise<ApiResponse<HouseDto[]>> => {
  return api.get<unknown, ApiResponse<HouseDto[]>>('/Houses/favorites')
}

export const deleteHouse = async (id: string): Promise<ApiResponse<object>> => {
  return api.delete<unknown, ApiResponse<object>>(`/Houses/${id}`)
}

