import { useMemo } from 'react'
import { DataColumn, formatCurrency, formatDate, StatusPill } from '../../../../components/shared/DataPage'
import { ServiceFeeDto } from '../service/types'

interface UseColumnProps {
  handleToggle: (id: string) => void
}

export function useColumn({ handleToggle }: UseColumnProps) {
  const columns = useMemo<Array<DataColumn<ServiceFeeDto>>>(
    () => [
      { key: 'name', title: 'Tên phí', render: (item) => <strong>{item.name}</strong> },
      { key: 'type', title: 'Loại phí', render: (item) => item.feeType },
      { key: 'amount', title: 'Mức phí', render: (item) => `${formatCurrency(item.amount)}${item.unit ? `/${item.unit}` : ''}` },
      { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
      { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.isActive ? 'Active' : 'Inactive'} /> },
      {
        key: 'actions',
        title: 'Thao tác',
        render: (item) => (
          <button type="button" className="button button--ghost" onClick={() => handleToggle(item.id)}>
            Bật/tắt
          </button>
        ),
      },
    ],
    [handleToggle],
  )

  return { columns }
}
