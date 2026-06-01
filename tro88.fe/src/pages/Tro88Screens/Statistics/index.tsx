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

export function StatisticsPage() {
  return (
    <main className="page">
      <PageHeader title="Thống kê & Báo cáo" subtitle="Lọc theo khoảng thời gian và nhà trọ." />
      <div className="filter-bar"><input type="month" defaultValue="2026-05" /><Select defaultValue="Tất cả nhà" options={[{ value: 'Tất cả nhà', label: 'Tất cả nhà' }]} /></div>
      <div className="stat-grid"><Card><span>Tổng doanh thu tháng này</span><strong>{formatVND(128500000)}</strong><small>↑ 12%</small></Card><Card><span>HĐ active</span><strong>24</strong></Card><Card><span>Tỷ lệ lấp đầy</span><strong>82%</strong></Card><Card><span>Công nợ</span><strong>{formatVND(18600000)}</strong></Card></div>
      <Card><h2>Revenue Chart</h2><AreaChartLite /></Card>
      <div className="split"><Card><h2>Phân bổ thu nhập</h2><div className="pie-lite" /></Card><Card><h2>Top phòng doanh thu cao</h2>{rooms.map((room) => <div className="mini-bar" key={room.id}><span>Phòng {room.roomNumber}</span><div><i style={{ width: `${room.monthlyRent / 50000}%` }} /></div><strong>{formatVND(room.monthlyRent)}</strong></div>)}</Card></div>
      <Card><h2>Unpaid analysis</h2><DataTable headers={['Phòng', 'Tenant', 'Số tiền', 'Quá hạn']} rows={invoices.filter((item) => item.status !== 'Paid').map((item) => [item.room, item.tenant, formatVND(total(item)), item.status === 'Overdue' ? '25 ngày' : '0 ngày'])} /></Card>
    </main>
  )
}


