import { ApiResponse, MetaData } from '../types/room.types'
import { PagedData } from '../types/app.types'
import {
  AuditLogDto,
  ContractDto,
  InvoiceDto,
  ListFilters,
  MaintenanceRequestDto,
  NotificationDto,
  ServiceFeeDto,
  UtilityReadingDto,
} from '../types/management.types'
import { api } from './apiClient'

const defaultMeta: MetaData = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPage: 1,
}

function toQuery(filters?: ListFilters) {
  const params = new URLSearchParams()
  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

async function fetchPaged<T>(path: string, filters?: ListFilters): Promise<PagedData<T>> {
  const response = await api.get<unknown, ApiResponse<T[]>>(`${path}${toQuery(filters)}`)
  return {
    items: response.data,
    meta: response.metaData ?? defaultMeta,
  }
}

export const fetchInvoices = (filters?: ListFilters) => fetchPaged<InvoiceDto>('/Invoices', filters)
export const markInvoicePaid = (id: string) => api.patch<unknown, ApiResponse<InvoiceDto>>(`/Invoices/${id}/mark-paid`)
export const sendInvoice = (id: string) => api.post<unknown, ApiResponse<object>>(`/Invoices/${id}/send`)

export const fetchContracts = (filters?: ListFilters) => fetchPaged<ContractDto>('/Contracts', filters)
export const activateContract = (id: string) => api.patch<unknown, ApiResponse<ContractDto>>(`/Contracts/${id}/activate`)
export const terminateContract = (id: string, reason: string) =>
  api.patch<unknown, ApiResponse<ContractDto>>(`/Contracts/${id}/terminate`, { reason })

export const fetchMaintenanceRequests = (filters?: ListFilters) =>
  fetchPaged<MaintenanceRequestDto>('/Maintenance', filters)
export const updateMaintenanceStatus = (id: string, status: string, resolutionNote?: string) =>
  api.patch<unknown, ApiResponse<MaintenanceRequestDto>>(`/Maintenance/${id}/status`, { status, resolutionNote })

export const fetchNotifications = (filters?: ListFilters) => fetchPaged<NotificationDto>('/Notifications', filters)
export const markNotificationRead = (id: string) =>
  api.patch<unknown, ApiResponse<NotificationDto>>(`/Notifications/${id}/read`)
export const markAllNotificationsRead = () => api.patch<unknown, ApiResponse<object>>('/Notifications/read-all')

export const fetchServiceFees = (filters?: ListFilters) => fetchPaged<ServiceFeeDto>('/ServiceFees', filters)
export const toggleServiceFee = (id: string) =>
  api.patch<unknown, ApiResponse<ServiceFeeDto>>(`/ServiceFees/${id}/toggle`)

export const fetchUtilityReadings = (filters?: ListFilters) =>
  fetchPaged<UtilityReadingDto>('/UtilityReadings', filters)

export const fetchAuditLogs = (filters?: ListFilters) => fetchPaged<AuditLogDto>('/AuditLogs', filters)
