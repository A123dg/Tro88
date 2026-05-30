import { MetaData } from './room.types'

export interface OwnerDashboardDto {
  totalHouses: number
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  activeContracts: number
  pendingInvoices: number
  totalRevenue: number
  pendingMaintenanceRequests: number
}

export interface AdminDashboardDto {
  totalUsers: number
  totalOwners: number
  totalTenants: number
  totalHouses: number
  totalRooms: number
  occupiedRooms: number
  availableRooms: number
  activeContracts: number
  pendingInvoices: number
  totalRevenue: number
  pendingMaintenanceRequests: number
  totalAuditLogs: number
}

export interface TenantDashboardDto {
  currentRoomId: string | null
  currentRoomNumber: string | null
  currentHouseName: string | null
  monthlyRent: number
  unpaidInvoices: number
  totalDue: number
  nextPaymentDue: string | null
  activeMaintenanceRequests: number
}

export interface HouseDto {
  id: string
  name: string
  address: string
  province?: string | null
  district?: string | null
  description?: string | null
  isActive: boolean
  totalRooms: number
  occupiedRooms: number
  createdAt: string
}

export interface UserDto {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  nationalId?: string | null
  dateOfBirth?: string | null
  avatarUrl?: string | null
  isActive: boolean
  createdAt: string
}

export interface PagedData<T> {
  items: T[]
  meta: MetaData
}
