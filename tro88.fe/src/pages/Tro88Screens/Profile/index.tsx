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

export function ProfilePage() {
  const [tab, setTab] = useState('info')
  return (
    <main className="page">
      <PageHeader title="Hồ sơ cá nhân" />
      <div className="split"><Card className="profile-card"><span className="avatar large">AT</span><Button variant="outline">Đổi ảnh</Button><h2>An Tro88</h2><p>an@tro88.local</p><Badge variant="info">Owner</Badge><small>Ngày tham gia 01/01/2026</small></Card><Card><div className="tabs"><button className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>Thông tin</button><button className={tab === 'security' ? 'active' : ''} onClick={() => setTab('security')}>Bảo mật</button></div>{tab === 'info' ? <FormShell><input defaultValue="An Tro88" /><input defaultValue="an@tro88.local" readOnly /><input placeholder="Số điện thoại" /><input placeholder="CCCD/CMND" /><input type="date" /><Button>Lưu thay đổi</Button></FormShell> : <FormShell><input type="password" placeholder="Mật khẩu hiện tại" /><input type="password" placeholder="Mật khẩu mới" /><input type="password" placeholder="Xác nhận mật khẩu" /><Button>Đổi mật khẩu</Button></FormShell>}</Card></div>
    </main>
  )
}


