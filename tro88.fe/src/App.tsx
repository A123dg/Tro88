import { Link as RouterLink, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { ReactNode, useLayoutEffect } from 'react'
import { getZoomRatio } from './utils/getZoomRatio'
import { Bell, Building2, ChartBar, CreditCard, FileText, Home, LogOut, Receipt, Settings, User, Wrench, Zap } from './icons'
import { clearAuth, logout } from './services/authService'
import { NotificationDropdown } from './components/shared/NotificationDropdown'
import { AIChatWidget } from './components/shared/AIChatWidget'

const ownerNav = [
  { to: '/dashboard', label: 'Tổng quan', icon: Home },
  { to: '/houses', label: 'Nhà trọ', icon: Building2 },
  { to: '/tenants', label: 'Người ở', icon: User },
  { to: '/contracts', label: 'Hợp đồng', icon: FileText },
  { to: '/invoices', label: 'Hóa đơn', icon: CreditCard },
  { to: '/utility-readings', label: 'Điện nước', icon: Zap },
  { to: '/maintenance', label: 'Bảo trì', icon: Wrench },
  { to: '/service-fees', label: 'Dịch vụ', icon: Settings },
  { to: '/statistics', label: 'Thống kê', icon: ChartBar },
]

const adminNav = [
  { to: '/admin', label: 'Nhà trọ', icon: Building2 },
  { to: '/admin/users', label: 'Người dùng', icon: User },
  { to: '/admin/service-fees', label: 'Dịch vụ', icon: Settings },
  { to: '/audit-logs', label: 'Nhật ký', icon: ChartBar },
]

const tenantNav = [
  { to: '/my/rooms', label: 'Tìm phòng', icon: Building2 },
  { to: '/my/contracts', label: 'Hợp đồng', icon: FileText },
  { to: '/my/invoices', label: 'Hóa đơn', icon: Receipt },
  { to: '/my/service-fees', label: 'Dịch vụ', icon: Settings },
  { to: '/my/maintenance', label: 'Bảo trì', icon: Wrench },
  { to: '/my/profile', label: 'Cá nhân', icon: User },
]

function Link({ to, className, children, ...props }: { to: string; className?: string; children: ReactNode; 'aria-label'?: string }) {
  return (
    <RouterLink to={to as any} className={className} {...props}>
      {children}
    </RouterLink>
  )
}

function isActive(pathname: string, target: string) {
  return pathname === target || (target !== '/dashboard' && pathname.startsWith(target))
}

function getAuthenticatedHome(role: string | null) {
  if (role === 'Admin') return '/admin'
  if (role === 'Tenant') return '/my/rooms'
  return '/dashboard'
}

export function OwnerLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const role = localStorage.getItem('authRole')
  const navigation = role === 'Admin' ? adminNav : ownerNav
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuth()
      navigate({ to: '/login' })
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

export function TenantLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuth()
      navigate({ to: '/login' })
    }
  }

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          <NotificationDropdown />
          <button className="icon-button" type="button" onClick={handleLogout} aria-label="Đăng xuất" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut />
          </button>
        </div>
      </header>
      <main className="tenant-main">
        <div className="content-body">
          <Outlet />
        </div>
      </main>
      <AIChatWidget />
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
  useLayoutEffect(() => {
    const viewportWidth = window.innerWidth || window.document.documentElement.clientWidth;
    const isMobile = viewportWidth < 768;

    if (!isMobile) {
      const zoom = getZoomRatio();
      document.documentElement.style.setProperty('--zoom', zoom.toString());
    } else {
      document.documentElement.style.setProperty('--zoom', '1');
    }
  }, []);

  return <Outlet />
}

