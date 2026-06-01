import { Select } from 'antd'
import { DataPage } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useMaintenanceActions, useMaintenanceRequests } from './hooks'
import { useColumn } from './hooks/useColumn'
import { ListFilters, MaintenanceRequestDto } from './service/types'

export function MaintenancePage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const query = useMaintenanceRequests(filters)
  const updateStatus = useMaintenanceActions()
  const { columns } = useColumn({
    handleUpdateStatus: (id, status, resolutionNote) => updateStatus.mutate({ id, status, resolutionNote }),
  })

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
      onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
      actions={
        <Select
          value={filters.status ?? ''}
          onChange={(value) => setFilters({ ...filters, status: value || undefined, page: 1 })}
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'Open', label: 'Mới tạo' },
            { value: 'InProgress', label: 'Đang xử lý' },
            { value: 'Resolved', label: 'Đã xử lý' },
          ]}
        />
      }
      columns={columns}
    />
  )
}
