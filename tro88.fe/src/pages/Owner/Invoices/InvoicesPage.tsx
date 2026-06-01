import { Select } from 'antd'
import { DataPage } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useInvoiceActions, useInvoices } from './hooks'
import { useColumn } from './hooks/useColumn'
import { InvoiceDto, ListFilters } from './service/types'

export function InvoicesPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const query = useInvoices(filters)
  const actions = useInvoiceActions()
  const { columns } = useColumn({
    handleSend: (id) => actions.send.mutate(id),
    handleMarkPaid: (id) => actions.markPaid.mutate(id),
  })

  return (
    <DataPage<InvoiceDto>
      title="Quản lý hóa đơn"
      subtitle="Theo dõi hóa đơn tiền phòng, điện nước, dịch vụ và trạng thái thanh toán."
      breadcrumb="Tro88 / Hóa đơn"
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
            { value: 'Unpaid', label: 'Chưa thanh toán' },
            { value: 'Paid', label: 'Đã thanh toán' },
            { value: 'Overdue', label: 'Quá hạn' },
          ]}
        />
      }
      columns={columns}
    />
  )
}
