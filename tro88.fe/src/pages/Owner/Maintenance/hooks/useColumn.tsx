import { useMemo } from 'react'
import { DataColumn, formatDate, StatusPill } from '../../../../components/shared/DataPage'
import { MaintenanceRequestDto } from '../service/types'

interface UseColumnProps {
  handleUpdateStatus: (id: string, status: string, resolutionNote?: string) => void
}

export function useColumn({ handleUpdateStatus }: UseColumnProps) {
  const columns = useMemo<Array<DataColumn<MaintenanceRequestDto>>>(
    () => [
      { key: 'title', title: 'Yêu cầu', render: (item) => <strong>{item.title}</strong> },
      { key: 'room', title: 'Phòng', render: (item) => `P.${item.roomNumber}` },
      { key: 'requestedBy', title: 'Người gửi', render: (item) => item.requestedByName },
      { key: 'category', title: 'Loại', render: (item) => item.category },
      { key: 'priority', title: 'Ưu tiên', render: (item) => item.priority },
      { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
      { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.status} /> },
      {
        key: 'actions',
        title: 'Thao tác',
        render: (item) => (
          <div className="row-actions">
            <button type="button" className="button button--ghost" onClick={() => handleUpdateStatus(item.id, 'InProgress')}>
              Xử lý
            </button>
            <button type="button" className="button button--primary" onClick={() => handleUpdateStatus(item.id, 'Resolved', 'Đã xử lý')}>
              Hoàn tất
            </button>
          </div>
        ),
      },
    ],
    [handleUpdateStatus],
  )

  return { columns }
}
