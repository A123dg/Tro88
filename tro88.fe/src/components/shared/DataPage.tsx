import { ReactNode } from 'react'
import { MetaData } from '../../types/room.types'

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
  onPageChange: (page: number) => void
}

export function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'Chưa có'
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
  const totalPage = Math.max(meta?.totalPage ?? 1, 1)

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
          <nav className="breadcrumb">{breadcrumb}</nav>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </header>

      {actions ? <section className="data-actions">{actions}</section> : null}

      {isLoading ? <section className="panel-state">Đang tải dữ liệu...</section> : null}

      {isError ? (
        <section className="room-error">
          <strong>Không thể tải dữ liệu</strong>
          <p>Vui lòng kiểm tra đăng nhập, quyền truy cập hoặc API.</p>
          <button type="button" className="button button--primary" onClick={onRetry}>Thử lại</button>
        </section>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <section className="empty-state">
          <h2>Chưa có dữ liệu</h2>
          <p>Không có bản ghi phù hợp với bộ lọc hiện tại.</p>
        </section>
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <>
          <section className="data-table">
            <div className="data-table__head" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(140px, 1fr))` }}>
              {columns.map((column) => <span key={column.key}>{column.title}</span>)}
            </div>
            {items.map((item) => (
              <div className="data-table__row" key={item.id} style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(140px, 1fr))` }}>
                {columns.map((column) => <span key={column.key}>{column.render(item)}</span>)}
              </div>
            ))}
          </section>

          <nav className="pagination" aria-label="Phân trang">
            <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>← Trước</button>
            <button type="button" className="is-active">{page}</button>
            <span className="pagination__ellipsis">/ {totalPage}</span>
            <button type="button" disabled={page >= totalPage} onClick={() => onPageChange(page + 1)}>Sau →</button>
          </nav>
        </>
      ) : null}
    </main>
  )
}
