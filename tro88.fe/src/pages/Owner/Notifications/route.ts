import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { NotificationsPage } from './NotificationsPage'

export const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.notifications,
  component: NotificationsPage,
})
