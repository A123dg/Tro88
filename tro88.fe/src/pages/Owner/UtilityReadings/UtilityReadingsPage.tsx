import { useState } from 'react'
import { DataPage, formatDate } from '../../../components/shared/DataPage'
import { useUtilityReadings } from './hooks'
import { ListFilters, UtilityReadingDto } from './service/types'

export function UtilityReadingsPage() {
  const currentYear = new Date().getFullYear()
  const [filters, setFilters] = useState<ListFilters>({ page: 1, pageSize: 20, year: currentYear })
  const query = useUtilityReadings(filters)

  return (
    <DataPage<UtilityReadingDto>
      title="Chỉ số điện nước"
      subtitle="Theo dõi chỉ số cũ, chỉ số mới và mức sử dụng theo tháng."
      breadcrumb="Tro88 / Điện nước"
      items={query.data?.items ?? []}
      meta={query.data?.meta}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
      actions={
        <>
          <input type="number" min="1" max="12" value={filters.month ?? ''} onChange={(event) => setFilters({ ...filters, month: event.target.value ? Number(event.target.value) : undefined, page: 1 })} placeholder="Tháng" />
          <input type="number" value={filters.year ?? ''} onChange={(event) => setFilters({ ...filters, year: event.target.value ? Number(event.target.value) : undefined, page: 1 })} placeholder="Năm" />
        </>
      }
      columns={[
        { key: 'room', title: 'Phòng', render: (item) => <strong>P.{item.roomNumber}</strong> },
        { key: 'period', title: 'Kỳ', render: (item) => `${item.month}/${item.year}` },
        { key: 'electricity', title: 'Điện', render: (item) => `${item.electricityOld} → ${item.electricityNew} (${item.electricityUsage})` },
        { key: 'water', title: 'Nước', render: (item) => `${item.waterOld} → ${item.waterNew} (${item.waterUsage})` },
        { key: 'notes', title: 'Ghi chú', render: (item) => item.notes ?? 'Không có' },
        { key: 'createdAt', title: 'Ngày ghi', render: (item) => formatDate(item.createdAt) },
      ]}
    />
  )
}
