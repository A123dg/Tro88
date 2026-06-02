import { useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { persistAuth } from '../../../services/authService'
import { fetchCurrentUser } from '../../../services/userService'
import { AuthResponseDto, LoginRole } from '../../../types/auth.types'

function defaultRedirect(role?: string) {
  if (role === 'Tenant') return '/my/rooms'
  if (role === 'Admin') return '/admin'
  return '/dashboard'
}

export function GoogleCallbackPage() {
  const search = useSearch({ strict: false }) as Partial<AuthResponseDto> & {
    state?: string
    error?: string
    role?: LoginRole
  }

  useEffect(() => {
    const handleCallback = async () => {
      if (search.error) {
        window.location.href = `/login?error=${search.error}`
        return
      }

      if (!search.accessToken || !search.refreshToken || !search.userId || !search.fullName || !search.email || !search.role) {
        window.location.href = '/login?error=missing_auth_data'
        return
      }

      try {
        persistAuth({
          accessToken: search.accessToken,
          refreshToken: search.refreshToken,
          userId: search.userId,
          fullName: search.fullName,
          email: search.email,
          role: search.role,
        })

        const response = await fetchCurrentUser()
        const user = response.data
        if (!user.fullName?.trim() || !user.phoneNumber?.trim() || !user.dateOfBirth) {
          window.location.href = '/complete-profile'
          return
        }

        const state = search.state ? JSON.parse(atob(search.state)) : null
        window.location.href = state?.redirectTo || defaultRedirect(user.role)
      } catch {
        window.location.href = '/login?error=auth_failed'
      }
    }

    handleCallback()
  }, [search])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FDF6F0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Đang xác thực với Google...</p>
      </div>
    </div>
  )
}
