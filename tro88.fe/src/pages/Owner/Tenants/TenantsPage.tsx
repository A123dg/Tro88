import { Input } from 'antd'
import { useEffect, useState } from 'react'
import { DataPage, formatDate, formatCurrency } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useContracts } from '../../../hooks/useManagement'
import { ContractDto, ListFilters } from '../../../types/management.types'
import  useDebounce  from '../../../shared/hooks/useDebounce'

export function TenantsPage() {
  // We filter by status = Active to get currently staying tenants
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10, status: 'Active' })
  const query = useContracts(filters)

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

  const columns = [
    { key: 'roomNumber', title: 'Phòng', render: (item: ContractDto) => <strong>Phòng {item.roomNumber}</strong> },
    { key: 'tenantName', title: 'Họ tên', render: (item: ContractDto) => item.tenantName },
    { key: 'tenantPhone', title: 'Số điện thoại', render: (item: ContractDto) => item.tenantPhone || 'Chưa có' },
    { key: 'tenantEmail', title: 'Email', render: (item: ContractDto) => item.tenantEmail || 'Chưa có' },
    { key: 'startDate', title: 'Ngày vào', render: (item: ContractDto) => formatDate(item.startDate) },
    { key: 'endDate', title: 'Ngày hết hạn', render: (item: ContractDto) => formatDate(item.endDate) },
    { key: 'monthlyRent', title: 'Giá thuê', render: (item: ContractDto) => formatCurrency(item.monthlyRent) },
    { key: 'depositAmount', title: 'Tiền cọc', render: (item: ContractDto) => formatCurrency(item.depositAmount) },
  ]

  return (
    <DataPage<ContractDto>
      title="Danh sách người ở"
      subtitle="Theo dõi thông tin người thuê đang sinh sống tại các phòng trọ."
      breadcrumb="Tro88 / Người ở"
      items={query.data?.items ?? []}
      meta={query.data?.meta}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
      actions={
        <Input.Search
          placeholder="Nhập tên, số phòng hoặc sđt..."
          value={localKeyword}
          onChange={(event) => handleKeywordChange(event.target.value)}
          enterButton
          style={{ width: 240 }}
        />
      }
      columns={columns}
    />
  )
}
