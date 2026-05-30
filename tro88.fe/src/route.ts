import { createRoute, createRouter } from '@tanstack/react-router'
import { AuditLogsPage } from './pages/Admin/AuditLogs/AuditLogsPage'
import { AdminLoginPage, OwnerLoginPage, TenantLoginPage } from './pages/Auth/Login/LoginPage'
import { ContractsPage } from './pages/Owner/Contracts/ContractsPage'
import { InvoicesPage } from './pages/Owner/Invoices/InvoicesPage'
import { MaintenancePage } from './pages/Owner/Maintenance/MaintenancePage'
import { NotificationsPage } from './pages/Owner/Notifications/NotificationsPage'
import { ProfilePage } from './pages/Owner/Profile/ProfilePage'
import { RoomsPage } from './pages/Owner/Rooms/RoomsPage'
import { ServiceFeesPage } from './pages/Owner/ServiceFees/ServiceFeesPage'
import { UtilityReadingsPage } from './pages/Owner/UtilityReadings/UtilityReadingsPage'
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
  component: () => {
    window.location.href = '/dashboard'
    return null
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  route('/login', TenantLoginPage),
  route('/login/tenant', TenantLoginPage),
  route('/login/owner', OwnerLoginPage),
  route('/login/admin', AdminLoginPage),
  route('/register', RegisterPage),
  route('/forgot-password', ForgotPasswordPage),
  route('/dashboard', OwnerDashboardPage),
  route('/houses', HousesPage),
  route('/houses/create', HouseFormPage),
  route('/houses/$id', HouseDetailPage),
  route('/houses/$id/edit', HouseFormPage),
  route('/houses/$id/rooms', RoomsPage),
  route('/rooms/create', RoomFormPage),
  route('/rooms/$id', RoomDetailPage),
  route('/rooms/$id/edit', RoomFormPage),
  route('/contracts', ContractsPage),
  route('/contracts/create', ContractCreatePage),
  route('/contracts/$id', ContractDetailPage),
  route('/contracts/$id/tenants', ContractTenantsPage),
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
  route('/my/dashboard', TenantDashboardPage),
  route('/my/invoices', MyInvoicesPage),
  route('/my/maintenance', MaintenancePage),
  route('/my/maintenance/create', MaintenanceCreatePage),
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
