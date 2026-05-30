import { createRoute } from '@tanstack/react-router'
import { ROUTE_PATHS } from '../../../constant/routes'
import { rootRoute } from '../../../rootRoute'
import { AuditLogsPage } from './AuditLogsPage'

export const auditLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_PATHS.auditLogs,
  component: AuditLogsPage,
})
