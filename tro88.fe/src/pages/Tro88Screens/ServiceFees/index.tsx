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

export function ServiceFeesPage() {
  const [open, setOpen] = useState(false)
  const fees = [['Wifi', 'Cố định tháng', 100000, 'Tất cả nhà', true], ['Bãi xe', 'Cố định tháng', 150000, 'An Phú', true], ['Máy giặt', 'Theo đơn vị', 20000, 'Bình Thạnh', false]] as const
  return (
    <main className="page">
      <PageHeader title="Dịch vụ & Phí" action={<Button onClick={() => setOpen(true)}>Thêm dịch vụ</Button>} />
      <DataTable headers={['Tên', 'Loại', 'Đơn giá', 'Áp dụng', 'Trạng thái', 'Sửa/Xóa']} rows={fees.map((fee) => [fee[0], fee[1], formatVND(fee[2]), fee[3], <label className="switch"><input type="checkbox" defaultChecked={fee[4]} /><span /></label>, <div className="actions"><Button variant="ghost">Sửa</Button><Button variant="danger">Xóa</Button></div>])} />
      {open ? <div className="modal"><Card><h2>Thêm dịch vụ</h2><FormShell onSubmit={() => setOpen(false)}><input placeholder="Tên dịch vụ" /><Select defaultValue="Cố định tháng" options={[{ value: 'Cố định tháng', label: 'Cố định tháng' }, { value: 'Theo đơn vị', label: 'Theo đơn vị' }]} /><input placeholder="Đơn giá" /><Select mode="multiple" defaultValue={['Tro88 An Phú']} options={[{ value: 'Tro88 An Phú', label: 'Tro88 An Phú' }, { value: 'Tro88 Bình Thạnh', label: 'Tro88 Bình Thạnh' }]} /><label className="check"><input type="checkbox" defaultChecked /> Bật</label></FormShell></Card></div> : null}
    </main>
  )
}


