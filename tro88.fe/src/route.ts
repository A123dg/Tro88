import { createRoute, createRouter } from '@tanstack/react-router'
import { AuditLogsPage } from './pages/Admin/AuditLogs/AuditLogsPage'
import { SystemAdminPage } from './pages/Admin/SystemAdmin/SystemAdminPage'
import { AdminUsersPage } from './pages/Admin/Users/UsersPage'
import { CompleteProfilePage } from './pages/Auth/CompleteProfilePage'
import { AdminLoginPage, GoogleCallbackPage, OwnerLoginPage, TenantLoginPage } from './pages/Auth/Login'
import { ContractsPage } from './pages/Owner/Contracts/ContractsPage'
import { InvoicesPage } from './pages/Owner/Invoices/InvoicesPage'
import { MaintenancePage } from './pages/Owner/Maintenance/MaintenancePage'
import { NotificationsPage } from './pages/Owner/Notifications/NotificationsPage'
import { ProfilePage } from './pages/Owner/Profile/ProfilePage'
import { ServiceFeesPage } from './pages/Owner/ServiceFees/ServiceFeesPage'
import { UtilityReadingsPage } from './pages/Owner/UtilityReadings/UtilityReadingsPage'
import { TenantRoomsPage } from './pages/Tenant/Rooms/RoomsPage'
import { TenantServiceFeesPage } from './pages/Tenant/ServiceFees/ServiceFeesPage'
import { PortalPage } from './pages/Portal/PortalPage'
import { rootRoute } from './rootRoute'
import {
  AiAgentPage,
  ContractCreatePage,
  ContractDetailPage,
  ContractTenantsPage,
  ForgotPasswordPage,
  HouseDetailPage,
  HouseFormPage,
  HousesPage,
  InvoiceBulkPage,
  InvoiceCreatePage,
  InvoiceDetailPage,
  MaintenanceCreatePage,
  MaintenanceDetailPage,
  MyInvoicesPage,
  OwnerDashboardPage,
  RegisterPage,
  RoomDetailPage,
  RoomFormPage,
  StatisticsPage,
  TenantDashboardPage,
  UtilityHistoryPage,
} from './tro88Screens'

function route(path: string, component: () => JSX.Element) {
  return createRoute({ getParentRoute: () => rootRoute, path, component })
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PortalPage,
})

const housesIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/houses',
  component: () => {
    const role = localStorage.getItem('authRole')
    if (role === 'Admin') {
      window.location.href = '/admin'
    } else if (role === 'Tenant') {
      window.location.href = '/my/rooms'
    } else {
      const ownerId = localStorage.getItem('authUserId')
      window.location.href = ownerId ? `/houses/${ownerId}` : '/dashboard'
    }
    return null
  },
})

const tenantDashboardRedirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my/dashboard',
  component: () => {
    window.location.href = '/my/rooms'
    return null
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  housesIndexRoute,
  route('/login', TenantLoginPage),
  route('/login/tenant', TenantLoginPage),
  route('/login/owner', OwnerLoginPage),
  route('/login/admin', AdminLoginPage),
  route('/auth/google/callback', GoogleCallbackPage),
  route('/complete-profile', CompleteProfilePage),
  route('/register', RegisterPage),
  route('/forgot-password', ForgotPasswordPage),
  route('/admin', SystemAdminPage),
  route('/admin/users', AdminUsersPage),
  route('/dashboard', OwnerDashboardPage),
  route('/tenant/house', HousesPage),
  route('/houses/$ownerId', HousesPage),
  route('/houses/create', HouseFormPage),
  route('/houses/detail/$id', HouseDetailPage),
  route('/houses/detail/$id/edit', HouseFormPage),
  route('/houses/detail/$id/rooms', HouseDetailPage),
  route('/rooms/create', RoomFormPage),
  route('/rooms/$id', RoomDetailPage),
  route('/rooms/$id/edit', RoomFormPage),
  route('/invoices', InvoicesPage),
  route('/invoices/create', InvoiceCreatePage),
  route('/invoices/bulk', InvoiceBulkPage),
  route('/invoices/$id', InvoiceDetailPage),
  route('/utility-readings', UtilityReadingsPage),
  route('/utility-history', UtilityHistoryPage),
  route('/maintenance', MaintenancePage),
  route('/maintenance/create', MaintenanceCreatePage),
  route('/maintenance/$id', MaintenanceDetailPage),
  route('/notifications', NotificationsPage),
  route('/ai-agent', AiAgentPage),
  route('/statistics', StatisticsPage),
  route('/service-fees', ServiceFeesPage),
  route('/profile', ProfilePage),
  route('/audit-logs', AuditLogsPage),
  route('/my/rooms', TenantRoomsPage),
  tenantDashboardRedirectRoute,
  route('/my/invoices', MyInvoicesPage),
  route('/my/service-fees', TenantServiceFeesPage),
  route('/my/maintenance', MaintenancePage),
  route('/my/maintenance/create', MaintenanceCreatePage),
  route('/my/notifications', NotificationsPage),
  route('/my/profile', ProfilePage),
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
