import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  activateContract,
  fetchAuditLogs,
  fetchContracts,
  fetchInvoices,
  fetchMaintenanceRequests,
  fetchNotifications,
  fetchServiceFees,
  fetchServices,
  fetchUtilityReadings,
  markAllNotificationsRead,
  markInvoicePaid,
  markNotificationRead,
  sendInvoice,
  terminateContract,
  toggleService,
  toggleServiceFee,
  updateMaintenanceStatus,
  fetchOwnerTenants,
} from '../services/managementService'
import { ListFilters } from '../types/management.types'

export const MANAGEMENT_KEYS = {
  invoices: (filters?: ListFilters) => ['invoices', filters] as const,
  contracts: (filters?: ListFilters) => ['contracts', filters] as const,
  maintenance: (filters?: ListFilters) => ['maintenance', filters] as const,
  notifications: (filters?: ListFilters) => ['notifications', filters] as const,
  serviceFees: (filters?: ListFilters) => ['service-fees', filters] as const,
  services: (filters?: ListFilters) => ['services', filters] as const,
  utilityReadings: (filters?: ListFilters) => ['utility-readings', filters] as const,
  auditLogs: (filters?: ListFilters) => ['audit-logs', filters] as const,
  ownerTenants: (filters?: ListFilters) => ['owner-tenants', filters] as const,
}

export const useInvoices = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.invoices(filters), () => fetchInvoices(filters), { keepPreviousData: true })

export const useContracts = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.contracts(filters), () => fetchContracts(filters), { keepPreviousData: true })

export const useOwnerTenants = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.ownerTenants(filters), () => fetchOwnerTenants(filters), { keepPreviousData: true })

export const useMaintenanceRequests = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.maintenance(filters), () => fetchMaintenanceRequests(filters), { keepPreviousData: true })

export const useNotifications = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.notifications(filters), () => fetchNotifications(filters), { keepPreviousData: true })

export const useServiceFees = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.serviceFees(filters), () => fetchServiceFees(filters), { keepPreviousData: true })

export const useServices = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.services(filters), () => fetchServices(filters), { keepPreviousData: true })

export const useUtilityReadings = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.utilityReadings(filters), () => fetchUtilityReadings(filters), { keepPreviousData: true })

export const useAuditLogs = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.auditLogs(filters), () => fetchAuditLogs(filters), { keepPreviousData: true })

import { useNotification } from './useNotification'

export function useInvoiceActions() {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()
  return {
    markPaid: useMutation(markInvoicePaid, {
      onSuccess: (response) => {
        if (!response.success) {
          showErrorNotify(response.message || 'Không thể đánh dấu hóa đơn đã thanh toán')
          return
        }
        queryClient.invalidateQueries('invoices')
        showSuccessNotify('Đánh dấu hóa đơn đã thanh toán thành công')
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể đánh dấu hóa đơn đã thanh toán')
      }
    }),
    send: useMutation(sendInvoice, {
      onSuccess: (response) => {
        if (!response.success) {
          showErrorNotify(response.message || 'Không thể gửi hóa đơn')
          return
        }
        showSuccessNotify('Gửi hóa đơn thành công')
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể gửi hóa đơn')
      }
    }),
  }
}

export function useContractActions() {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()
  return {
    activate: useMutation(activateContract, {
      onSuccess: (response) => {
        if (!response.success) {
          showErrorNotify(response.message || 'Không thể kích hoạt hợp đồng')
          return
        }
        queryClient.invalidateQueries('contracts')
        showSuccessNotify('Kích hoạt hợp đồng thành công')
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể kích hoạt hợp đồng')
      }
    }),
    terminate: useMutation(({ id, reason }: { id: string; reason: string }) => terminateContract(id, reason), {
      onSuccess: (response) => {
        if (!response.success) {
          showErrorNotify(response.message || 'Không thể chấm dứt hợp đồng')
          return
        }
        queryClient.invalidateQueries('contracts')
        showSuccessNotify('Chấm dứt hợp đồng thành công')
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể chấm dứt hợp đồng')
      }
    }),
  }
}

export function useMaintenanceActions() {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()
  return useMutation(
    ({ id, status, resolutionNote }: { id: string; status: string; resolutionNote?: string }) =>
      updateMaintenanceStatus(id, status, resolutionNote),
    {
      onSuccess: (response) => {
        if (!response.success) {
          showErrorNotify(response.message || 'Không thể cập nhật trạng thái bảo trì')
          return
        }
        queryClient.invalidateQueries('maintenance')
        showSuccessNotify('Cập nhật trạng thái bảo trì thành công')
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể cập nhật trạng thái bảo trì')
      }
    },
  )
}

export function useNotificationActions() {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()
  return {
    markRead: useMutation(markNotificationRead, {
      onSuccess: (response) => {
        if (!response.success) {
          showErrorNotify(response.message || 'Không thể đánh dấu đã đọc')
          return
        }
        queryClient.invalidateQueries('notifications')
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể đánh dấu đã đọc')
      }
    }),
    markAllRead: useMutation(markAllNotificationsRead, {
      onSuccess: (response) => {
        if (!response.success) {
          showErrorNotify(response.message || 'Không thể đánh dấu tất cả đã đọc')
          return
        }
        queryClient.invalidateQueries('notifications')
        showSuccessNotify('Đánh dấu tất cả thông báo đã đọc thành công')
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể đánh dấu tất cả đã đọc')
      }
    }),
  }
}

export function useServiceFeeActions() {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()
  return useMutation(toggleServiceFee, {
    onSuccess: (response) => {
      if (!response.success) {
        showErrorNotify(response.message || 'Không thể cập nhật phí dịch vụ')
        return
      }
      queryClient.invalidateQueries('service-fees')
      showSuccessNotify('Cập nhật trạng thái phí dịch vụ thành công')
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể cập nhật phí dịch vụ')
    }
  })
}

export function useServiceActions() {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()
  return useMutation(toggleService, {
    onSuccess: (response) => {
      if (!response.success) {
        showErrorNotify(response.message || 'Không thể cập nhật dịch vụ')
        return
      }
      queryClient.invalidateQueries('services')
      showSuccessNotify('Cập nhật trạng thái dịch vụ thành công')
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể cập nhật dịch vụ')
    }
  })
}
