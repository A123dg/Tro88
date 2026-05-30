import { useState } from 'react'
import { DataPage, formatDate, StatusPill } from '../../../components/shared/DataPage'
import { useMaintenanceActions, useMaintenanceRequests } from './hooks'
import { ListFilters, MaintenanceRequestDto } from './service/types'

export function MaintenancePage() {
  const [filters, setFilters] = useState<ListFilters>({ page: 1, pageSize: 10 })
  const query = useMaintenanceRequests(filters)
  const updateStatus = useMaintenanceActions()

  return (
    <DataPage<MaintenanceRequestDto>
      title="Quản lý bảo trì"
      subtitle="Theo dõi yêu cầu sửa chữa, phân loại ưu tiên và trạng thái xử lý."
      breadcrumb="Tro88 / Bảo trì"
      items={query.data?.items ?? []}
      meta={query.data?.meta}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      actions={
        <select value={filters.status ?? ''} onChange={(event) => setFilters({ ...filters, status: event.target.value || undefined, page: 1 })}>
          <option value="">Tất cả trạng thái</option>
          <option value="Open">Mới tạo</option>
          <option value="InProgress">Đang xử lý</option>
          <option value="Resolved">Đã xử lý</option>
        </select>
      }
      columns={[
        { key: 'title', title: 'Yêu cầu', render: (item) => <strong>{item.title}</strong> },
        { key: 'room', title: 'Phòng', render: (item) => `P.${item.roomNumber}` },
        { key: 'requestedBy', title: 'Người gửi', render: (item) => item.requestedByName },
        { key: 'category', title: 'Loại', render: (item) => item.category },
        { key: 'priority', title: 'Ưu tiên', render: (item) => item.priority },
        { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
        { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.status} /> },
        {
          key: 'actions',
          title: 'Thao tác',
          render: (item) => (
            <div className="row-actions">
              <button type="button" className="button button--ghost" onClick={() => updateStatus.mutate({ id: item.id, status: 'InProgress' })}>Xử lý</button>
              <button type="button" className="button button--primary" onClick={() => updateStatus.mutate({ id: item.id, status: 'Resolved', resolutionNote: 'Đã xử lý' })}>Hoàn tất</button>
            </div>
          ),
        },
      ]}
    />
  )
}
