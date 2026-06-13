import { createRoute, createRouter, redirect, Outlet } from '@tanstack/react-router'
import { rootRoute } from './rootRoute'
import { AuditLogsPage } from './pages/Admin/AuditLogs/AuditLogsPage'
import { SystemAdminPage } from './pages/Admin/SystemAdmin/SystemAdminPage'
import { AdminUsersPage } from './pages/Admin/Users/UsersPage'
import { CompleteProfilePage } from './pages/Auth/CompleteProfilePage'
import { AdminLoginPage, GoogleCallbackPage, OwnerLoginPage, TenantLoginPage } from './pages/Auth/Login'
import { ContractsPage } from './pages/Owner/Contracts/ContractsPage'
import { TenantsPage } from './pages/Owner/Tenants/TenantsPage'
import { InvoicesPage } from './pages/Owner/Invoices/InvoicesPage'
import { MaintenancePage } from './pages/Owner/Maintenance/MaintenancePage'
import { NotificationsPage } from './pages/Owner/Notifications/NotificationsPage'
import { ProfilePage } from './pages/Owner/Profile/ProfilePage'
import { ServiceFeesPage } from './pages/Owner/ServiceFees/ServiceFeesPage'
import { AdminServiceFeesPage } from './pages/Admin/ServiceFees/ServiceFeesPage'
import { UtilityReadingsPage } from './pages/Owner/UtilityReadings/UtilityReadingsPage'
import { TenantRoomsPage } from './pages/Tenant/Rooms/RoomsPage'
import { TenantServiceFeesPage } from './pages/Tenant/ServiceFees/ServiceFeesPage'
import { PortalPage } from './pages/Portal/PortalPage'

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
  MaintenancePage as TenantMaintenancePage,
  MyInvoicesPage,
  OwnerDashboardPage,
  RegisterPage,
  RoomDetailPage,
  RoomFormPage,
  StatisticsPage,
  TenantDashboardPage,
  UtilityHistoryPage,
} from './tro88Screens'

// Layout/Wrapper Components from App
import { OwnerLayout, TenantLayout, AuthLayout } from './App'

// Helper function to check auth
const checkAuth = (requiredRole?: 'Admin' | 'Tenant' | 'Owner') => {
  const token = localStorage.getItem('accessToken')
  const role = localStorage.getItem('authRole')

  if (!token) {
    if (requiredRole === 'Admin') throw redirect({ to: '/login/admin' })
    if (requiredRole === 'Tenant') throw redirect({ to: '/login/tenant' })
    throw redirect({ to: '/login/owner' })
  }

  if (requiredRole && role !== requiredRole) {
    if (role === 'Admin') throw redirect({ to: '/admin' })
    if (role === 'Tenant') throw redirect({ to: '/my/rooms' })
    throw redirect({ to: '/dashboard' })
  }
}

// 1. PUBLIC / PORTAL ROUTE
const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PortalPage,
})

// 2. AUTH LAYOUT & ROUTES
const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth',
  component: AuthLayout,
  beforeLoad: () => {
    const token = localStorage.getItem('accessToken')
    const role = localStorage.getItem('authRole')
    if (token) {
      if (role === 'Admin') throw redirect({ to: '/admin' })
      if (role === 'Tenant') throw redirect({ to: '/my/rooms' })
      throw redirect({ to: '/dashboard' })
    }
  }
})

const tenantLoginRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/login', component: TenantLoginPage })
const tenantLoginExplicitRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/login/tenant', component: TenantLoginPage })
const ownerLoginRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/login/owner', component: OwnerLoginPage })
const adminLoginRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/login/admin', component: AdminLoginPage })
const registerRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/register', component: RegisterPage })
const forgotPasswordRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/forgot-password', component: ForgotPasswordPage })
const completeProfileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/complete-profile', component: CompleteProfilePage })
const googleCallbackRoute = createRoute({ getParentRoute: () => authLayoutRoute, path: '/auth/google/callback', component: GoogleCallbackPage })

// 3. ADMIN LAYOUT & ROUTES
const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin',
  component: OwnerLayout, // Uses OwnerLayout which dynamically adapts to Admin role
  beforeLoad: () => checkAuth('Admin')
})

const adminIndexRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin', component: SystemAdminPage })
const adminUsersRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/users', component: AdminUsersPage })
const adminServiceFeesRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/admin/service-fees', component: AdminServiceFeesPage })
const adminAuditLogsRoute = createRoute({ getParentRoute: () => adminLayoutRoute, path: '/audit-logs', component: AuditLogsPage })

// 4. TENANT LAYOUT & ROUTES
const tenantLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'tenant',
  component: TenantLayout,
  beforeLoad: () => checkAuth('Tenant')
})

const tenantRoomsRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/rooms', component: TenantRoomsPage })
const tenantContractsRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/contracts', component: ContractsPage })
const tenantContractsDetailRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/contracts/$id', component: ContractDetailPage })
const tenantInvoicesRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/invoices', component: MyInvoicesPage })
const tenantInvoicesDetailRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/invoices/$id', component: InvoiceDetailPage })
const tenantServiceFeesRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/service-fees', component: TenantServiceFeesPage })
const tenantMaintenanceRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/maintenance', component: TenantMaintenancePage })
const tenantMaintenanceCreateRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/maintenance/create', component: MaintenanceCreatePage })
const tenantMaintenanceDetailRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/maintenance/$id', component: MaintenanceDetailPage })
const tenantNotificationsRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/notifications', component: NotificationsPage })
const tenantProfileRoute = createRoute({ getParentRoute: () => tenantLayoutRoute, path: '/my/profile', component: ProfilePage })
const tenantDashboardRedirectRoute = createRoute({
  getParentRoute: () => tenantLayoutRoute,
  path: '/my/dashboard',
  beforeLoad: () => { throw redirect({ to: '/my/rooms' }) }
})

// 5. OWNER LAYOUT & ROUTES
const ownerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'owner',
  component: OwnerLayout,
  beforeLoad: () => checkAuth('Owner')
})

const ownerDashboardRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/dashboard', component: OwnerDashboardPage })
const ownerHousesRoute = createRoute({
  getParentRoute: () => ownerLayoutRoute,
  path: '/houses',
  beforeLoad: () => {
    const ownerId = localStorage.getItem('authUserId')
    throw redirect({ to: ownerId ? `/houses/${ownerId}` as any : '/dashboard' })
  }
})
const ownerHousesListRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/houses/$ownerId', component: HousesPage })
const ownerHousesCreateRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/houses/create', component: HouseFormPage })
const ownerHousesDetailRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/houses/detail/$id', component: HouseDetailPage })
const ownerHousesEditRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/houses/detail/$id/edit', component: HouseFormPage })
const ownerHousesDetailRoomsRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/houses/detail/$id/rooms', component: HouseDetailPage })

const ownerTenantsRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/tenants', component: TenantsPage })
const ownerContractsRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/contracts', component: ContractsPage })
const ownerContractsCreateRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/contracts/create', component: ContractCreatePage })
const ownerContractsDetailRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/contracts/$id', component: ContractDetailPage })

const ownerRoomsCreateRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/rooms/create', component: RoomFormPage })
const ownerRoomsDetailRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/rooms/$id', component: RoomDetailPage })
const ownerRoomsEditRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/rooms/$id/edit', component: RoomFormPage })

const ownerInvoicesRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/invoices', component: InvoicesPage })
const ownerInvoicesCreateRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/invoices/create', component: InvoiceCreatePage })
const ownerInvoicesBulkRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/invoices/bulk', component: InvoiceBulkPage })
const ownerInvoicesDetailRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/invoices/$id', component: InvoiceDetailPage })

const ownerUtilityReadingsRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/utility-readings', component: UtilityReadingsPage })
const ownerUtilityHistoryRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/utility-history', component: UtilityHistoryPage })

const ownerMaintenanceRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/maintenance', component: MaintenancePage })
const ownerMaintenanceCreateRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/maintenance/create', component: MaintenanceCreatePage })
const ownerMaintenanceDetailRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/maintenance/$id', component: MaintenanceDetailPage })

const ownerNotificationsRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/notifications', component: NotificationsPage })
const ownerAiAgentRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/ai-agent', component: AiAgentPage })
const ownerStatisticsRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/statistics', component: StatisticsPage })
const ownerServiceFeesRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/service-fees', component: ServiceFeesPage })
const ownerProfileRoute = createRoute({ getParentRoute: () => ownerLayoutRoute, path: '/profile', component: ProfilePage })

// Compile Route Tree
const routeTree = rootRoute.addChildren([
  portalRoute,
  
  // Auth Layout Groups
  authLayoutRoute.addChildren([
    tenantLoginRoute,
    tenantLoginExplicitRoute,
    ownerLoginRoute,
    adminLoginRoute,
    registerRoute,
    forgotPasswordRoute,
    googleCallbackRoute
  ]),
  completeProfileRoute,

  // Admin Layout Groups
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminUsersRoute,
    adminServiceFeesRoute,
    adminAuditLogsRoute
  ]),

  // Tenant Layout Groups
  tenantLayoutRoute.addChildren([
    tenantRoomsRoute,
    tenantContractsRoute,
    tenantContractsDetailRoute,
    tenantInvoicesRoute,
    tenantInvoicesDetailRoute,
    tenantServiceFeesRoute,
    tenantMaintenanceRoute,
    tenantMaintenanceCreateRoute,
    tenantMaintenanceDetailRoute,
    tenantNotificationsRoute,
    tenantProfileRoute,
    tenantDashboardRedirectRoute
  ]),

  // Owner Layout Groups
  ownerLayoutRoute.addChildren([
    ownerDashboardRoute,
    ownerHousesRoute,
    ownerHousesListRoute,
    ownerHousesCreateRoute,
    ownerHousesDetailRoute,
    ownerHousesEditRoute,
    ownerHousesDetailRoomsRoute,
    ownerTenantsRoute,
    ownerContractsRoute,
    ownerContractsCreateRoute,
    ownerContractsDetailRoute,
    ownerRoomsCreateRoute,
    ownerRoomsDetailRoute,
    ownerRoomsEditRoute,
    ownerInvoicesRoute,
    ownerInvoicesCreateRoute,
    ownerInvoicesBulkRoute,
    ownerInvoicesDetailRoute,
    ownerUtilityReadingsRoute,
    ownerUtilityHistoryRoute,
    ownerMaintenanceRoute,
    ownerMaintenanceCreateRoute,
    ownerMaintenanceDetailRoute,
    ownerNotificationsRoute,
    ownerAiAgentRoute,
    ownerStatisticsRoute,
    ownerServiceFeesRoute,
    ownerProfileRoute
  ])
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
