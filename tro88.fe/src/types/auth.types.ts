export type LoginRole = 'Tenant' | 'Owner' | 'Admin'

export interface LoginRequest {
  username: string
  password: string
}

export interface GoogleLoginRequest {
  idToken: string
}

export interface AuthResponseDto {
  accessToken: string
  refreshToken: string
  userId: string
  fullName: string
  email: string
  role: LoginRole
}
