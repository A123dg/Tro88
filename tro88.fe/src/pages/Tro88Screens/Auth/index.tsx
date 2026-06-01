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

function AuthCard({ mode }: { mode: 'login' | 'register' | 'forgot' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const login = useMutation(async () => {
    if (!email.includes('@')) throw new Error('Email không hợp lệ')
    if (mode !== 'forgot' && password.length < 6) throw new Error('Tối thiểu 6 ký tự')
    localStorage.setItem('accessToken', 'demo-token')
    localStorage.setItem('authRole', mode === 'register' ? 'Owner' : 'Owner')
  }, {
    onSuccess: () => navigateTo('/dashboard'),
    onError: (error: Error) => setMessage(error.message === 'INVALID_CREDENTIALS' ? 'Email hoặc mật khẩu không đúng' : error.message),
  })

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    login.mutate()
  }

  return (
    <div className="auth-grid">
      <aside className="auth-hero">
        <div className="brand big"><span>88</span><strong>Tro88</strong></div>
        <h1>Quản lý nhà trọ gọn gàng, rõ tiền, rõ việc</h1>
        <Illustration kind="tenant" />
        <ul>
          <li>Quản lý phòng, hợp đồng và hóa đơn theo tháng</li>
          <li>Nhắc thanh toán và ghi điện nước nhanh</li>
          <li>Tenant portal mobile-first cho người thuê</li>
        </ul>
      </aside>
      <Card className="auth-card">
        <div className="brand mobile-only"><span>88</span><strong>Tro88</strong></div>
        <h2>{mode === 'login' ? 'Chào mừng trở lại' : mode === 'register' ? 'Tạo tài khoản Tro88' : 'Khôi phục mật khẩu'}</h2>
        <p>{mode === 'login' ? 'Đăng nhập vào Tro88' : mode === 'register' ? 'Điền thông tin để bắt đầu quản lý' : 'Nhập email để nhận hướng dẫn đặt lại mật khẩu'}</p>
        <form className="form-stack" onSubmit={submit}>
          {mode === 'register' ? <><input placeholder="Họ và tên" required /><input placeholder="Số điện thoại" required /></> : null}
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" required />
          {mode !== 'forgot' ? <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu" type="password" required /> : null}
          {mode === 'register' ? <><input placeholder="Xác nhận mật khẩu" type="password" required /><div className="role-cards"><label><input name="role" type="radio" defaultChecked /> Chủ trọ</label><label><input name="role" type="radio" /> Người thuê</label></div><label className="check"><input type="checkbox" required /> Đồng ý điều khoản</label></> : null}
          {mode === 'login' ? <div className="form-row"><label className="check"><input type="checkbox" /> Ghi nhớ đăng nhập</label><Link to="/forgot-password">Quên mật khẩu?</Link></div> : null}
          {message ? <p className="form-error">{message}</p> : null}
          <Button type="submit" full loading={login.isLoading}>{mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : 'Gửi hướng dẫn'}</Button>
          {mode === 'login' ? <><div className="divider">hoặc</div><Button variant="outline" full>Tiếp tục với Google</Button></> : null}
        </form>
        <p className="switch-link">{mode === 'register' ? <Link to="/login">Đã có tài khoản? Đăng nhập</Link> : <Link to="/register">Chưa có tài khoản? Đăng ký</Link>}</p>
      </Card>
    </div>
  )
}

export function LoginPage() { return <AuthCard mode="login" /> }
export function RegisterPage() { return <AuthCard mode="register" /> }
export function ForgotPasswordPage() { return <AuthCard mode="forgot" /> }


