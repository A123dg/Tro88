import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { TenantPage } from './TenantPage'

export const tenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.tenant,
  component: TenantPage,
})
