import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { OwnerPage } from './OwnerPage'

export const ownerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.owner,
  component: OwnerPage,
})
