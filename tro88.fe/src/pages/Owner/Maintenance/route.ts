import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { MaintenancePage } from './MaintenancePage'

export const maintenanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.maintenance,
  component: MaintenancePage,
})
