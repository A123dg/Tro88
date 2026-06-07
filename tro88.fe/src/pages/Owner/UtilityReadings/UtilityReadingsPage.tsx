import { Input, InputNumber } from 'antd'
import { useState, useEffect } from 'react'
import { DataPage } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useUtilityReadings } from './hooks'
import { useColumn } from './hooks/useColumn'
import { ListFilters, UtilityReadingDto } from './service/types'
import useDebounce  from '../../../shared/hooks/useDebounce'

export function UtilityReadingsPage() {
  const currentYear = new Date().getFullYear()
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10, year: currentYear })
  const query = useUtilityReadings(filters)
  const { columns } = useColumn()

  const [localKeyword, setLocalKeyword] = useState(filters.keyword ?? '')
  const debounce = useDebounce(500)

  useEffect(() => {
    setLocalKeyword(filters.keyword ?? '')
  }, [filters.keyword])

  const handleKeywordChange = (val: string) => {
    setLocalKeyword(val)
    debounce(() => {
      setFilters((current) => ({ ...current, keyword: val || undefined, page: 1 }))
    })
  }

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
          <Input.Search placeholder="Nhập tên phòng" value={localKeyword} onChange={(event) => handleKeywordChange(event.target.value)} enterButton style={{ width: 160 }} />
          <InputNumber min={1} max={12} value={filters.month} onChange={(value: number | null) => setFilters({ ...filters, month: value ?? undefined, page: 1 })} placeholder="Tháng" />
          <InputNumber min={2000} max={9999} value={filters.year} onChange={(value: number | null) => setFilters({ ...filters, year: value ?? undefined, page: 1 })} placeholder="Năm" />
        </>
      }
      columns={columns}
    />
  )
}
