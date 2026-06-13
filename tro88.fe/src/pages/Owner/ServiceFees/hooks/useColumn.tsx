import { useMemo } from 'react'
import { DataColumn, formatCurrency, formatDate, StatusPill } from '../../../../shared/components/DataPage'
import { ServiceFeeDto } from '../service/types'

interface UseColumnProps {
  handleToggle: (id: string) => void
  handleEdit: (item: ServiceFeeDto) => void
}

export function useColumn({ handleToggle, handleEdit }: UseColumnProps) {
  const columns = useMemo<Array<DataColumn<ServiceFeeDto>>>(
    () => [
      { key: 'name', title: 'Tên phí', render: (item) => <strong>{item.name}</strong> },
      { key: 'type', title: 'Loại phí', render: (item) => item.feeType === 'Fixed' ? 'Cố định tháng' : 'Theo đơn vị sử dụng' },
      { key: 'amount', title: 'Mức phí', render: (item) => `${formatCurrency(item.amount)}${item.unit ? `/${item.unit}` : ''}` },
      { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
      { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.isActive ? 'Active' : 'Inactive'} /> },
      {
        key: 'actions',
        title: 'Thao tác',
        render: (item) => (
          <div className="actions" style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="button button--ghost" onClick={() => handleToggle(item.id)}>
              Bật/tắt
            </button>
            <button type="button" className="button button--ghost" onClick={() => handleEdit(item)}>
              Sửa giá
            </button>
          </div>
        ),
      },
    ],
    [handleToggle, handleEdit],
  )

  return { columns }
}
