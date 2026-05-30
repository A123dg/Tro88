import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { SystemAdminPage } from './SystemAdminPage'

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.admin,
  component: SystemAdminPage,
})
