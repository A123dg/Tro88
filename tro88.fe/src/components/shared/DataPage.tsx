import type { ReactNode } from 'react'
import type { TableProps } from 'antd'
import { MetaData } from '../../types/room.types'
import TableWithPagination from '../../shared/components/table-pagination'

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
  return <span className={`status-pill status-pill--${value.toLowerCase()}`}>{value}</span>
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
          <nav className="breadcrumb">{breadcrumb}</nav>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </header>

      {actions ? <section className="data-actions data-actions__row">{actions}</section> : null}

      {isError ? (
        <section className="room-error">
          <strong>Khong the tai du lieu</strong>
          <p>Vui long kiem tra dang nhap, quyen truy cap hoac API.</p>
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
            locale={{ emptyText: 'Khong co ban ghi phu hop voi bo loc hien tai.' }}
          />
        </section>
      ) : null}
    </main>
  )
}
