import { Select } from 'antd'
import { DataPage } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useServiceFeeActions, useServiceFees } from './hooks'
import { useColumn } from './hooks/useColumn'
import { ListFilters, ServiceFeeDto } from './service/types'

export function ServiceFeesPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const query = useServiceFees(filters)
  const toggle = useServiceFeeActions()
  const { columns } = useColumn({ handleToggle: (id) => toggle.mutate(id) })

  return (
    <DataPage<ServiceFeeDto>
      title="Quản lý phí dịch vụ"
      subtitle="Theo dõi phí gửi xe, vệ sinh, internet và các khoản thu định kỳ."
      breadcrumb="Tro88 / Phí dịch vụ"
      items={query.data?.items ?? []}
      meta={query.data?.meta}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
      actions={
        <Select
          value={filters.isActive === undefined ? '' : String(filters.isActive)}
          onChange={(value) => setFilters({ ...filters, isActive: value ? value === 'true' : undefined, page: 1 })}
          options={[
            { value: '', label: 'Tất cả' },
            { value: 'true', label: 'Đang dùng' },
            { value: 'false', label: 'Tạm tắt' },
          ]}
        />
      }
      columns={columns}
    />
  )
}
