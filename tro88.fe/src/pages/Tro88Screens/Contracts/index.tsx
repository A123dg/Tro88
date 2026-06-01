import { useRouterState } from '@tanstack/react-router'
import { UploadOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse } from '../../../services/houseService'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import {
  AreaChartLite, Badge, Button, Card, DataTable, EmptyState, FormShell, Illustration, Link, navigateTo,
  MaintenanceCard, MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
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

export function ContractCreatePage() {
  const [step, setStep] = useState(1)
  const save = useMutation(() => ok({}))
  return (
    <main className="page">
      <PageHeader title="Tạo hợp đồng" subtitle="Wizard 3 bước: chọn phòng, nhập điều khoản và xác nhận." />
      <div className="wizard"><span style={{ width: `${step * 33.33}%` }} /></div>
      <Card>
        <h2>Bước {step}: {step === 1 ? 'Chọn phòng & Tenant' : step === 2 ? 'Điều khoản' : 'Xác nhận'}</h2>
        {step === 1 ? <div className="form-grid"><Select defaultValue="Tro88 An Phú" options={[{ value: 'Tro88 An Phú', label: 'Tro88 An Phú' }]} /><Select defaultValue="Phòng 102 - Available" options={[{ value: 'Phòng 102 - Available', label: 'Phòng 102 - Available' }]} /><input placeholder="Tìm tenant" /><label className="check"><input type="checkbox" /> Tạo tenant mới</label></div> : null}
        {step === 2 ? <div className="form-grid"><input type="date" defaultValue="2026-06-01" /><Select defaultValue="12 tháng" options={[{ value: '12 tháng', label: '12 tháng' }, { value: '6 tháng', label: '6 tháng' }, { value: '3 tháng', label: '3 tháng' }]} /><input defaultValue="31/05/2027" readOnly /><input type="number" defaultValue={3200000} /><input type="number" defaultValue={3200000} /><Select defaultValue="Ngày 5" options={[{ value: 'Ngày 5', label: 'Ngày 5' }, { value: 'Ngày 10', label: 'Ngày 10' }]} /><textarea placeholder="Điều khoản đặc biệt" /></div> : null}
        {step === 3 ? <div className="summary-card"><p>Phòng 102, Tenant Trần Hoàng Nam, thời hạn 12 tháng.</p><strong>{formatVND(3200000)}/tháng • Cọc {formatVND(3200000)}</strong><label className="check"><input type="checkbox" /> Xác nhận thông tin</label></div> : null}
        <div className="actions footer-actions"><Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))}>Back</Button>{step < 3 ? <Button onClick={() => setStep(step + 1)}>Next</Button> : <><Button variant="outline" loading={save.isLoading}>Lưu bản nháp</Button><Button loading={save.isLoading} onClick={() => save.mutate()}>Ký & Kích hoạt</Button></>}</div>
      </Card>
    </main>
  )
}

export function ContractDetailPage() {
  const contract = contracts.find((item) => item.id === pageId('c1')) ?? contracts[0]
  return (
    <main className="page">
      <PageHeader title={`Hợp đồng ${contract.code}`} />
      <div className="split">
        <Card className="document"><h2>HỢP ĐỒNG THUÊ PHÒNG</h2><p>Mã: #{contract.code}</p><h3>Thông tin hai bên</h3><p>Bên thuê: {contract.tenant}. Phòng: {contract.room}.</p><h3>Điều khoản</h3><p>Thời hạn {formatDate(contract.startDate)} - {formatDate(contract.endDate)}. Giá thuê {formatVND(contract.rent)}. Cọc {formatVND(contract.deposit)}. Thanh toán ngày {contract.paymentDay} hàng tháng.</p><div className="signatures"><span>Chủ trọ</span><span>Người thuê</span></div></Card>
        <Card><Badge variant={statusVariant(contract.status)}>{contract.status}</Badge><Timeline items={['Tạo', 'Ký', 'Kích hoạt', 'Hết hạn']} /><div className="actions vertical"><Button>Ký duyệt</Button><Button variant="outline">Tải PDF</Button><Link to={`/rooms/${rooms[0].id}`}>Xem phòng</Link><Link to="/invoices">Xem hóa đơn</Link></div></Card>
      </div>
      <div className="tabs"><button>Người trong phòng</button><button>Hóa đơn liên quan</button></div>
    </main>
  )
}

export function ContractTenantsPage() {
  return <SimplePage title="Người trong phòng" subtitle="Danh sách tenant, CCCD, số điện thoại và ngày vào phòng." />
}


