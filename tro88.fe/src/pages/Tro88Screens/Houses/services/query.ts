import { useQuery } from 'react-query'
import { fetchHouses, fetchHouseDetail, HouseFilters } from '../../../../services/houseService'
import { fetchProvinceOptions, fetchWardOptions, read, QK, rooms } from '../../shared'

export const useHousesQuery = (filters?: HouseFilters, enabled = true) => {
  return useQuery(
    [QK.houses, filters],
    () => fetchHouses(filters),
    {
      enabled,
      staleTime: 1000 * 60 * 5,
    }
  )
}

export const useHouseDetailQuery = (id: string | null, enabled = true) => {
  return useQuery(
    ['house-detail', id],
    () => fetchHouseDetail(id ?? ''),
    {
      enabled: enabled && Boolean(id),
      retry: 1,
    }
  )
}

export const useProvincesQuery = () => {
  return useQuery(['public-provinces'], fetchProvinceOptions, {
    staleTime: 1000 * 60 * 60 * 24,
  })
}

export const useWardsQuery = (provinceId?: string) => {
  return useQuery(
    ['public-wards', provinceId],
    () => fetchWardOptions(provinceId ?? ''),
    {
      enabled: Boolean(provinceId),
      staleTime: 1000 * 60 * 60 * 24,
    }
  )
}

export const useRoomsQuery = (enabled = true) => {
  return useQuery(QK.rooms, () => read('/Rooms', rooms), { enabled })
}
