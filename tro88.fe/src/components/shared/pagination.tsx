import { ReactNode } from 'react'
import { MetaData } from '../../types/room.types'

export interface PaginationBarProps {
  page: number
  pageSize: number
  total: number
  totalPage: number
  disabled?: boolean
  pageSizeOptions?: number[]
  onChange: (page: number, pageSize: number) => void
}

function getPageItems(page: number, totalPage: number) {
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1)
    .filter((item) => item === 1 || item === totalPage || Math.abs(item - page) <= 1)

  return pages.reduce<Array<number | 'ellipsis'>>((items, item, index) => {
    if (index > 0 && item - pages[index - 1] > 1) {
      items.push('ellipsis')
    }
    items.push(item)
    return items
  }, [])
}

export function PaginationBar({
  page,
  pageSize,
  total,
  totalPage,
  disabled = false,
  pageSizeOptions = [10, 20, 50],
  onChange,
}: PaginationBarProps) {
  const safePage = Math.max(page, 1)
  const safeTotalPage = Math.max(totalPage, 1)
  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = total === 0 ? 0 : Math.min(safePage * pageSize, total)
  const pageItems = getPageItems(safePage, safeTotalPage)

  return (
    <nav className="pagination-bar" aria-label="Phân trang">
      <span className="pagination-bar__range">
        {start}-{end} trong số {total}
      </span>

      <div className="pagination-bar__pages">
        <button
          type="button"
          className="pagination-bar__arrow"
          disabled={disabled || safePage <= 1}
          onClick={() => onChange(safePage - 1, pageSize)}
          aria-label="Trang trước"
        >
          ‹
        </button>

        {pageItems.map((item, index) => item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="pagination-bar__ellipsis">...</span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === safePage ? 'is-active' : ''}
            disabled={disabled}
            onClick={() => onChange(item, pageSize)}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          className="pagination-bar__arrow"
          disabled={disabled || safePage >= safeTotalPage}
          onClick={() => onChange(safePage + 1, pageSize)}
          aria-label="Trang sau"
        >
          ›
        </button>
      </div>

      <select
        className="pagination-bar__size"
        value={pageSize}
        disabled={disabled}
        onChange={(event) => onChange(1, Number(event.target.value))}
        aria-label="Số dòng mỗi trang"
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>{size} / trang</option>
        ))}
      </select>
    </nav>
  )
}

export interface PaginatedTableColumn<T> {
  key: string
  title: ReactNode
  render: (item: T, index: number) => ReactNode
  className?: string
}

interface PaginatedTableProps<T> {
  columns: Array<PaginatedTableColumn<T>>
  items: T[]
  meta: MetaData
  rowKey: (item: T) => string
  emptyText?: ReactNode
  disabled?: boolean
  onPageChange: (page: number, pageSize: number) => void
  className?: string
}

export function PaginatedTable<T>({
  columns,
  items,
  meta,
  rowKey,
  emptyText = 'Chưa có dữ liệu.',
  disabled,
  onPageChange,
  className = '',
}: PaginatedTableProps<T>) {
  return (
    <div className={`paginated-list ${className}`}>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className}>{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{emptyText}</td>
              </tr>
            ) : items.map((item, index) => (
              <tr key={rowKey(item)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>{column.render(item, index)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationBar
        page={meta.page}
        pageSize={meta.pageSize}
        total={meta.total}
        totalPage={meta.totalPage}
        disabled={disabled}
        onChange={onPageChange}
      />
    </div>
  )
}

interface PaginatedCardListProps<T> {
  items: T[]
  meta: MetaData
  renderItem: (item: T, index: number) => ReactNode
  rowKey: (item: T) => string
  empty?: ReactNode
  disabled?: boolean
  onPageChange: (page: number, pageSize: number) => void
  className?: string
}

export function PaginatedCardList<T>({
  items,
  meta,
  renderItem,
  rowKey,
  empty,
  disabled,
  onPageChange,
  className = '',
}: PaginatedCardListProps<T>) {
  return (
    <div className={`paginated-list ${className}`}>
      {items.length === 0 ? empty ?? null : (
        <div className="grid-3">
          {items.map((item, index) => (
            <div key={rowKey(item)}>{renderItem(item, index)}</div>
          ))}
        </div>
      )}

      <PaginationBar
        page={meta.page}
        pageSize={meta.pageSize}
        total={meta.total}
        totalPage={meta.totalPage}
        disabled={disabled}
        onChange={onPageChange}
      />
    </div>
  )
}
