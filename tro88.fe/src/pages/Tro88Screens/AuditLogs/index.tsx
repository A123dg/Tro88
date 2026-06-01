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

export function AuditLogsPage() {
  return (
    <main className="page">
      <PageHeader title="Lịch sử hoạt động" subtitle="Admin only: lọc user, module, action và xem diff JSON." />
      <div className="filter-bar"><input placeholder="Search user/action" /><Select defaultValue="Module" options={[{ value: 'Module', label: 'Module' }]} /><Select defaultValue="CREATE" options={[{ value: 'CREATE', label: 'CREATE' }, { value: 'UPDATE', label: 'UPDATE' }, { value: 'DELETE', label: 'DELETE' }, { value: 'LOGIN', label: 'LOGIN' }]} /><input type="date" /></div>
      <DataTable dense headers={['Thời gian', 'User', 'Role', 'Action', 'Module', 'Mô tả', 'IP', 'Chi tiết']} rows={[['28/05/2026 15:20', 'admin', 'Admin', 'UPDATE', 'Invoice', 'Đánh dấu đã thanh toán', '127.0.0.1', <Button variant="outline">Chi tiết</Button>], ['28/05/2026 14:10', 'owner', 'Owner', 'CREATE', 'Room', 'Tạo phòng 102', '127.0.0.1', <Button variant="outline">Chi tiết</Button>]]} />
      <Card className="drawer"><h2>Diff JSON</h2><pre>{JSON.stringify({ old: { status: 'Unpaid' }, new: { status: 'Paid' } }, null, 2)}</pre></Card>
    </main>
  )
}


