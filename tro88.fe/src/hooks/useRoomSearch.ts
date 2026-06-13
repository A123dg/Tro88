import { useQuery } from 'react-query'
import { QK } from '../queryClient'
import { searchAvailableRooms, RoomSearchFilters, RoomSearchResult } from '../services/roomSearchService'
import { MetaData } from '../types/room.types'

const defaultMeta: MetaData = {
  page: 1,
  pageSize: 12,
  total: 0,
  totalPage: 1,
}

export function useRoomSearch(filters: RoomSearchFilters) {
  return useQuery<RoomSearchResult, Error, RoomSearchResult>(
    QK.roomSearch(filters),
    () => searchAvailableRooms(filters),
    {
      keepPreviousData: true,
      select: (response) => ({
        rooms: response.rooms,
        meta: response.meta ?? defaultMeta,
      }),
    }
  )
}
