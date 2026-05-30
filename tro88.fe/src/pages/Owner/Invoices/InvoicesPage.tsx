import { useState } from 'react'
import { DataPage, formatCurrency, formatDate, StatusPill } from '../../../components/shared/DataPage'
import { useInvoiceActions, useInvoices } from './hooks'
import { InvoiceDto, ListFilters } from './service/types'

export function InvoicesPage() {
  const [filters, setFilters] = useState<ListFilters>({ page: 1, pageSize: 10 })
  const query = useInvoices(filters)
  const actions = useInvoiceActions()

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
      onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      actions={
        <>
          <select value={filters.status ?? ''} onChange={(event) => setFilters({ ...filters, status: event.target.value || undefined, page: 1 })}>
            <option value="">Tất cả trạng thái</option>
            <option value="Unpaid">Chưa thanh toán</option>
            <option value="Paid">Đã thanh toán</option>
            <option value="Overdue">Quá hạn</option>
          </select>
        </>
      }
      columns={[
        { key: 'code', title: 'Mã hóa đơn', render: (item) => <strong>{item.invoiceCode}</strong> },
        { key: 'period', title: 'Kỳ', render: (item) => `${item.billingMonth}/${item.billingYear}` },
        { key: 'amount', title: 'Tổng tiền', render: (item) => formatCurrency(item.totalAmount) },
        { key: 'dueDate', title: 'Hạn thanh toán', render: (item) => formatDate(item.dueDate) },
        { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.status} /> },
        {
          key: 'actions',
          title: 'Thao tác',
          render: (item) => (
            <div className="row-actions">
              <button type="button" className="button button--ghost" onClick={() => actions.send.mutate(item.id)}>Gửi</button>
              <button type="button" className="button button--primary" onClick={() => actions.markPaid.mutate(item.id)}>Đã thu</button>
            </div>
          ),
        },
      ]}
    />
  )
}
