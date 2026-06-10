import { Input, Tag } from 'antd'
import { useEffect, useState } from 'react'
import { DataPage, formatDate, formatCurrency } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useOwnerTenants } from '../../../hooks/useManagement'
import { OwnerTenantDto, ListFilters } from '../../../types/management.types'
import useDebounce from '../../../shared/hooks/useDebounce'

export function TenantsPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const query = useOwnerTenants(filters)

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
    {
      key: 'roomNumber',
      title: 'Phòng',
      render: (item: OwnerTenantDto) => (
        <div>
          <strong>Phòng {item.roomNumber}</strong>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{item.houseName}</div>
        </div>
      ),
    },
    { key: 'fullName', title: 'Họ tên', render: (item: OwnerTenantDto) => item.fullName },
    {
      key: 'relationType',
      title: 'Vai trò',
      render: (item: OwnerTenantDto) => (
        <Tag color={item.relationType === 'Chủ hợp đồng' ? 'orange' : 'blue'}>
          {item.relationType}
        </Tag>
      ),
    },
    { key: 'phoneNumber', title: 'Số điện thoại', render: (item: OwnerTenantDto) => item.phoneNumber || 'Chưa có' },
    { key: 'email', title: 'Email', render: (item: OwnerTenantDto) => item.email || 'Chưa có' },
    { key: 'startDate', title: 'Ngày vào', render: (item: OwnerTenantDto) => formatDate(item.startDate) },
    { key: 'endDate', title: 'Ngày hết hạn', render: (item: OwnerTenantDto) => item.endDate ? formatDate(item.endDate) : 'Chưa xác định' },
    { key: 'monthlyRent', title: 'Giá thuê', render: (item: OwnerTenantDto) => formatCurrency(item.monthlyRent) },
    { key: 'depositAmount', title: 'Tiền cọc', render: (item: OwnerTenantDto) => formatCurrency(item.depositAmount) },
  ]

  return (
    <DataPage<OwnerTenantDto>
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
