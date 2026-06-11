export interface ListFilters {
  page?: number
  pageSize?: number
  status?: string
  roomId?: string
  contractId?: string
  tenantId?: string
  houseId?: string
  isActive?: boolean
  month?: number
  year?: number
  module?: string
  action?: string
  keyword?: string
  requestedByUserId?: string
}

export interface InvoiceDto {
  id: string
  contractId: string
  roomId: string
  invoiceCode: string
  billingMonth: number
  billingYear: number
  rentAmount: number
  electricityAmount: number
  waterAmount: number
  serviceAmount: number
  totalAmount: number
  dueDate: string
  paidAt?: string | null
  status: string
  notes?: string | null
}

export interface ContractDto {
  id: string
  roomId: string
  roomNumber: string
  tenantId: string
  tenantName: string
  tenantPhone: string
  tenantEmail: string
  contractCode: string
  startDate: string
  endDate: string
  monthlyRent: number
  depositAmount: number
  paymentDayOfMonth: number
  status: string
  signedAt?: string | null
  isOwnerSigned: boolean
  isTenantSigned: boolean
}

export interface MaintenanceRequestDto {
  id: string
  roomId: string
  roomNumber: string
  requestedByName: string
  assignedToName?: string | null
  title: string
  description: string
  category: string
  priority: string
  status: string
  imageUrls: string[]
  resolutionNote?: string | null
  resolvedAt?: string | null
  createdAt: string
}

export interface NotificationDto {
  id: string
  title: string
  body: string
  type: string
  referenceId?: string | null
  status: string
  readAt?: string | null
  createdAt: string
}

export interface ServiceDto {
  id: string
  name: string
  feeType: string
  unit?: string | null
  isActive: boolean
  createdAt: string
}

export interface ServiceFeeDto {
  id: string
  houseId: string
  serviceId: string
  name: string
  feeType: string
  amount: number
  unit?: string | null
  isActive: boolean
  createdAt: string
}

export interface UtilityReadingDto {
  id: string
  roomId: string
  roomNumber: string
  month: number
  year: number
  electricityOld: number
  electricityNew: number
  electricityUsage: number
  waterOld: number
  waterNew: number
  waterUsage: number
  notes?: string | null
  createdAt: string
}

export interface AuditLogDto {
  id: string
  userId?: string | null
  action: string
  module: string
  targetId?: string | null
  oldValues?: string | null
  newValues?: string | null
  ipAddress?: string | null
  createdAt: string
}

export interface OwnerTenantDto {
  id: string
  fullName: string
  phoneNumber?: string | null
  email?: string | null
  roomNumber: string
  houseName: string
  startDate: string
  endDate?: string | null
  monthlyRent: number
  depositAmount: number
  relationType: string
}

