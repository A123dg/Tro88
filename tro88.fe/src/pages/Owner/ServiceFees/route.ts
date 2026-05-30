import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { ServiceFeesPage } from './ServiceFeesPage'

export const serviceFeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.serviceFees,
  component: ServiceFeesPage,
})
