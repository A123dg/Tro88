import { useState } from 'react'
import { DataPage, formatCurrency, formatDate, StatusPill } from '../../../components/shared/DataPage'
import { useServiceFeeActions, useServiceFees } from './hooks'
import { ListFilters, ServiceFeeDto } from './service/types'

export function ServiceFeesPage() {
  const [filters, setFilters] = useState<ListFilters>({ page: 1, pageSize: 20 })
  const query = useServiceFees(filters)
  const toggle = useServiceFeeActions()

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
      onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      actions={
        <select value={filters.isActive === undefined ? '' : String(filters.isActive)} onChange={(event) => setFilters({ ...filters, isActive: event.target.value ? event.target.value === 'true' : undefined, page: 1 })}>
          <option value="">Tất cả</option>
          <option value="true">Đang dùng</option>
          <option value="false">Tạm tắt</option>
        </select>
      }
      columns={[
        { key: 'name', title: 'Tên phí', render: (item) => <strong>{item.name}</strong> },
        { key: 'type', title: 'Loại phí', render: (item) => item.feeType },
        { key: 'amount', title: 'Mức phí', render: (item) => `${formatCurrency(item.amount)}${item.unit ? `/${item.unit}` : ''}` },
        { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
        { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.isActive ? 'Active' : 'Inactive'} /> },
        { key: 'actions', title: 'Thao tác', render: (item) => <button type="button" className="button button--ghost" onClick={() => toggle.mutate(item.id)}>Bật/tắt</button> },
      ]}
    />
  )
}
