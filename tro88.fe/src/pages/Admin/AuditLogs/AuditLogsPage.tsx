import { DataPage } from '../../../shared/components/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useAuditLogs } from './hooks'
import { useColumn } from './hooks/useColumn'
import { AuditLogDto, ListFilters } from './service/types'

export function AuditLogsPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const query = useAuditLogs(filters)
  const { columns } = useColumn()

  return (
    <DataPage<AuditLogDto>
      title="Nhật ký hệ thống"
      subtitle="Theo dõi thao tác dữ liệu toàn hệ thống dành cho admin."
      breadcrumb="Tro88 / Admin / Audit logs"
      items={query.data?.items ?? []}
      meta={query.data?.meta}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
      actions={
        <>
          <input value={filters.module ?? ''} onChange={(event) => setFilters({ ...filters, module: event.target.value || undefined, page: 1 })} placeholder="Module" />
          <input value={filters.action ?? ''} onChange={(event) => setFilters({ ...filters, action: event.target.value || undefined, page: 1 })} placeholder="Action" />
        </>
      }
      columns={columns}
    />
  )
}
