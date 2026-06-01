import { Select } from 'antd'
import { DataPage } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useContractActions, useContracts } from './hooks'
import { useColumn } from './hooks/useColumn'
import { ContractDto, ListFilters } from './service/types'

export function ContractsPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const query = useContracts(filters)
  const actions = useContractActions()
  const { columns } = useColumn({
    handleActivate: (id) => actions.activate.mutate(id),
    handleTerminate: (id) => actions.terminate.mutate({ id, reason: 'Chấm dứt từ giao diện quản lý' }),
  })

  return (
    <DataPage<ContractDto>
      title="Quản lý hợp đồng"
      subtitle="Theo dõi hợp đồng thuê phòng, người thuê, ngày hiệu lực và tiền cọc."
      breadcrumb="Tro88 / Hợp đồng"
      items={query.data?.items ?? []}
      meta={query.data?.meta}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
      onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
      actions={
        <Select
          value={filters.status ?? ''}
          onChange={(value) => setFilters({ ...filters, status: value || undefined, page: 1 })}
          options={[
            { value: '', label: 'Tất cả trạng thái' },
            { value: 'Draft', label: 'Nháp' },
            { value: 'Active', label: 'Hiệu lực' },
            { value: 'Terminated', label: 'Đã chấm dứt' },
            { value: 'Expired', label: 'Hết hạn' },
          ]}
        />
      }
      columns={columns}
    />
  )
}
