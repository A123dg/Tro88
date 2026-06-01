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
  MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'

export function MaintenancePage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isTenant = pathname.startsWith('/my')
  if (isTenant) {
    return (
      <section className="tenant-page">
        <h1>Bảo trì</h1>
        <Link className="app-button app-button--primary" to="/my/maintenance/create">Gửi yêu cầu</Link>
        <div className="list">{maintenance.map((item) => <MaintenanceCard key={item.id} item={item} />)}</div>
      </section>
    )
  }
  const columns: Array<{ status: Maintenance['status']; label: string }> = [{ status: 'New', label: 'Mới' }, { status: 'InProgress', label: 'Đang xử lý' }, { status: 'Done', label: 'Hoàn thành' }]
  return (
    <main className="page">
      <PageHeader title="Yêu cầu bảo trì" subtitle="Kanban xử lý bảo trì, phân công và theo dõi tiến độ." />
      <div className="kanban">{columns.map((column) => <Card key={column.status} className={`kanban-col ${column.status}`}><h2>{column.label} ({maintenance.filter((item) => item.status === column.status).length})</h2>{maintenance.filter((item) => item.status === column.status).map((item) => <MaintenanceCard key={item.id} item={item} />)}</Card>)}</div>
    </main>
  )
}

function MaintenanceCard({ item }: { item: Maintenance }) {
  return <Card className="maintenance-card"><div className="card-heading"><Badge variant="info">Phòng {item.room}</Badge><Badge variant={item.priority === 'Urgent' ? 'danger' : item.priority === 'Soon' ? 'warning' : 'success'}>{item.priority}</Badge></div><h3>{item.title}</h3><p>{item.tenant} • {item.time}</p><Select defaultValue="Kỹ thuật A" options={[{ value: 'Kỹ thuật A', label: 'Kỹ thuật A' }, { value: 'Kỹ thuật B', label: 'Kỹ thuật B' }]} /><Link to={`/maintenance/${item.id}`}>Xem chi tiết</Link></Card>
}

export function MaintenanceDetailPage() {
  const item = maintenance.find((m) => m.id === pageId('m1')) ?? maintenance[0]
  return (
    <main className="page">
      <PageHeader title={item.title} subtitle={`Phòng ${item.room} • ${item.category}`} />
      <div className="split"><Card><Badge variant={statusVariant(item.status)}>{item.status}</Badge><p>{item.tenant} gửi yêu cầu: {item.title}. Mô tả chi tiết vấn đề và ảnh đính kèm nằm trong khu vực này.</p><div className="gallery"><div /><div /><div /></div><Timeline items={['Gửi', 'Nhận', 'Xử lý', 'Hoàn thành']} /></Card><Card><Select defaultValue={item.status} options={[{ value: 'New', label: 'New' }, { value: 'InProgress', label: 'InProgress' }, { value: 'Done', label: 'Done' }]} /><Select defaultValue="Kỹ thuật A" options={[{ value: 'Kỹ thuật A', label: 'Kỹ thuật A' }]} /><textarea placeholder="Ghi chú xử lý" /><Button>Lưu trạng thái</Button><div className="upload-box">Upload thêm ảnh</div></Card></div>
    </main>
  )
}

export function MaintenanceCreatePage() {
  const save = useMutation(() => ok({}), { onSuccess: () => navigateTo('/my/maintenance') })
  return (
    <section className="tenant-page">
      <h1>Gửi yêu cầu bảo trì</h1>
      <FormShell onSubmit={() => save.mutate()} loading={save.isLoading}>
        <div className="category-grid">{['Điện', 'Nước', 'ĐH', 'Cửa', 'Wifi', 'Khác'].map((item) => <label key={item}><input name="cat" type="radio" /> {item}</label>)}</div>
        <input placeholder="Tiêu đề" required /><textarea placeholder="Mô tả" required /><div className="role-cards"><label><input name="priority" type="radio" defaultChecked /> Bình thường</label><label><input name="priority" type="radio" /> Cần sớm</label><label><input name="priority" type="radio" /> Khẩn cấp</label></div><div className="upload-box">Upload tối đa 3 ảnh</div>
      </FormShell>
    </section>
  )
}



