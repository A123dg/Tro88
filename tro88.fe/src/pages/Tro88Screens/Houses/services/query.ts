import { useQuery } from 'react-query'
import { fetchHouses, fetchHouseDetail } from '../../../services/houseService'
import { fetchProvinceOptions, fetchWardOptions, ProvinceOption, WardOption } from '../../shared'
import { QK } from '../../shared'

// Fetch danh sách houses
export const useHousesQuery = (filters?: { page?: number; pageSize?: number; status?: string; keyword?: string }) => {
  return useQuery(
    [QK.houses, filters],
    () => fetchHouses(filters),
    {
      staleTime: 1000 * 60 * 5,
    }
  )
}

// Fetch chi tiết house
export const useHouseByIdQuery = (id: string | null) => {
  return useQuery(
    ['house-detail', id],
    () => fetchHouseDetail(id!),
    {
      enabled: Boolean(id),
      staleTime: 1000 * 60 * 5,
    }
  )
}

// Fetch danh sách tỉnh/thành
export const useProvincesQuery = () => {
  return useQuery(
    ['public-provinces'],
    fetchProvinceOptions,
    {
      staleTime: 1000 * 60 * 60 * 24,
    }
  )
}

// Fetch danh sách xã/phường theo tỉnh
export const useWardsQuery = (provinceId: string | null) => {
  return useQuery(
    ['public-wards', provinceId],
    () => fetchWardOptions(provinceId ?? ''),
    {
      enabled: Boolean(provinceId),
      staleTime: 1000 * 60 * 60 * 24,
    }
  )
}