import { useState } from 'react'
import { ROUTE_PATHS } from '../../../constant/routes'
import { useLogin } from './hooks'
import { LoginRole } from './service/types'
import loginIllustration from '../../../assets/login-illustration.png'
import { Form, Input, Button } from 'antd'

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

function LoginForm({ role, title, subtitle, redirectTo, mode }: LoginPageProps) {
  const login = useLogin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [roleError, setRoleError] = useState('')

  const getRedirectTarget = () => {
    const value = new URLSearchParams(window.location.search).get('redirect_uri')
    if (!value) return redirectTo

    try {
      const url = new URL(value, window.location.origin)
      if (url.origin !== window.location.origin) return redirectTo
      return `${url.pathname}${url.search}${url.hash}`
    } catch {
      return value.startsWith('/') ? value : redirectTo
    }
  }

  const handleGoogleRedirect = () => {
    setRoleError('')
    const frontendCallback = `${window.location.origin}/auth/google/callback`
    const state = btoa(JSON.stringify({ role, redirectTo: getRedirectTarget(), frontendCallback }))
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5073/api/v1'
    const backendRedirectUri = `${apiUrl}/Auth/google/redirect?state=${encodeURIComponent(state)}`

    window.location.href = backendRedirectUri
  }

  const handleAuthSuccess = (actualRole: LoginRole) => {
    if (actualRole !== role) {
      setRoleError(`Tài khoản này có vai trò ${roleLabels[actualRole]}, không phải ${roleLabels[role]}.`)
      return
    }

    window.location.href = getRedirectTarget()
  }

  const handleSubmit = () => {
    setRoleError('')

    if (mode === 'google') {
      handleGoogleRedirect()
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
      <figure className="login-page__illustration">
        <img src={loginIllustration} alt="Tro88 Authentication" />
      </figure>
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

        <Form className="login-form" layout="vertical" onFinish={handleSubmit}>
          {mode === 'password' ? (
            <>
              <Form.Item label="Tên đăng nhập" required>
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  size="large"
                />
              </Form.Item>

              <Form.Item label="Mật khẩu" required>
                <Input.Password
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  size="large"
                />
              </Form.Item>
            </>
          ) : (
            <div className="google-login-box">
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.89h12.66c-.55 2.92-2.2 5.39-4.69 7.05l7.3 5.66C43.5 35.8 46.5 30.47 46.5 24z"/>
                  <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.3-5.66c-2.03 1.36-4.62 2.17-8.59 2.17-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
              </div>
              <p style={{ margin: 0, fontWeight: 500, color: '#4b5563' }}>
                Đăng nhập nhanh với tài khoản Google.
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                Bạn sẽ được chuyển hướng an toàn tới cổng xác thực Google.
              </p>
            </div>
          )}

          {login.isError ? <p className="login-error">{getLoginErrorMessage(login.error)}</p> : null}
          {roleError ? <p className="login-error">{roleError}</p> : null}

          <Button
            type="primary"
            htmlType="submit"
            className="app-button app-button--primary app-button--full"
            style={{ height: 'auto' }}
            loading={login.isLoading}
            disabled={login.isLoading}
          >
            {mode === 'google' ? 'Đăng nhập bằng Google' : 'Đăng nhập'}
          </Button>
        </Form>

        {role !== 'Admin' && <a className="login-home-link" href="/">Về trang giới thiệu</a>}
      </section>
    </main>
  )
}

export function TenantLoginPage() {
  return (
    <LoginForm
      role="Tenant"
      title="Đăng nhập người ở trọ"
      subtitle="Truy cập thông tin phòng thuê, hóa đơn, dịch vụ và yêu cầu bảo trì."
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
      subtitle="Truy cập duyệt nhà trọ, quản lý người dùng và nhật ký hệ thống."
      redirectTo={ROUTE_PATHS.admin}
      mode="password"
    />
  )
}
