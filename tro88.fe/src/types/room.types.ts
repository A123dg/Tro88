export enum RoomStatus {
  Available = 'Available',
  Occupied = 'Occupied',
  Maintenance = 'Maintenance',
}

export interface RoomOccupantDto {
  userId: string
  fullName: string
  email?: string | null
  phoneNumber?: string | null
  checkIn: string
  relationType: string
}

export interface RoomDto {
  id: string
  houseId: string
  roomNumber: string
  floor: number
  area: number
  maxOccupants: number
  monthlyRent: number
  depositAmount: number
  status: RoomStatus
  electricityUnitPrice: number
  waterUnitPrice: number
  description?: string
  imageUrls: string[]
  serviceFees: RoomServiceFeeDto[]
  occupants?: RoomOccupantDto[]
  // Additional fields for tenant room search
  houseName?: string
  address?: string
  province?: string
  district?: string
  ownerName?: string
  ownerRating?: number
  amenities?: string[]
}

export interface RoomFilters {
  status?: RoomStatus | 'all'
  page?: number
  pageSize?: number
  search?: string
  sort?: RoomSort
}

export type RoomSort = 'roomNumberAsc' | 'rentAsc' | 'rentDesc' | 'areaDesc'

export interface MetaData {
  page: number
  pageSize: number
  total: number
  totalPage: number
}

export interface ApiResponse<T> {
  code: number
  success: boolean
  message: string
  data: T
  metaData?: MetaData
}

export interface RoomsQueryData {
  rooms: RoomDto[]
  meta: MetaData
}

export interface RoomStats {
  total: number
  occupied: number
  available: number
  maintenance: number
  occupancyRate: number
}

export interface RoomServiceFeeDto {
  serviceId: string
  name: string
  amount: number
}
