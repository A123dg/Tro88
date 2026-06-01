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

export function OwnerDashboardPage() {
  const dashboard = useQuery(QK.ownerDashboard, () => read('/Dashboard/owner', { revenue: 128500000, occupancy: 82, contracts: 24, unpaid: 8 }))
  const remind = useMutation((id: string) => ok(id))

  if (dashboard.isLoading) return <main className="page"><SkeletonGrid /></main>
  if (dashboard.isError) return <main className="page"><EmptyState title="Không tải được tổng quan" description="Bấm thử lại để tải lại dữ liệu dashboard." /></main>
  const data = dashboard.data ?? { revenue: 0, occupancy: 0, contracts: 0, unpaid: 0 }

  return (
    <main className="page">
      <PageHeader title="Tổng quan" subtitle="Theo dõi doanh thu, công nợ và việc cần xử lý." />
      <div className="stat-grid">
        <Card><span>Doanh thu tháng</span><strong>{formatVND(data.revenue)}</strong><small>+12% so với tháng trước</small></Card>
        <Card><span>Tỷ lệ lấp đầy</span><strong>{data.occupancy}%</strong><small>24 phòng đang thuê</small></Card>
        <Card><span>Hợp đồng active</span><strong>{data.contracts}</strong><small>3 hợp đồng sắp hết hạn</small></Card>
        <Card><span>Hóa đơn chưa thu</span><strong>{data.unpaid}</strong><small>{formatVND(18600000)}</small></Card>
      </div>
      <div className="split-60">
        <Card>
          <h2>Doanh thu 6 tháng gần nhất</h2>
          <MiniBarChart values={[42, 56, 48, 71, 64, 83]} />
        </Card>
        <Card>
          <div className="card-heading"><h2>Hóa đơn chưa thanh toán</h2><Badge variant="warning">5</Badge></div>
          <div className="list">
            {invoices.filter((item) => item.status !== 'Paid').map((item) => (
              <div className="list-row" key={item.id}>
                <span className="avatar">{item.tenant.slice(0, 1)}</span>
                <div><strong>{item.tenant}</strong><small>Phòng {item.room}</small></div>
                <strong>{formatVND(total(item))}</strong>
                <Button variant="outline" loading={remind.isLoading} onClick={() => remind.mutate(item.id)}>Nhắc</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <h2>Bảo trì cần xử lý</h2>
        <div className="grid-3">
          {maintenance.map((item) => <MaintenanceCard key={item.id} item={item} />)}
        </div>
      </Card>
    </main>
  )
}

export function TenantDashboardPage() {
  const dashboard = useQuery(QK.tenantDashboard, () => read('/Dashboard/tenant', {
    currentRoomId: 'r101',
    currentRoomNumber: '101',
    currentHouseName: 'Tro88 An Phú',
    monthlyRent: 3500000,
    unpaidInvoices: 1,
    totalDue: total(invoices[0]),
    nextPaymentDue: invoices[0].dueDate,
    activeMaintenanceRequests: 1,
  }))
  const data = dashboard.data

  return (
    <section className="tenant-page">
      <h1>Nhà trọ của tôi</h1>
      <Card className="tenant-house-card">
        <Illustration kind="room" />
        <div>
          <Badge variant="success">Đang thuê</Badge>
          <h2>{data?.currentHouseName ?? 'Chưa có nhà trọ đang thuê'}</h2>
          <p>{data?.currentRoomNumber ? `Phòng ${data.currentRoomNumber}` : 'Chưa có phòng đang thuê'}</p>
        </div>
        <strong>{formatVND(data?.monthlyRent ?? 0)}/tháng</strong>
      </Card>

      <div className="tenant-card-grid">
        <Card>
          <span>Hóa đơn chưa thanh toán</span>
          <strong className="money danger">{formatVND(data?.totalDue ?? 0)}</strong>
          <p>{data?.unpaidInvoices ?? 0} hóa đơn đang chờ</p>
        </Card>
        <Card>
          <span>Ngày thanh toán tới</span>
          <strong>{data?.nextPaymentDue ? formatDate(data.nextPaymentDue) : 'Chưa có lịch'}</strong>
          <p>Nhắc thanh toán theo hợp đồng hiện tại</p>
        </Card>
        <Card>
          <span>Bảo trì đang xử lý</span>
          <strong>{data?.activeMaintenanceRequests ?? 0}</strong>
          <p>Theo dõi yêu cầu đã gửi</p>
        </Card>
      </div>

      <Card>
        <div className="card-heading"><h2>Hóa đơn tháng này</h2><Badge variant="warning">Chưa TT</Badge></div>
        <strong className="money danger">{formatVND(total(invoices[0]))}</strong>
        <p>Hạn thanh toán: {formatDate(invoices[0].dueDate)}</p>
        <div className="progress"><span style={{ width: '35%' }} /></div>
        <div className="actions"><Link className="app-button app-button--outline" to="/my/invoices">Xem chi tiết</Link><Button>Thanh toán</Button></div>
      </Card>
      <div className="quick-grid">
        <Link to="/contracts/c1">Hợp đồng</Link><Link to="/my/invoices">Hóa đơn</Link><Link to="/my/maintenance/create">Báo hỏng</Link><Link to="/ai-agent">Chat AI</Link>
      </div>
      <Card><h2>Thông báo gần đây</h2><NotificationList limit={3} /></Card>
    </section>
  )
}


