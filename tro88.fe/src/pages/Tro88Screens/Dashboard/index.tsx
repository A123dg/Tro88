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
import { fetchInvoices, fetchMaintenanceRequests } from '../../../services/managementService'
import {
  AreaChartLite, Badge, Button, Card, DataTable, EmptyState, FormShell, Illustration, Link, navigateTo,
  MaintenanceCard, MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'

import dayjs from 'dayjs'

export const OwnerDashboardPage = () => {
  const dashboard = useQuery(QK.ownerDashboard, () => read('/Dashboard/owner', { 
    totalHouses: 0, 
    totalRooms: 0, 
    occupiedRooms: 0, 
    availableRooms: 0, 
    totalRevenue: 0, 
    pendingInvoices: 0, 
    pendingMaintenanceRequests: 0 
  }))
  const remind = useMutation((id: string) => ok(id))

  // Fetch live unpaid invoices for the owner
  const invoicesQuery = useQuery(['owner-invoices-dashboard'], () => fetchInvoices({ page: 1, pageSize: 5, status: 'Unpaid' }), {
    keepPreviousData: true,
  })
  const unpaidInvoices = invoicesQuery.data?.items ?? []

  // Fetch live maintenance requests
  const maintenanceQuery = useQuery(['owner-maintenance-dashboard'], () => fetchMaintenanceRequests({ page: 1, pageSize: 6, status: 'New' }), {
    keepPreviousData: true,
  })
  const activeMaintenance = maintenanceQuery.data?.items ?? []

  if (dashboard.isLoading) return <main className="page"><SkeletonGrid /></main>
  if (dashboard.isError) return <main className="page"><EmptyState title="Không tải được tổng quan" description="Bấm thử lại để tải lại dữ liệu dashboard." /></main>
  const data = dashboard.data ?? { totalHouses: 0, totalRooms: 0, occupiedRooms: 0, availableRooms: 0, totalRevenue: 0, pendingInvoices: 0, pendingMaintenanceRequests: 0 }

  const occupancyRate = data.totalRooms > 0 ? Math.round((data.occupiedRooms / data.totalRooms) * 100) : 0

  return (
    <main className="page">
      <PageHeader title="Tổng quan" subtitle="Theo dõi doanh thu, công nợ và việc cần xử lý." />
      <div className="stat-grid">
        <Card><span>Doanh thu thực tế</span><strong>{formatVND(data.totalRevenue)}</strong><small>Từ hóa đơn đã thanh toán</small></Card>
        <Card><span>Tỷ lệ lấp đầy</span><strong>{occupancyRate}%</strong><small>{data.occupiedRooms}/{data.totalRooms} phòng đang thuê</small></Card>
        <Card><span>Công nợ (Chưa thu)</span><strong>{data.pendingInvoices}</strong><small>Hóa đơn chờ thanh toán</small></Card>
      </div>
      <div className="split-60">
        <Card>
          <h2>Doanh thu 6 tháng gần nhất</h2>
          <MiniBarChart values={[42, 56, 48, 71, 64, 83]} />
        </Card>
        <Card>
          <div className="card-heading"><h2>Hóa đơn chưa thanh toán</h2><Badge variant="warning">{unpaidInvoices.length}</Badge></div>
          <div className="list">
            {unpaidInvoices.map((item) => (
              <div className="list-row" key={item.id}>
                <span className="avatar">H</span>
                <div><strong>{item.invoiceCode}</strong><small>Kỳ: {item.billingMonth}/{item.billingYear}</small></div>
                <strong>{formatVND(item.totalAmount)}</strong>
                <Button variant="outline" loading={remind.isLoading} onClick={() => remind.mutate(item.id)}>Nhắc</Button>
              </div>
            ))}
            {unpaidInvoices.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>
                Không có hóa đơn chưa thanh toán
              </div>
            )}
          </div>
        </Card>
      </div>
      <Card>
        <h2>Bảo trì cần xử lý</h2>
        <div className="grid-3">
          {activeMaintenance.map((item) => {
            const mappedItem: Maintenance = {
              id: item.id,
              room: item.roomNumber,
              title: item.title,
              tenant: item.requestedByName,
              category: item.category,
              priority: item.priority as any,
              status: item.status as any,
              time: formatDate(item.createdAt)
            }
            return <MaintenanceCard key={item.id} item={mappedItem} />
          })}
          {activeMaintenance.length === 0 && (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px 0', color: '#888' }}>
              Không có yêu cầu bảo trì cần xử lý
            </div>
          )}
        </div>
      </Card>
    </main>
  )
}

export const TenantDashboardPage = () => {
  const dashboard = useQuery(QK.tenantDashboard, () => read('/Dashboard/tenant', {
    currentRoomId: null,
    currentRoomNumber: null,
    currentHouseName: null,
    monthlyRent: 0,
    unpaidInvoices: 0,
    totalDue: 0,
    nextPaymentDue: null,
    activeMaintenanceRequests: 0,
  }))
  const data = dashboard.data

  // Fetch live unpaid invoices for the tenant
  const invoicesQuery = useQuery(['tenant-invoices-dashboard'], () => fetchInvoices({ page: 1, pageSize: 5, status: 'Unpaid' }), {
    keepPreviousData: true,
  })
  const unpaidInvoices = invoicesQuery.data?.items ?? []
  const firstUnpaid = unpaidInvoices[0]

  return (
    <section className="tenant-page">
      <h1>Nhà trọ của tôi</h1>
      <Card className="tenant-house-card">
        <Illustration kind="room" />
        <div>
          <Badge variant={data?.currentRoomNumber ? "success" : "gray"}>
            {data?.currentRoomNumber ? "Đang thuê" : "Trống"}
          </Badge>
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
          <p>Nhắc thanh toán hóa đơn</p>
        </Card>
        <Card>
          <span>Bảo trì đang xử lý</span>
          <strong>{data?.activeMaintenanceRequests ?? 0}</strong>
          <p>Theo dõi yêu cầu đã gửi</p>
        </Card>
      </div>

      <Card>
        <div className="card-heading"><h2>Hóa đơn tháng này</h2><Badge variant={firstUnpaid ? "warning" : "success"}>{firstUnpaid ? "Chưa TT" : "Đã TT"}</Badge></div>
        <strong className="money danger">{firstUnpaid ? formatVND(firstUnpaid.totalAmount) : '0đ'}</strong>
        <p>Hạn thanh toán: {firstUnpaid ? formatDate(firstUnpaid.dueDate) : 'Không có'}</p>
        <div className="progress"><span style={{ width: firstUnpaid ? '35%' : '100%' }} /></div>
        <div className="actions"><Link className="app-button app-button--outline" to="/my/invoices">Xem chi tiết</Link><Button disabled={!firstUnpaid}>Thanh toán</Button></div>
      </Card>
      <div className="quick-grid">
        <Link to="/my/invoices">Hóa đơn</Link><Link to="/my/maintenance/create">Báo hỏng</Link><Link to="/ai-agent">Chat AI</Link>
      </div>
      <Card><h2>Thông báo gần đây</h2><NotificationList limit={3} /></Card>
    </section>
  )
}
