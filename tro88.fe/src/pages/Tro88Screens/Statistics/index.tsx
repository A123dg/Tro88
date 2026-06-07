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

import dayjs from 'dayjs'
import { CustomDatePicker } from '../../../shared/components/custom-datepicker'

export function StatisticsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Debt'>('All')

  const stats = useMemo(() => {
    let revenue = 0
    let debt = 0
    let paidCount = 0
    let debtCount = 0

    invoices.forEach((item) => {
      const amt = total(item)
      if (item.status === 'Paid') {
        revenue += amt
        paidCount++
      } else {
        debt += amt
        debtCount++
      }
    })

    return { revenue, debt, paidCount, debtCount }
  }, [])

  const filteredInvoices = useMemo(() => {
    return invoices.filter((item) => {
      const matchesSearch = 
        item.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())

      if (statusFilter === 'Paid') {
        return matchesSearch && item.status === 'Paid'
      }
      if (statusFilter === 'Debt') {
        return matchesSearch && item.status !== 'Paid'
      }
      return matchesSearch
    })
  }, [searchTerm, statusFilter])

  return (
    <main className="page">
      <PageHeader title="Thống kê & Doanh thu" subtitle="Quản lý chi tiết doanh thu, công nợ cửa hàng/nhà trọ." />
      
      {/* KPI Cards */}
      <div className="stat-grid">
        <Card>
          <span>Tổng doanh thu thực tế</span>
          <strong>{formatVND(stats.revenue)}</strong>
          <small>{stats.paidCount} hóa đơn đã hoàn thành</small>
        </Card>
        <Card>
          <span>Tổng công nợ chưa thu</span>
          <strong style={{ color: 'var(--primary)' }}>{formatVND(stats.debt)}</strong>
          <small>{stats.debtCount} hóa đơn chưa thanh toán</small>
        </Card>
        <Card>
          <span>Hóa đơn đã thu</span>
          <strong>{stats.paidCount}</strong>
          <small>Đã xác nhận</small>
        </Card>
        <Card>
          <span>Hóa đơn chưa thu</span>
          <strong>{stats.debtCount}</strong>
          <small>Đang nợ/chờ xác nhận</small>
        </Card>
      </div>

      {/* Filter and Search Section */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tìm kiếm hóa đơn</span>
            <Input 
              placeholder="Nhập tên người thuê, phòng, hoặc mã hóa đơn..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              allowClear 
            />
          </div>
          <div style={{ width: 200 }}>
            <span style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Trạng thái thanh toán</span>
            <Select 
              value={statusFilter} 
              onChange={(value) => setStatusFilter(value)} 
              style={{ width: '100%' }}
              options={[
                { value: 'All', label: 'Tất cả' },
                { value: 'Paid', label: 'Đã thanh toán' },
                { value: 'Debt', label: 'Còn nợ' }
              ]} 
            />
          </div>
        </div>
      </Card>

      {/* Invoice List Table */}
      <Card>
        <div className="card-heading" style={{ marginBottom: 16 }}>
          <h2>Danh sách hóa đơn lọc ({filteredInvoices.length})</h2>
        </div>
        <DataTable 
          headers={['Mã hóa đơn', 'Phòng', 'Người thuê', 'Tiền thuê phòng', 'Tổng hóa đơn', 'Hạn thanh toán', 'Trạng thái', 'Hành động']} 
          rows={filteredInvoices.map((item) => [
            item.code,
            `Phòng ${item.room}`,
            item.tenant,
            formatVND(item.rent),
            formatVND(total(item)),
            formatDate(item.dueDate),
            <Badge variant={statusVariant(item.status)}>
              {item.status === 'Paid' 
                ? 'Đã thanh toán' 
                : item.status === 'WaitingConfirm' 
                ? 'Chờ xác nhận' 
                : item.status === 'Overdue' 
                ? 'Quá hạn' 
                : 'Chưa thanh toán'}
            </Badge>,
            <Link to={`/invoices/${item.id}`}>Xem</Link>
          ])} 
        />
      </Card>
    </main>
  )
}


