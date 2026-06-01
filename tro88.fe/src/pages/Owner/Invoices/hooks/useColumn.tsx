import { useMemo } from 'react'
import { DataColumn, formatCurrency, formatDate, StatusPill } from '../../../../components/shared/DataPage'
import { InvoiceDto } from '../service/types'

interface UseColumnProps {
  handleSend: (id: string) => void
  handleMarkPaid: (id: string) => void
}

export function useColumn({ handleSend, handleMarkPaid }: UseColumnProps) {
  const columns = useMemo<Array<DataColumn<InvoiceDto>>>(
    () => [
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
    [handleMarkPaid, handleSend],
  )

  return { columns }
}
