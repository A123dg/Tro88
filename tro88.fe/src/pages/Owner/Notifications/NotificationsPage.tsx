import { Select } from 'antd'
import { DataPage } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useNotificationActions, useNotifications } from './hooks'
import { useColumn } from './hooks/useColumn'
import { ListFilters, NotificationDto } from './service/types'

export function NotificationsPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const query = useNotifications(filters)
  const actions = useNotificationActions()
  const { columns } = useColumn({ handleMarkRead: (id) => actions.markRead.mutate(id) })

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
      onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
      actions={
        <>
          <Select
            value={filters.status ?? ''}
            onChange={(value) => setFilters({ ...filters, status: value || undefined, page: 1 })}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'Unread', label: 'Chưa đọc' },
              { value: 'Read', label: 'Đã đọc' },
            ]}
          />
          <button type="button" className="button button--primary" onClick={() => actions.markAllRead.mutate()}>
            Đọc tất cả
          </button>
        </>
      }
      columns={columns}
    />
  )
}
