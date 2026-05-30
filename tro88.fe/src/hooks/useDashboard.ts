import { useQuery } from 'react-query'
import { fetchAdminDashboard, fetchOwnerDashboard, fetchTenantDashboard } from '../services/dashboardService'
import { fetchHouses, HouseFilters } from '../services/houseService'
import { fetchCurrentUser } from '../services/userService'

export const DASHBOARD_KEYS = {
  admin: ['dashboard', 'admin'] as const,
  owner: ['dashboard', 'owner'] as const,
  tenant: ['dashboard', 'tenant'] as const,
  houses: (filters?: HouseFilters) => ['houses', filters] as const,
  me: ['users', 'me'] as const,
}

export function useAdminDashboard() {
  return useQuery(DASHBOARD_KEYS.admin, fetchAdminDashboard, {
    select: (response) => response.data,
  })
}

export function useOwnerDashboard() {
  return useQuery(DASHBOARD_KEYS.owner, fetchOwnerDashboard, {
    select: (response) => response.data,
  })
}

export function useTenantDashboard() {
  return useQuery(DASHBOARD_KEYS.tenant, fetchTenantDashboard, {
    select: (response) => response.data,
  })
}

export function useHouses(filters?: HouseFilters) {
  return useQuery(DASHBOARD_KEYS.houses(filters), () => fetchHouses(filters), {
    keepPreviousData: true,
  })
}

export function useCurrentUser() {
  return useQuery(DASHBOARD_KEYS.me, fetchCurrentUser, {
    select: (response) => response.data,
  })
}
