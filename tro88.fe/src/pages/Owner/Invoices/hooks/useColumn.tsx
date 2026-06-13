import { useMemo } from 'react'
import { DataColumn, formatCurrency, formatDate, StatusPill } from '../../../../shared/components/DataPage'
import { InvoiceDto } from '../service/types'

interface UseColumnProps {
  handleSend: (id: string) => void
  handleMarkPaid: (id: string) => void
  onViewDetail: (item: InvoiceDto) => void
}

export function useColumn({ handleSend, handleMarkPaid, onViewDetail }: UseColumnProps) {
  const columns = useMemo<Array<DataColumn<InvoiceDto>>>(
    () => [
      {
        key: 'code',
        title: 'Mã hóa đơn',
        render: (item) => (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onViewDetail(item)
            }}
            style={{ fontWeight: 'bold', color: '#f4845f' }}
          >
            {item.invoiceCode}
          </a>
        ),
      },
      { key: 'period', title: 'Kỳ', render: (item) => `${item.billingMonth}/${item.billingYear}` },
      { key: 'amount', title: 'Tổng tiền', render: (item) => formatCurrency(item.totalAmount) },
      { key: 'dueDate', title: 'Hạn thanh toán', render: (item) => formatDate(item.dueDate) },
      { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.status} /> },
      {
        key: 'actions',
        title: 'Thao tác',
        render: (item) => (
          <div className="row-actions">
            <button type="button" className="button button--ghost" onClick={() => handleSend(item.id)}>
              Gửi
            </button>
            <button type="button" className="button button--primary" onClick={() => handleMarkPaid(item.id)}>
              Đã thu
            </button>
          </div>
        ),
      },
    ],
    [handleMarkPaid, handleSend, onViewDetail],
  )

  return { columns }
}
