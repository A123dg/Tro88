import { ApiResponse } from '../types/room.types'
import { AdminDashboardDto, OwnerDashboardDto, TenantDashboardDto } from '../types/app.types'
import { api } from './apiClient'

export const fetchAdminDashboard = async (): Promise<ApiResponse<AdminDashboardDto>> => {
  return api.get<unknown, ApiResponse<AdminDashboardDto>>('/Dashboard/admin')
}

export const fetchOwnerDashboard = async (): Promise<ApiResponse<OwnerDashboardDto>> => {
  return api.get<unknown, ApiResponse<OwnerDashboardDto>>('/Dashboard/owner')
}

export const fetchTenantDashboard = async (): Promise<ApiResponse<TenantDashboardDto>> => {
  return api.get<unknown, ApiResponse<TenantDashboardDto>>('/Dashboard/tenant')
}
