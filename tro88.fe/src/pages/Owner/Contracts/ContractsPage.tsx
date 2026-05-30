import { useState } from 'react'
import { DataPage, formatCurrency, formatDate, StatusPill } from '../../../components/shared/DataPage'
import { useContractActions, useContracts } from './hooks'
import { ContractDto, ListFilters } from './service/types'

export function ContractsPage() {
  const [filters, setFilters] = useState<ListFilters>({ page: 1, pageSize: 10 })
  const query = useContracts(filters)
  const actions = useContractActions()

  return (
    <DataPage<ContractDto>
      title="Quản lý hợp đồng"
      subtitle="Theo dõi hợp đồng thuê phòng, người thuê, ngày hiệu lực và tiền cọc."
      breadcrumb="Tro88 / Hợp đồng"
      items={query.data?.items ?? []}
      meta={query.data?.meta}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      actions={
        <select value={filters.status ?? ''} onChange={(event) => setFilters({ ...filters, status: event.target.value || undefined, page: 1 })}>
          <option value="">Tất cả trạng thái</option>
          <option value="Draft">Nháp</option>
          <option value="Active">Hiệu lực</option>
          <option value="Terminated">Đã chấm dứt</option>
          <option value="Expired">Hết hạn</option>
        </select>
      }
      columns={[
        { key: 'code', title: 'Mã hợp đồng', render: (item) => <strong>{item.contractCode}</strong> },
        { key: 'room', title: 'Phòng', render: (item) => `P.${item.roomNumber}` },
        { key: 'tenant', title: 'Người thuê', render: (item) => item.tenantName },
        { key: 'rent', title: 'Tiền thuê', render: (item) => formatCurrency(item.monthlyRent) },
        { key: 'date', title: 'Thời hạn', render: (item) => `${formatDate(item.startDate)} - ${formatDate(item.endDate)}` },
        { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.status} /> },
        {
          key: 'actions',
          title: 'Thao tác',
          render: (item) => (
            <div className="row-actions">
              <button type="button" className="button button--primary" onClick={() => actions.activate.mutate(item.id)}>Kích hoạt</button>
              <button type="button" className="button button--ghost" onClick={() => actions.terminate.mutate({ id: item.id, reason: 'Chấm dứt từ giao diện quản lý' })}>Kết thúc</button>
            </div>
          ),
        },
      ]}
    />
  )
}
