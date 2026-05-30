import { useNavigate, useRouterState } from '@tanstack/react-router'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { ROUTE_PATHS } from '../../../constant/routes'
import { useGoogleLogin, useLogin } from './hooks'
import { LoginRole } from './service/types'

interface LoginPageProps {
  role: LoginRole
  title: string
  subtitle: string
  redirectTo: string
  mode: 'password' | 'google'
}

const roleLabels: Record<LoginRole, string> = {
  Tenant: 'Người ở trọ',
  Owner: 'Quản lý nhà trọ',
  Admin: 'Admin hệ thống',
}

function getLoginErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message === 'INVALID_CREDENTIALS' || message === 'COMMON_403') {
    return 'Sai tài khoản hoặc mật khẩu.'
  }
  if (message === 'ACCOUNT_DEACTIVATED') {
    return 'Tài khoản đã bị khóa.'
  }
  if (message === 'INVALID_GOOGLE_TOKEN') {
    return 'Google token không hợp lệ.'
  }

  return 'Không thể đăng nhập. Kiểm tra thông tin hoặc kết nối API.'
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (element: HTMLElement, options: { theme: string; size: string; width: number; text: string }) => void
        }
      }
    }
  }
}

function LoginForm({ role, title, subtitle, redirectTo, mode }: LoginPageProps) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const login = useLogin()
  const googleLogin = useGoogleLogin()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [idToken, setIdToken] = useState('')
  const [roleError, setRoleError] = useState('')

  const handleAuthSuccess = (actualRole: LoginRole) => {
    if (actualRole !== role) {
      setRoleError(`Tài khoản này có vai trò ${roleLabels[actualRole]}, không phải ${roleLabels[role]}.`)
      return
    }

    navigate({ to: redirectTo })
  }

  useEffect(() => {
    if (mode !== 'google') {
      return
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    if (!clientId || !googleButtonRef.current) {
      return
    }

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        return
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          setRoleError('')
          googleLogin.mutate(
            { idToken: response.credential },
            { onSuccess: (result) => handleAuthSuccess(result.data.role) },
          )
        },
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'signin_with',
      })
    }

    if (window.google) {
      renderGoogleButton()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = renderGoogleButton
    document.head.appendChild(script)
  }, [mode])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRoleError('')

    if (mode === 'google') {
      googleLogin.mutate(
        { idToken },
        { onSuccess: (response) => handleAuthSuccess(response.data.role) },
      )
      return
    }

    login.mutate(
      { username, password },
      {
        onSuccess: (response) => {
          handleAuthSuccess(response.data.role)
        },
      },
    )
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-panel__brand">
          <span>88</span>
          <div>
            <strong>Tro88</strong>
            <small>{roleLabels[role]}</small>
          </div>
        </div>

        <header>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'password' ? (
            <>
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="admin hoặc email admin"
                  autoComplete="username"
                  required
                />
              </label>

              <label>
                Mật khẩu
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                />
              </label>
            </>
          ) : (
            <>
              <div className="google-login-box">
                <div ref={googleButtonRef} />
                <p>Người ở trọ và quản lý nhà trọ đăng nhập bằng Google.</p>
              </div>
              <label>
                Google ID token
                <input
                  type="text"
                  value={idToken}
                  onChange={(event) => setIdToken(event.target.value)}
                  placeholder="Dán ID token khi test local"
                  required={!import.meta.env.VITE_GOOGLE_CLIENT_ID}
                />
              </label>
            </>
          )}

          {login.isError || googleLogin.isError ? (
            <p className="login-error">{getLoginErrorMessage(login.error ?? googleLogin.error)}</p>
          ) : null}
          {roleError ? <p className="login-error">{roleError}</p> : null}

          <button type="submit" className="app-button app-button--primary app-button--full" disabled={login.isLoading || googleLogin.isLoading}>
            {login.isLoading || googleLogin.isLoading ? 'Đang đăng nhập...' : mode === 'google' ? 'Đăng nhập bằng Google token' : 'Đăng nhập'}
          </button>
        </form>

        <nav className="login-switcher" aria-label="Chọn loại tài khoản">
          <a className={pathname === ROUTE_PATHS.tenantLogin || pathname === ROUTE_PATHS.login ? 'active' : ''} href={ROUTE_PATHS.tenantLogin}>Người ở trọ</a>
          <a className={pathname === ROUTE_PATHS.ownerLogin ? 'active' : ''} href={ROUTE_PATHS.ownerLogin}>Quản lý nhà trọ</a>
          <a className={pathname === ROUTE_PATHS.adminLogin ? 'active' : ''} href={ROUTE_PATHS.adminLogin}>Admin</a>
        </nav>
      </section>
    </main>
  )
}

export function TenantLoginPage() {
  return (
    <LoginForm
      role="Tenant"
      title="Đăng nhập người ở trọ"
      subtitle="Truy cập thông tin phòng thuê, hóa đơn và yêu cầu bảo trì."
      redirectTo={ROUTE_PATHS.tenant}
      mode="google"
    />
  )
}

export function OwnerLoginPage() {
  return (
    <LoginForm
      role="Owner"
      title="Đăng nhập quản lý nhà trọ"
      subtitle="Quản lý nhà trọ, phòng, hợp đồng, hóa đơn và vận hành."
      redirectTo={ROUTE_PATHS.owner}
      mode="google"
    />
  )
}

export function AdminLoginPage() {
  return (
    <LoginForm
      role="Admin"
      title="Đăng nhập admin hệ thống"
      subtitle="Truy cập dữ liệu toàn hệ thống, audit logs và thống kê tổng hợp."
      redirectTo={ROUTE_PATHS.admin}
      mode="password"
    />
  )
}
