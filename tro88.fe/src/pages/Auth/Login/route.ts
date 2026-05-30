import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { AdminLoginPage, OwnerLoginPage, TenantLoginPage } from './LoginPage'

export const tenantLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.tenantLogin,
  component: TenantLoginPage,
})

export const ownerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.ownerLogin,
  component: OwnerLoginPage,
})

export const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.adminLogin,
  component: AdminLoginPage,
})
