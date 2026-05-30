import { useState } from 'react'
import { DataPage, formatDate } from '../../../components/shared/DataPage'
import { useAuditLogs } from './hooks'
import { AuditLogDto, ListFilters } from './service/types'

export function AuditLogsPage() {
  const [filters, setFilters] = useState<ListFilters>({ page: 1, pageSize: 20 })
  const query = useAuditLogs(filters)

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
      onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      actions={
        <>
          <input value={filters.module ?? ''} onChange={(event) => setFilters({ ...filters, module: event.target.value || undefined, page: 1 })} placeholder="Module" />
          <input value={filters.action ?? ''} onChange={(event) => setFilters({ ...filters, action: event.target.value || undefined, page: 1 })} placeholder="Action" />
        </>
      }
      columns={[
        { key: 'module', title: 'Module', render: (item) => <strong>{item.module}</strong> },
        { key: 'action', title: 'Hành động', render: (item) => item.action },
        { key: 'user', title: 'UserId', render: (item) => item.userId ?? 'Hệ thống' },
        { key: 'target', title: 'TargetId', render: (item) => item.targetId ?? 'Không có' },
        { key: 'ip', title: 'IP', render: (item) => item.ipAddress ?? 'Không có' },
        { key: 'createdAt', title: 'Thời gian', render: (item) => formatDate(item.createdAt) },
      ]}
    />
  )
}
