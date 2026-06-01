import { useMutation, useQueryClient } from 'react-query'
import { updateProfile, changePassword, UserProfile, UpdateProfileRequest, ChangePasswordRequest } from './api'
import { QK } from '../../../../queryClient'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (data: UpdateProfileRequest) => updateProfile(data),
    {
      onSuccess: (updatedUser: UserProfile) => {
        queryClient.setQueryData(QK.me, updatedUser)
        alert('Cập nhật hồ sơ thành công!')
      },
      onError: (error: Error) => {
        alert(`Lỗi: ${error.message}`)
      }
    }
  )
}

export const useChangePassword = () => {
  return useMutation(
    (data: ChangePasswordRequest) => changePassword(data),
    {
      onSuccess: () => {
        alert('Đổi mật khẩu thành công!')
      },
      onError: (error: Error) => {
        alert(`Lỗi: ${error.message}`)
      }
    }
  )
}