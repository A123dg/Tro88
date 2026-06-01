import { DataPage } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useUtilityReadings } from './hooks'
import { useColumn } from './hooks/useColumn'
import { ListFilters, UtilityReadingDto } from './service/types'

export function UtilityReadingsPage() {
  const currentYear = new Date().getFullYear()
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10, year: currentYear })
  const query = useUtilityReadings(filters)
  const { columns } = useColumn()

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
      onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
      actions={
        <>
          <input type="number" min="1" max="12" value={filters.month ?? ''} onChange={(event) => setFilters({ ...filters, month: event.target.value ? Number(event.target.value) : undefined, page: 1 })} placeholder="Tháng" />
          <input type="number" value={filters.year ?? ''} onChange={(event) => setFilters({ ...filters, year: event.target.value ? Number(event.target.value) : undefined, page: 1 })} placeholder="Năm" />
        </>
      }
      columns={columns}
    />
  )
}
