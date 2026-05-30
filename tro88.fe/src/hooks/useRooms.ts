import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { QUERY_KEYS } from '../queryClient'
import { changeRoomStatus, fetchRooms } from '../services/roomService'
import {
  MetaData,
  RoomDto,
  RoomFilters,
  RoomsQueryData,
  RoomStats,
  RoomStatus,
} from '../types/room.types'

const defaultMeta: MetaData = {
  page: 1,
  pageSize: 10,
  total: 0,
  totalPage: 1,
}

export function useRooms(houseId: string, filters?: RoomFilters) {
  return useQuery<ReturnType<typeof fetchRooms> extends Promise<infer T> ? T : never, Error, RoomsQueryData>(
    [...QUERY_KEYS.rooms(houseId), filters],
    () => fetchRooms(houseId, filters),
    {
      enabled: !!houseId,
      keepPreviousData: true,
      select: (response) => ({
        rooms: response.data,
        meta: response.metaData ?? defaultMeta,
      }),
    },
  )
}

export function useChangeRoomStatus() {
  const queryClient = useQueryClient()

  return useMutation(
    (payload: { id: string; status: RoomStatus }) => changeRoomStatus(payload.id, payload.status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rooms')
      },
      onError: (error) => {
        console.error('Change status failed:', error)
      },
    },
  )
}

export function useRoomStats(rooms: RoomDto[]): RoomStats {
  return useMemo(() => {
    const occupied = rooms.filter((room) => room.status === RoomStatus.Occupied).length
    const available = rooms.filter((room) => room.status === RoomStatus.Available).length
    const maintenance = rooms.filter((room) => room.status === RoomStatus.Maintenance).length

    return {
      total: rooms.length,
      occupied,
      available,
      maintenance,
      occupancyRate: rooms.length > 0 ? Math.round((occupied / rooms.length) * 100) : 0,
    }
  }, [rooms])
}
