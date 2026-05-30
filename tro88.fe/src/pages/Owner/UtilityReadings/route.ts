import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { UtilityReadingsPage } from './UtilityReadingsPage'

export const utilityReadingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.utilityReadings,
  component: UtilityReadingsPage,
})
