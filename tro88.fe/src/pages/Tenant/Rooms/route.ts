import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../../../rootRoute'
import { TenantRoomsPage } from './RoomsPage'

export const TenantRoomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my/rooms',
  component: TenantRoomsPage,
})

export default TenantRoomsRoute
