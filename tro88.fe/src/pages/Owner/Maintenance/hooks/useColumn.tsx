import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { DataColumn, formatDate, StatusPill } from '../../../../components/shared/DataPage'
import { MaintenanceRequestDto } from '../service/types'

interface UseColumnProps {
  handleUpdateStatus: (id: string, status: string, resolutionNote?: string) => void
}

export function useColumn({ handleUpdateStatus }: UseColumnProps) {
  const columns = useMemo<Array<DataColumn<MaintenanceRequestDto>>>(
    () => [
      {
        key: 'title',
        title: 'Yêu cầu',
        render: (item) => (
          <Link to={`/maintenance/${item.id}` as any} style={{ fontWeight: 600, color: 'var(--primary)' }}>
            {item.title}
          </Link>
        ),
      },
      { key: 'room', title: 'Phòng', render: (item) => `P.${item.roomNumber}` },
      { key: 'requestedBy', title: 'Người gửi', render: (item) => item.requestedByName },
      { key: 'category', title: 'Loại', render: (item) => item.category },
      {
        key: 'priority',
        title: 'Ưu tiên',
        render: (item) => {
          const priorityLabels: Record<string, string> = {
            Normal: 'Bình thường',
            Soon: 'Cần sớm',
            Urgent: 'Khẩn cấp'
          }
          return priorityLabels[item.priority] || item.priority
        }
      },
      { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
      { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.status} /> },
    ],
    [],
  )

  return { columns }
}
