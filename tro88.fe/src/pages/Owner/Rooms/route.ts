import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { RoomsPage } from './RoomsPage'

export const roomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.rooms,
  component: RoomsPage,
})
