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
  MaintenanceCard, MiniBarChart, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'

export function NotificationsPage() {
  useQuery(QK.notifications, () => read('/Notifications', []), { refetchInterval: 30000 })
  return (
    <main className="page">
      <PageHeader title="Thông báo" action={<Button variant="outline">Đánh dấu tất cả đã đọc</Button>} />
      <div className="tabs"><button>Tất cả</button><button>Chưa đọc</button><button>HĐ</button><button>Bảo trì</button><button>Hóa đơn</button></div>
      <Card><h2>Hôm nay</h2><NotificationList limit={5} /><h2>Hôm qua</h2><NotificationList limit={2} muted /></Card>
    </main>
  )
}

function NotificationList({ limit, muted = false }: { limit: number; muted?: boolean }) {
  return <div className={`list ${muted ? 'muted' : ''}`}>{['Hóa đơn tháng này đã được tạo', 'Yêu cầu bảo trì đã chuyển sang đang xử lý', 'Hợp đồng phòng 102 chờ ký'].slice(0, limit).map((text) => <Link className="notification-item" to="/notifications" key={text}><span className="unread-dot" /> <strong>{text}</strong><small>2 giờ trước</small></Link>)}</div>
}



