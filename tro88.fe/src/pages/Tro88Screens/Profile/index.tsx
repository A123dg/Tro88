import { useRouterState } from '@tanstack/react-router'
import { UploadOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select, Button as AntdButton, Typography } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse } from '../../../services/houseService'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import { CustomDatePicker } from '../../../shared/components/custom-datepicker'
import {
  AreaChartLite, Badge, Button, Card, DataTable, EmptyState, FormShell, Illustration, Link, navigateTo,
  MaintenanceCard, MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'

const { Title, Paragraph, Text } = Typography

export function ProfilePage() {
  const [tab, setTab] = useState('info')
  return (
    <main className="page">
      <PageHeader title="Hồ sơ cá nhân" />
      <div className="split">
        <Card className="profile-card">
          <span className="avatar large">AT</span>
          <AntdButton style={{ marginTop: 8 }} onClick={() => {}}>Đổi ảnh</AntdButton>
          <Title level={3} style={{ margin: '12px 0 4px 0' }}>An Tro88</Title>
          <Paragraph type="secondary">an@tro88.local</Paragraph>
          <Badge variant="info">Owner</Badge>
          <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: '12px' }}>
            Ngày tham gia 01/01/2026
          </Text>
        </Card>
        <Card>
          <div className="tabs">
            <AntdButton type={tab === 'info' ? 'primary' : 'default'} onClick={() => setTab('info')}>
              Thông tin
            </AntdButton>
            <AntdButton type={tab === 'security' ? 'primary' : 'default'} onClick={() => setTab('security')}>
              Bảo mật
            </AntdButton>
          </div>
          {tab === 'info' ? (
            <FormShell>
              <Input defaultValue="An Tro88" placeholder="Họ tên" />
              <Input defaultValue="an@tro88.local" readOnly placeholder="Email" />
              <Input placeholder="Số điện thoại" />
              <Input placeholder="CCCD/CMND" />
              <CustomDatePicker placeholder="Ngày sinh" style={{ width: '100%' }} />
            </FormShell>
          ) : (
            <FormShell>
              <Input.Password placeholder="Mật khẩu hiện tại" />
              <Input.Password placeholder="Mật khẩu mới" />
              <Input.Password placeholder="Xác nhận mật khẩu" />
            </FormShell>
          )}
        </Card>
      </div>
    </main>
  )
}


