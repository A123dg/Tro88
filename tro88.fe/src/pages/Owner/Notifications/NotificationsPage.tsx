import { useState } from 'react'
import { DataPage, formatDate, StatusPill } from '../../../components/shared/DataPage'
import { useNotificationActions, useNotifications } from './hooks'
import { ListFilters, NotificationDto } from './service/types'

export function NotificationsPage() {
  const [filters, setFilters] = useState<ListFilters>({ page: 1, pageSize: 10 })
  const query = useNotifications(filters)
  const actions = useNotificationActions()

  return (
    <DataPage<NotificationDto>
      title="Thông báo"
      subtitle="Danh sách thông báo theo tài khoản đang đăng nhập."
      breadcrumb="Tro88 / Thông báo"
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
            <option value="Unread">Chưa đọc</option>
            <option value="Read">Đã đọc</option>
          </select>
          <button type="button" className="button button--primary" onClick={() => actions.markAllRead.mutate()}>Đọc tất cả</button>
        </>
      }
      columns={[
        { key: 'title', title: 'Tiêu đề', render: (item) => <strong>{item.title}</strong> },
        { key: 'body', title: 'Nội dung', render: (item) => item.body },
        { key: 'type', title: 'Loại', render: (item) => item.type },
        { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
        { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.status} /> },
        { key: 'actions', title: 'Thao tác', render: (item) => <button type="button" className="button button--ghost" onClick={() => actions.markRead.mutate(item.id)}>Đã đọc</button> },
      ]}
    />
  )
}
