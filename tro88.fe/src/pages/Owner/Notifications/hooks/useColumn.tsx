import { useMemo } from 'react'
import { DataColumn, formatDate, StatusPill } from '../../../../components/shared/DataPage'
import { NotificationDto } from '../service/types'

interface UseColumnProps {
  handleMarkRead: (id: string) => void
}

export function useColumn({ handleMarkRead }: UseColumnProps) {
  const columns = useMemo<Array<DataColumn<NotificationDto>>>(
    () => [
      { key: 'title', title: 'Tiêu đề', render: (item) => <strong>{item.title}</strong> },
      { key: 'body', title: 'Nội dung', render: (item) => item.body },
      { key: 'type', title: 'Loại', render: (item) => item.type },
      { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
      { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.status} /> },
      {
        key: 'actions',
        title: 'Thao tác',
        render: (item) => (
          <button type="button" className="button button--ghost" onClick={() => handleMarkRead(item.id)}>
            Đã đọc
          </button>
        ),
      },
    ],
    [handleMarkRead],
  )

  return { columns }
}
