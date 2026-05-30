import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  activateContract,
  fetchAuditLogs,
  fetchContracts,
  fetchInvoices,
  fetchMaintenanceRequests,
  fetchNotifications,
  fetchServiceFees,
  fetchUtilityReadings,
  markAllNotificationsRead,
  markInvoicePaid,
  markNotificationRead,
  sendInvoice,
  terminateContract,
  toggleServiceFee,
  updateMaintenanceStatus,
} from '../services/managementService'
import { ListFilters } from '../types/management.types'

export const MANAGEMENT_KEYS = {
  invoices: (filters?: ListFilters) => ['invoices', filters] as const,
  contracts: (filters?: ListFilters) => ['contracts', filters] as const,
  maintenance: (filters?: ListFilters) => ['maintenance', filters] as const,
  notifications: (filters?: ListFilters) => ['notifications', filters] as const,
  serviceFees: (filters?: ListFilters) => ['service-fees', filters] as const,
  utilityReadings: (filters?: ListFilters) => ['utility-readings', filters] as const,
  auditLogs: (filters?: ListFilters) => ['audit-logs', filters] as const,
}

export const useInvoices = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.invoices(filters), () => fetchInvoices(filters), { keepPreviousData: true })

export const useContracts = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.contracts(filters), () => fetchContracts(filters), { keepPreviousData: true })

export const useMaintenanceRequests = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.maintenance(filters), () => fetchMaintenanceRequests(filters), { keepPreviousData: true })

export const useNotifications = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.notifications(filters), () => fetchNotifications(filters), { keepPreviousData: true })

export const useServiceFees = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.serviceFees(filters), () => fetchServiceFees(filters), { keepPreviousData: true })

export const useUtilityReadings = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.utilityReadings(filters), () => fetchUtilityReadings(filters), { keepPreviousData: true })

export const useAuditLogs = (filters?: ListFilters) =>
  useQuery(MANAGEMENT_KEYS.auditLogs(filters), () => fetchAuditLogs(filters), { keepPreviousData: true })

export function useInvoiceActions() {
  const queryClient = useQueryClient()
  return {
    markPaid: useMutation(markInvoicePaid, { onSuccess: () => queryClient.invalidateQueries('invoices') }),
    send: useMutation(sendInvoice),
  }
}

export function useContractActions() {
  const queryClient = useQueryClient()
  return {
    activate: useMutation(activateContract, { onSuccess: () => queryClient.invalidateQueries('contracts') }),
    terminate: useMutation(({ id, reason }: { id: string; reason: string }) => terminateContract(id, reason), {
      onSuccess: () => queryClient.invalidateQueries('contracts'),
    }),
  }
}

export function useMaintenanceActions() {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, status, resolutionNote }: { id: string; status: string; resolutionNote?: string }) =>
      updateMaintenanceStatus(id, status, resolutionNote),
    { onSuccess: () => queryClient.invalidateQueries('maintenance') },
  )
}

export function useNotificationActions() {
  const queryClient = useQueryClient()
  return {
    markRead: useMutation(markNotificationRead, { onSuccess: () => queryClient.invalidateQueries('notifications') }),
    markAllRead: useMutation(markAllNotificationsRead, {
      onSuccess: () => queryClient.invalidateQueries('notifications'),
    }),
  }
}

export function useServiceFeeActions() {
  const queryClient = useQueryClient()
  return useMutation(toggleServiceFee, { onSuccess: () => queryClient.invalidateQueries('service-fees') })
}
