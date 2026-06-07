import { useMemo } from 'react'
import { DataColumn, formatCurrency, formatDate, StatusPill } from '../../../../components/shared/DataPage'
import { ContractDto } from '../service/types'
import { navigateTo } from '../../../Tro88Screens/shared'

interface UseColumnProps {
  handleActivate: (id: string) => void
  handleTerminate: (id: string) => void
}

export function useColumn({ handleActivate, handleTerminate }: UseColumnProps) {
  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  
  const columns = useMemo<Array<DataColumn<ContractDto>>>(
    () => [
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
            <button type="button" className="button button--primary" onClick={() => navigateTo(isTenant ? `/my/contracts/${item.id}` : `/contracts/${item.id}`)}>
              Xem
            </button>
            {!isTenant && item.status === 'Draft' && (
              <button type="button" className="button button--primary" onClick={() => handleActivate(item.id)}>
                Kích hoạt
              </button>
            )}
            {!isTenant && item.status === 'Active' && (
              <button type="button" className="button button--ghost" onClick={() => handleTerminate(item.id)}>
                Kết thúc
              </button>
            )}
          </div>
        ),
      },
    ],
    [handleActivate, handleTerminate, isTenant],
  )

  return { columns }
}
