import { useMutation } from 'react-query'
import { googleLogin, login, persistAuth } from '../services/authService'

export function useLogin() {
  return useMutation(login, {
    onSuccess: (response) => {
      persistAuth(response.data)
    },
  })
}

export function useGoogleLogin() {
  return useMutation(googleLogin, {
    onSuccess: (response) => {
      persistAuth(response.data)
    },
  })
}
