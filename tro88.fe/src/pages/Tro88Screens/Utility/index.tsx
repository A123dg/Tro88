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

export function UtilityReadingsPage() {
  return (
    <main className="page">
      <PageHeader title="Ghi chỉ số T05/2026" subtitle="8/12 phòng đã nhập. Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ." />
      <Card><div className="progress"><span style={{ width: '66%' }} /></div><UtilityTable /><div className="footer-actions"><Button variant="outline">Lưu tất cả</Button><Button>Tạo hóa đơn ngay</Button></div></Card>
    </main>
  )
}

export function UtilityHistoryPage() {
  return <SimplePage title="Lịch sử điện nước" subtitle="Biểu đồ và bảng lịch sử điện nước theo phòng." chart />
}


