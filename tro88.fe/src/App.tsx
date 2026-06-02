import { Outlet, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Bell, Building2, ChartBar, CreditCard, Home, LogOut, Receipt, Settings, User, Wrench, Zap } from './icons'
import { clearAuth, logout } from './services/authService'
import { NotificationDropdown } from './components/shared/NotificationDropdown'

const ownerNav = [
  { to: '/dashboard', label: 'Tổng quan', icon: Home },
  { to: '/houses', label: 'Nhà trọ', icon: Building2 },
  { to: '/invoices', label: 'Hóa đơn', icon: CreditCard },
  { to: '/utility-readings', label: 'Điện nước', icon: Zap },
  { to: '/maintenance', label: 'Bảo trì', icon: Wrench },
  { to: '/service-fees', label: 'Dịch vụ', icon: Settings },
  { to: '/statistics', label: 'Thống kê', icon: ChartBar },
]

const adminNav = [
  { to: '/admin', label: 'Nhà trọ', icon: Building2 },
  { to: '/admin/users', label: 'Người dùng', icon: User },
  { to: '/audit-logs', label: 'Nhật ký', icon: ChartBar },
]

const tenantNav = [
  { to: '/my/rooms', label: 'Tìm phòng', icon: Building2 },
  { to: '/my/invoices', label: 'Hóa đơn', icon: Receipt },
  { to: '/my/service-fees', label: 'Dịch vụ', icon: Settings },
  { to: '/my/maintenance', label: 'Bảo trì', icon: Wrench },
  { to: '/my/notifications', label: 'Thông báo', icon: Bell },
  { to: '/my/profile', label: 'Cá nhân', icon: User },
]

function Link({ to, className, children, ...props }: { to: string; className?: string; children: ReactNode; 'aria-label'?: string }) {
  return <a href={to} className={className} {...props}>{children}</a>
}

function isActive(pathname: string, target: string) {
  return pathname === target || (target !== '/dashboard' && pathname.startsWith(target))
}

function OwnerLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const role = localStorage.getItem('authRole')
  const navigation = role === 'Admin' ? adminNav : ownerNav

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuth()
      window.location.href = '/login'
    }
  }

  return (
    <div className="owner-layout">
      <aside className="owner-sidebar">
        <Link to={role === 'Admin' ? '/admin' : '/dashboard'} className="brand">
          <span>88</span>
          <strong>Tro88</strong>
        </Link>
        <nav className="owner-nav" aria-label="Owner navigation">
          {navigation.map((item) => {
            const Icon = item.icon
            let toPath = item.to
            if (role !== 'Admin' && toPath === '/houses') {
              const ownerId = localStorage.getItem('authUserId')
              if (ownerId) {
                toPath = `/houses/${ownerId}`
              }
            }
            return (
              <Link key={item.to} to={toPath} className={isActive(pathname, item.to) ? 'active' : ''}>
                <Icon />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <div className="owner-main">
        <header className="topbar">
          <div>
            <small>Tro88</small>
            <strong>{navigation.find((item) => isActive(pathname, item.to))?.label ?? 'Quản lý'}</strong>
          </div>
          <div className="topbar-actions">
            <NotificationDropdown />
            <Link to="/profile" className="avatar-link">AT</Link>
            <button className="icon-button" type="button" onClick={handleLogout} aria-label="Đăng xuất">
              <LogOut />
            </button>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}

function TenantLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div className="tenant-shell">
      <header className="tenant-top-nav">
        <Link to="/my/rooms" className="brand">
          <span>88</span>
          <strong>Tro88</strong>
        </Link>
        <nav aria-label="Tenant navigation">
          {tenantNav.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.to} to={item.to} className={isActive(pathname, item.to) ? 'active' : ''}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </header>
      <main className="tenant-main">
        <Outlet />
      </main>
    </div>
  )
}

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <Outlet />
    </main>
  )
}

export function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isPortal = pathname === '/'
  const isAuth = pathname.startsWith('/login') || pathname.startsWith('/auth/') || pathname === '/register' || pathname === '/forgot-password' || pathname === '/complete-profile'
  const isTenant = pathname.startsWith('/my')

  if (isPortal) {
    return <Outlet />
  }

  if (isAuth) {
    return <AuthLayout />
  }

  if (isTenant) {
    return <TenantLayout />
  }

  return <OwnerLayout />
}
