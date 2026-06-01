import { useQuery } from 'react-query'
import { read, houses, QK } from '../../shared'
import { fetchHouses } from '../../../services/houseService'
import { ProvinceOption, WardOption } from '../../shared'

interface UseDataProps {
  filters?: {
    page?: number
    pageSize?: number
    status?: string
    keyword?: string
  }
}

export const useData = ({ filters }: UseDataProps = {}) => {
  // Fetch danh sách houses
  const { data, total, isLoading, refetch } = useQuery(
    [QK.houses, filters],
    () => read('/Houses', houses),
    {
      staleTime: 1000 * 60 * 5,
    }
  )

  return {
    data: data ?? [],
    total: total ?? 0,
    isLoading,
    refetch,
  }
}