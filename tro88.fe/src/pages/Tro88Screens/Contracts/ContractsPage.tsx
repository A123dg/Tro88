import { useState } from 'react'
import { useMutation } from 'react-query'
import { queryClient } from '../../../queryClient'
import {
  Badge, Button, DataTable, Link, PageHeader, contracts, formatDate, formatVND, statusVariant, QK, ok
} from '../shared'

export function ContractsPage() {
  const [status, setStatus] = useState('all')
  const activate = useMutation((id: string) => ok(id), { onSuccess: () => queryClient.invalidateQueries(QK.contracts) })
  const rows = contracts.filter((item) => status === 'all' || item.status === status)
  return (
    <main className="page">
      <PageHeader title="Hợp đồng" subtitle="Theo dõi hợp đồng nháp, hiệu lực, sắp hết hạn và đã kết thúc." action={<Link className="app-button app-button--primary" to="/contracts/create">Tạo hợp đồng</Link>} />
      <div className="tabs">{['all', 'Draft', 'Active', 'Expired', 'Terminated'].map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item === 'all' ? 'Tất cả' : item}</button>)}</div>
      <DataTable headers={['Mã HĐ', 'Tenant', 'Phòng', 'Ngày BĐ', 'Ngày KT', 'Tiền thuê', 'Trạng thái', 'Hành động']} rows={rows.map((item) => [item.code, item.tenant, item.room, formatDate(item.startDate), formatDate(item.endDate), formatVND(item.rent), <Badge variant={statusVariant(item.status)}>{item.status}</Badge>, <div className="actions"><Link to={`/contracts/${item.id}`}>Xem</Link>{item.status === 'Draft' ? <Button variant="outline" loading={activate.isLoading} onClick={() => activate.mutate(item.id)}>Ký duyệt</Button> : null}<Button variant="ghost">Kết thúc</Button></div>])} />
    </main>
  )
}
