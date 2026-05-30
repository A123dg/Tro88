import { Outlet, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Bell, Bot, Building2, ChartBar, CreditCard, FileText, Home, LogOut, Menu, Receipt, Settings, User, Wrench, Zap } from './icons'
import { clearAuth, logout } from './services/authService'

const ownerNav = [
  { to: '/dashboard', label: 'Tổng quan', icon: Home },
  { to: '/houses', label: 'Nhà trọ', icon: Building2 },
  { to: '/houses/demo/rooms', label: 'Phòng', icon: Menu },
  { to: '/contracts', label: 'Hợp đồng', icon: FileText },
  { to: '/invoices', label: 'Hóa đơn', icon: CreditCard },
  { to: '/utility-readings', label: 'Điện nước', icon: Zap },
  { to: '/maintenance', label: 'Bảo trì', icon: Wrench },
  { to: '/service-fees', label: 'Dịch vụ', icon: Settings },
  { to: '/statistics', label: 'Thống kê', icon: ChartBar },
  { to: '/ai-agent', label: 'AI Trợ lý', icon: Bot },
]

const tenantNav = [
  { to: '/my/dashboard', label: 'Trang chủ', icon: Home },
  { to: '/my/invoices', label: 'Hóa đơn', icon: Receipt },
  { to: '/my/maintenance', label: 'Bảo trì', icon: Wrench },
  { to: '/notifications', label: 'Thông báo', icon: Bell },
  { to: '/profile', label: 'Cá nhân', icon: User },
]

function Link({ to, className, children, ...props }: { to: string; className?: string; children: ReactNode; 'aria-label'?: string }) {
  return <a href={to} className={className} {...props}>{children}</a>
}

function isActive(pathname: string, target: string) {
  return pathname === target || (target !== '/dashboard' && pathname.startsWith(target))
}

function OwnerLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

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
        <Link to="/dashboard" className="brand">
          <span>88</span>
          <strong>Tro88</strong>
        </Link>
        <nav className="owner-nav" aria-label="Owner navigation">
          {ownerNav.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.to} to={item.to} className={isActive(pathname, item.to) ? 'active' : ''}>
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
            <strong>{ownerNav.find((item) => isActive(pathname, item.to))?.label ?? 'Quản lý'}</strong>
          </div>
          <div className="topbar-actions">
            <Link to="/notifications" className="icon-button" aria-label="Thông báo">
              <Bell />
              <span className="notice-dot">3</span>
            </Link>
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
      <main className="tenant-main">
        <Outlet />
      </main>
      <nav className="tenant-bottom-nav" aria-label="Tenant navigation">
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
  const isAuth = pathname.startsWith('/login') || pathname === '/register' || pathname === '/forgot-password'
  const isTenant = pathname.startsWith('/my')

  if (isAuth) {
    return <AuthLayout />
  }

  if (isTenant) {
    return <TenantLayout />
  }

  return <OwnerLayout />
}
