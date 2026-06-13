import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { QUERY_KEYS } from '../queryClient'
import { changeRoomStatus, createRoom, deleteRoom, fetchRooms, RoomPayload, updateRoom } from '../services/roomService'
import {
  MetaData,
  RoomDto,
  RoomFilters,
  RoomsQueryData,
  RoomStats,
  RoomStatus,
} from '../types/room.types'

import { useNotification } from './useNotification'

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
  const { showSuccessNotify, showErrorNotify } = useNotification()

  return useMutation(
    (payload: { id: string; status: RoomStatus }) => changeRoomStatus(payload.id, payload.status),
    {
      onSuccess: (response) => {
        if (!response.success) {
          showErrorNotify(response.message || 'Không thể cập nhật trạng thái phòng')
          return
        }
        queryClient.invalidateQueries('rooms')
        showSuccessNotify('Cập nhật trạng thái phòng thành công')
      },
      onError: (error: any) => {
        console.error('Change status failed:', error)
        showErrorNotify(error?.message || 'Không thể cập nhật trạng thái phòng')
      },
    },
  )
}

export function useCreateRoom(houseId: string) {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()

  return useMutation((payload: RoomPayload) => createRoom(houseId, payload), {
    onSuccess: (response) => {
      if (!response.success) {
        showErrorNotify(response.message || 'Không thể thêm phòng mới')
        return
      }
      queryClient.invalidateQueries('rooms')
      queryClient.invalidateQueries('houses')
      showSuccessNotify('Thêm phòng mới thành công')
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể thêm phòng mới')
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()

  return useMutation((payload: { id: string; data: RoomPayload }) => updateRoom(payload.id, payload.data), {
    onSuccess: (response) => {
      if (!response.success) {
        showErrorNotify(response.message || 'Không thể cập nhật thông tin phòng')
        return
      }
      queryClient.invalidateQueries('rooms')
      queryClient.invalidateQueries('houses')
      showSuccessNotify('Cập nhật thông tin phòng thành công')
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể cập nhật thông tin phòng')
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()
  const { showSuccessNotify, showErrorNotify } = useNotification()

  return useMutation((id: string) => deleteRoom(id), {
    onSuccess: (response) => {
      if (!response.success) {
        showErrorNotify(response.message || 'Không thể xóa phòng')
        return
      }
      queryClient.invalidateQueries('rooms')
      queryClient.invalidateQueries('houses')
      showSuccessNotify('Xóa phòng thành công')
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể xóa phòng')
    },
  })
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
