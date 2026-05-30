import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { ContractsPage } from './ContractsPage'

export const contractsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.contracts,
  component: ContractsPage,
})
