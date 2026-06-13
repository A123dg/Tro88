// Component: Tenant/ServiceFees/ServiceFeesPage, Owner/Notifications/NotificationsPage, Owner/Tenants/TenantsPage, Owner/UtilityReadings/UtilityReadingsPage, Owner/ServiceFees/ServiceFeesPage, Owner/Maintenance/MaintenancePage, Owner/Invoices/InvoicesPage, Owner/Contracts/ContractsPage, Admin/Users/UsersPage, Admin/AuditLogs/AuditLogsPage
import type { ReactNode } from 'react'
import type { TableProps } from 'antd'
import { MetaData } from '../../types/room.types'
import TableWithPagination from './table-pagination'

export interface DataColumn<T> {
  key: string
  title: string
  render: (item: T) => ReactNode
}

interface DataPageProps<T> {
  title: string
  subtitle: string
  breadcrumb: string
  columns: Array<DataColumn<T>>
  items: T[]
  meta?: MetaData
  isLoading: boolean
  isError: boolean
  actions?: ReactNode
  onRetry: () => void
  onPageChange: (page: number, pageSize?: number) => void
}

export function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}d`
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'Chua co'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function StatusPill({ value }: { value: string }) {
  const statusLabels: Record<string, string> = {
    new: 'Mới tạo',
    open: 'Mới tạo',
    inprogress: 'Đang xử lý',
    resolved: 'Đã hoàn thành',
    done: 'Đã hoàn thành',
    draft: 'Nháp',
    active: 'Hiệu lực',
    expired: 'Hết hạn',
    terminated: 'Chấm dứt'
  }
  const displayVal = statusLabels[value.toLowerCase()] || value
  return <span className={`status-pill status-pill--${value.toLowerCase()}`}>{displayVal}</span>
}

export function DataPage<T extends { id: string }>({
  title,
  subtitle,
  breadcrumb,
  columns,
  items,
  meta,
  isLoading,
  isError,
  actions,
  onRetry,
  onPageChange,
}: DataPageProps<T>) {
  const page = meta?.page ?? 1
  const pageSize = meta?.pageSize ?? 10
  const tableColumns: TableProps<T>['columns'] = columns.map((column) => ({
    key: column.key,
    title: column.title,
    className: column.key === 'actions' ? 'action-column' : undefined,
    render: (_, item) => column.render(item),
  }))

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </header>

      {actions ? <section className="data-actions data-actions__row">{actions}</section> : null}

      {isError ? (
        <section className="room-error">
          <strong>Không thể tải dữ liệu</strong>
          <button type="button" className="button button--primary" onClick={onRetry}>Thu lai</button>
        </section>
      ) : null}

      {!isError ? (
        <section className="data-table data-table--antd">
          <TableWithPagination
            columns={tableColumns}
            dataSource={items}
            loading={isLoading}
            rowKey="id"
            scroll={{ x: true }}
            pagination={{
              current: page,
              pageSize,
              total: meta?.total ?? items.length,
              onChange: onPageChange,
            }}
            locale={{ emptyText: 'Không có dữ liệu' }}
          />
        </section>
      ) : null}
    </main>
  )
}
