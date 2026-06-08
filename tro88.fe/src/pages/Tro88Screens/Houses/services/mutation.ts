import { useMutation, useQueryClient } from 'react-query'
import { createHouse, updateHouse, deleteHouse } from '../../../../services/houseService'
import { QK } from '../../shared'

export const useCreateHouseMutation = (options?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
  const queryClient = useQueryClient()
  return useMutation(createHouse, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(QK.houses)
      if (options?.onSuccess) options.onSuccess(data)
    },
    onError: (error) => {
      if (options?.onError) options.onError(error)
    }
  })
}

export const useUpdateHouseMutation = (options?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
  const queryClient = useQueryClient()
  return useMutation(updateHouse, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(QK.houses)
      queryClient.invalidateQueries(['house-detail', variables.id])
      if (options?.onSuccess) options.onSuccess(data)
    },
    onError: (error) => {
      if (options?.onError) options.onError(error)
    }
  })
}

export const useDeleteHouseMutation = (options?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
  const queryClient = useQueryClient()
  return useMutation(deleteHouse, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(QK.houses)
      if (options?.onSuccess) options.onSuccess(data)
    },
    onError: (error) => {
      if (options?.onError) options.onError(error)
    }
  })
}
