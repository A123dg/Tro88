import { Select } from 'antd'
import { DataPage } from '../../../shared/components/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useContractActions, useContracts } from './hooks'
import { useColumn } from './hooks/useColumn'
import { ContractDto, ListFilters } from './service/types'
import { Link } from '../../Tro88Screens/shared'

export function ContractsPage() {
  const role = localStorage.getItem('authRole')
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
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', gap: '12px' }}>
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
            style={{ width: 180 }}
          />
          {role === 'Owner' && (
            <a className="button button--primary" href="/contracts/create" style={{ display: 'inline-flex', alignItems: 'center', height: '32px' }}>
              Tạo hợp đồng
            </a>
          )}
        </div>
      }
      columns={columns}
    />
  )
}
