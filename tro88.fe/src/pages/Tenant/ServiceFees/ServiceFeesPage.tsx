import { Select } from 'antd'
import { DataColumn, DataPage, formatCurrency, formatDate, StatusPill } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useServiceFees } from '../../Owner/ServiceFees/hooks'
import { ListFilters, ServiceFeeDto } from '../../Owner/ServiceFees/service/types'

const columns: Array<DataColumn<ServiceFeeDto>> = [
  { key: 'name', title: 'Tên phí', render: (item) => <strong>{item.name}</strong> },
  { key: 'type', title: 'Loại phí', render: (item) => item.feeType },
  { key: 'amount', title: 'Mức phí', render: (item) => `${formatCurrency(item.amount)}${item.unit ? `/${item.unit}` : ''}` },
  { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
  { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.isActive ? 'Active' : 'Inactive'} /> },
]

export function TenantServiceFeesPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10, isActive: true })
  const query = useServiceFees(filters)

  return (
    <DataPage<ServiceFeeDto>
      title="Dịch vụ"
      subtitle="Xem các khoản phí dịch vụ đang áp dụng cho phòng thuê."
      breadcrumb="Tro88 / Người dùng / Dịch vụ"
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
