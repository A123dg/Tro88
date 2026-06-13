export interface IHouseFromAPI {
  id: string
  name: string
  address: string
  province?: string | null
  district?: string | null
  tinhThanhOption?: { id: string; name: string } | null
  xaPhuongOption?: { id: string; name: string } | null
  description?: string | null
  mediaUrl?: string | null
  mediaUrls?: string[]
  status: 'PendingApproval' | 'Active' | 'Inactive' | string
  isActive: boolean
  totalRooms: number
  occupiedRooms: number
  createdAt: string
}

export interface IAddHouse {
  name: string
  address: string
  province?: string
  district?: string
  description?: string
  files?: File[]
}

export interface IEditHouse extends IAddHouse {
  id: string
}

export interface IEditStatusHouse {
  id: string
  status: 'PendingApproval' | 'Active' | 'Inactive'
}
