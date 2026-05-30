import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { InvoicesPage } from './InvoicesPage'

export const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.invoices,
  component: InvoicesPage,
})
