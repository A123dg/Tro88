import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { ProfilePage } from './ProfilePage'

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.profile,
  component: ProfilePage,
})
