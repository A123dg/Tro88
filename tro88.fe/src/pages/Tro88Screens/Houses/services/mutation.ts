import { useMutation } from 'react-query'
import { createHouse, updateHouse, changeHouseStatus } from '../../../services/houseService'
import { queryClient } from '../../../queryClient'
import { IAddHouse, IEditHouse, IEditStatusHouse } from './types'

export const useCreateHouse = () => {
  return useMutation({
    mutationFn: (payload: IAddHouse) => createHouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}

export const useUpdateHouse = () => {
  return useMutation({
    mutationFn: (payload: IEditHouse) => updateHouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}

export const useUpdateHouseStatus = () => {
  return useMutation({
    mutationFn: ({ id, status }: IEditStatusHouse) => changeHouseStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}

export const useDeleteHouse = () => {
  return useMutation({
    mutationFn: (id: string) => Promise.resolve({ success: true } as any), // TODO: implement delete API
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}