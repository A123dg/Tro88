import { useRouterState } from '@tanstack/react-router'
import { FormEvent, ReactNode, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { api } from './services/apiClient'
import { queryClient } from './queryClient'

function Link({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return <a href={to} className={className}>{children}</a>
}

function navigateTo(to: string) {
  window.location.href = to
}

type Status = 'Available' | 'Occupied' | 'Maintenance' | 'Draft' | 'Active' | 'Expired' | 'Terminated' | 'Unpaid' | 'Paid' | 'Overdue' | 'New' | 'InProgress' | 'Done' | 'Normal' | 'Soon' | 'Urgent'

interface ApiResponse<T> {
  code: number
  success: boolean
  message: string
  data: T
}

interface House {
  id: string
  name: string
  address: string
  active: boolean
  rooms: number
  occupied: number
}

interface Room {
  id: string
  houseId: string
  roomNumber: string
  floor: number
  area: number
  maxOccupants: number
  monthlyRent: number
  depositAmount: number
  status: 'Available' | 'Occupied' | 'Maintenance'
  electricityUnitPrice: number
  waterUnitPrice: number
  description: string
}

interface Contract {
  id: string
  code: string
  tenant: string
  room: string
  startDate: string
  endDate: string
  rent: number
  deposit: number
  paymentDay: number
  status: 'Draft' | 'Active' | 'Expired' | 'Terminated'
}

interface Invoice {
  id: string
  code: string
  room: string
  tenant: string
  month: number
  year: number
  rent: number
  electricity: number
  water: number
  service: number
  dueDate: string
  status: 'Unpaid' | 'Paid' | 'Overdue'
}

interface Maintenance {
  id: string
  room: string
  title: string
  tenant: string
  category: string
  priority: 'Normal' | 'Soon' | 'Urgent'
  status: 'New' | 'InProgress' | 'Done'
  time: string
}

const QK = {
  ownerDashboard: ['owner-dashboard'] as const,
  tenantDashboard: ['tenant-dashboard'] as const,
  houses: ['houses'] as const,
  rooms: ['rooms'] as const,
  contracts: ['contracts'] as const,
  invoices: ['invoices'] as const,
  utility: ['utility-readings'] as const,
  maintenance: ['maintenance'] as const,
  notifications: ['notifications'] as const,
  serviceFees: ['service-fees'] as const,
  statistics: ['statistics'] as const,
}

const houses: House[] = [
  { id: 'h1', name: 'Tro88 An Phú', address: '12 Nguyễn Văn Hưởng, TP Thủ Đức', active: true, rooms: 18, occupied: 15 },
  { id: 'h2', name: 'Tro88 Bình Thạnh', address: '88 Xô Viết Nghệ Tĩnh, Bình Thạnh', active: true, rooms: 12, occupied: 9 },
  { id: 'h3', name: 'Tro88 Tân Bình', address: '45 Cộng Hòa, Tân Bình', active: false, rooms: 10, occupied: 0 },
]

const rooms: Room[] = [
  { id: 'r101', houseId: 'h1', roomNumber: '101', floor: 1, area: 24, maxOccupants: 2, monthlyRent: 3500000, depositAmount: 3500000, status: 'Occupied', electricityUnitPrice: 3800, waterUnitPrice: 18000, description: 'Phòng sáng, có ban công và máy lạnh.' },
  { id: 'r102', houseId: 'h1', roomNumber: '102', floor: 1, area: 22, maxOccupants: 2, monthlyRent: 3200000, depositAmount: 3200000, status: 'Available', electricityUnitPrice: 3800, waterUnitPrice: 18000, description: 'Phòng mới sơn, gần khu giặt.' },
  { id: 'r203', houseId: 'h2', roomNumber: '203', floor: 2, area: 28, maxOccupants: 3, monthlyRent: 4200000, depositAmount: 4200000, status: 'Maintenance', electricityUnitPrice: 4000, waterUnitPrice: 20000, description: 'Đang sửa hệ thống nước.' },
]

const contracts: Contract[] = [
  { id: 'c1', code: 'CTR-2026-001', tenant: 'Nguyễn Minh Anh', room: '101', startDate: '2026-01-01', endDate: '2026-12-31', rent: 3500000, deposit: 3500000, paymentDay: 5, status: 'Active' },
  { id: 'c2', code: 'CTR-2026-002', tenant: 'Trần Hoàng Nam', room: '102', startDate: '2026-06-01', endDate: '2027-05-31', rent: 3200000, deposit: 3200000, paymentDay: 8, status: 'Draft' },
  { id: 'c3', code: 'CTR-2025-011', tenant: 'Lê Thu Hà', room: '203', startDate: '2025-05-01', endDate: '2026-05-31', rent: 4200000, deposit: 4200000, paymentDay: 3, status: 'Expired' },
]

const invoices: Invoice[] = [
  { id: 'i1', code: 'INV-05-001', room: '101', tenant: 'Nguyễn Minh Anh', month: 5, year: 2026, rent: 3500000, electricity: 456000, water: 126000, service: 150000, dueDate: '2026-06-05', status: 'Unpaid' },
  { id: 'i2', code: 'INV-05-002', room: '102', tenant: 'Trần Hoàng Nam', month: 5, year: 2026, rent: 3200000, electricity: 360000, water: 108000, service: 150000, dueDate: '2026-06-08', status: 'Paid' },
  { id: 'i3', code: 'INV-04-006', room: '203', tenant: 'Lê Thu Hà', month: 4, year: 2026, rent: 4200000, electricity: 500000, water: 160000, service: 180000, dueDate: '2026-05-03', status: 'Overdue' },
]

const maintenance: Maintenance[] = [
  { id: 'm1', room: '101', title: 'Máy lạnh không lạnh', tenant: 'Nguyễn Minh Anh', category: 'Điện lạnh', priority: 'Soon', status: 'New', time: '2 giờ trước' },
  { id: 'm2', room: '203', title: 'Rò nước lavabo', tenant: 'Lê Thu Hà', category: 'Nước', priority: 'Urgent', status: 'InProgress', time: 'Hôm qua' },
  { id: 'm3', room: '102', title: 'Thay ổ khóa cửa', tenant: 'Trần Hoàng Nam', category: 'Cửa', priority: 'Normal', status: 'Done', time: '3 ngày trước' },
]

function ok<T>(data: T): Promise<ApiResponse<T>> {
  return Promise.resolve({ code: 200, success: true, message: 'OK', data })
}

async function read<T>(endpoint: string, fallback: T): Promise<T> {
  try {
    const response = await api.get<unknown, ApiResponse<T>>(endpoint)
    if (!response.success) {
      throw new Error(response.message)
    }
    return response.data
  } catch {
    const response = await ok(fallback)
    if (!response.success) {
      throw new Error(response.message)
    }
    return response.data
  }
}

function formatVND(amount: number) {
  return `${amount.toLocaleString('vi-VN')}đ`
}

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

function pageId(fallback: string) {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  const previous = parts[parts.length - 2]
  return last === 'edit' ? previous ?? fallback : last ?? fallback
}

function total(invoice: Invoice) {
  return invoice.rent + invoice.electricity + invoice.water + invoice.service
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

function Button({ children, variant = 'primary', full = false, loading = false, onClick, type = 'button' }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; full?: boolean; loading?: boolean; onClick?: () => void; type?: 'button' | 'submit' }) {
  return <button type={type} className={`app-button app-button--${variant} ${full ? 'app-button--full' : ''}`} disabled={loading} onClick={onClick}>{loading ? 'Đang xử lý...' : children}</button>
}

function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray' }) {
  return <span className={`badge badge--${variant}`}><span />{children}</span>
}

function statusVariant(status: Status): 'success' | 'warning' | 'danger' | 'info' | 'gray' {
  if (status === 'Active' || status === 'Paid' || status === 'Available' || status === 'Done') return 'success'
  if (status === 'Unpaid' || status === 'Draft' || status === 'New') return 'warning'
  if (status === 'Overdue' || status === 'Expired' || status === 'Urgent') return 'danger'
  if (status === 'Maintenance' || status === 'InProgress') return 'info'
  return 'gray'
}

function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        <div className="breadcrumb">Tro88 / {title}</div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action}
    </header>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="empty">
      <Illustration kind="empty" />
      <h3>{title}</h3>
      <p>{description}</p>
    </Card>
  )
}

function SkeletonGrid() {
  return <div className="grid-3">{[1, 2, 3].map((item) => <div key={item} className="skeleton-card" />)}</div>
}

function Illustration({ kind }: { kind: 'tenant' | 'room' | 'maintenance' | 'invoice' | 'contract' | 'empty' }) {
  const color = kind === 'invoice' ? '#5B8DEF' : kind === 'maintenance' ? '#52C593' : '#F4845F'
  return (
    <svg className="illustration" viewBox="0 0 240 160" role="img" aria-label={`${kind} illustration`}>
      <rect x="18" y="34" width="168" height="100" rx="18" fill="#FEF0EB" />
      <circle cx="176" cy="52" r="28" fill="#E8F8F0" />
      <rect x="46" y="58" width="92" height="60" rx="12" fill="#fff" stroke="#F0EBE3" />
      <path d="M60 102h64M60 78h42M60 90h54" stroke={color} strokeWidth="8" strokeLinecap="round" />
      <circle cx="174" cy="102" r="22" fill={color} opacity=".85" />
    </svg>
  )
}

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values)
  return (
    <div className="bar-chart">
      {values.map((value, index) => (
        <span key={`${value}-${index}`} style={{ height: `${Math.max(18, (value / max) * 100)}%` }} className={value === max ? 'max' : ''}>
          <small>T{index + 1}</small>
        </span>
      ))}
    </div>
  )
}

function AreaChartLite() {
  return (
    <svg className="area-chart" viewBox="0 0 720 240">
      <defs>
        <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F4845F" stopOpacity=".35" />
          <stop offset="100%" stopColor="#F4845F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M20 200 C120 140 150 170 230 110 S370 80 450 120 S560 190 700 60 L700 220 L20 220Z" fill="url(#revenue-fill)" />
      <path d="M20 200 C120 140 150 170 230 110 S370 80 450 120 S560 190 700 60" fill="none" stroke="#F4845F" strokeWidth="4" />
    </svg>
  )
}

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
  const data = useQuery(QK.tenantDashboard, () => read('/Dashboard/tenant', { daysLeft: 24 }))
  return (
    <section className="tenant-page">
      <h1>Xin chào, Minh Anh</h1>
      <Card className="tenant-room-card">
        <Illustration kind="room" />
        <h2>Tro88 An Phú - Phòng 101</h2>
        <p>12 Nguyễn Văn Hưởng, TP Thủ Đức</p>
        <Badge variant="warning">Hợp đồng còn {data.data?.daysLeft ?? 24} ngày</Badge>
        <strong>{formatVND(3500000)}/tháng</strong>
      </Card>
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

export function HousesPage() {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState('all')
  const query = useQuery(QK.houses, () => read('/Houses', houses))
  const filtered = (query.data ?? []).filter((house) => house.name.toLowerCase().includes(search.toLowerCase()) && (active === 'all' || String(house.active) === active))

  return (
    <main className="page">
      <PageHeader title="Nhà trọ" subtitle="Quản lý danh sách nhà, tỷ lệ lấp đầy và trạng thái hoạt động." action={<Link className="app-button app-button--primary" to="/houses/create">+ Thêm nhà trọ</Link>} />
      <div className="filter-bar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nhà trọ" /><select value={active} onChange={(event) => setActive(event.target.value)}><option value="all">Tất cả</option><option value="true">Hoạt động</option><option value="false">Tạm đóng</option></select></div>
      {query.isLoading ? <SkeletonGrid /> : filtered.length === 0 ? <EmptyState title="Chưa có nhà trọ" description="Thêm nhà trọ đầu tiên để bắt đầu quản lý phòng." /> : (
        <div className="grid-3">
          {filtered.map((house) => {
            const percent = Math.round((house.occupied / house.rooms) * 100)
            return (
              <Card key={house.id} className="house-card">
                <div className="thumbnail" />
                <h2>{house.name}</h2><p>{house.address}</p>
                <Badge variant={house.active ? 'success' : 'gray'}>{house.active ? 'Hoạt động' : 'Tạm đóng'}</Badge>
                <p>{house.rooms} phòng • {house.occupied} đang thuê</p>
                <div className="progress"><span style={{ width: `${percent}%` }} /></div>
                <div className="actions"><Link className="app-button app-button--outline" to={`/houses/${house.id}/rooms`}>Xem phòng</Link><Link className="app-button app-button--ghost" to={`/houses/${house.id}/edit`}>Sửa</Link><Button variant="danger">Xóa</Button></div>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}

export function HouseFormPage() {
  const isEdit = window.location.pathname.endsWith('/edit')
  const save = useMutation(() => ok({}), { onSuccess: () => navigateTo('/houses') })
  return (
    <main className="page">
      <PageHeader title={isEdit ? 'Sửa nhà trọ' : 'Thêm nhà trọ'} subtitle="Thông tin cơ bản, trạng thái, ảnh đại diện và tiện ích." />
      <FormShell onSubmit={() => save.mutate()} loading={save.isLoading}>
        <input defaultValue={isEdit ? houses[0].name : ''} placeholder="Tên nhà trọ" required />
        <textarea defaultValue={isEdit ? houses[0].address : ''} placeholder="Địa chỉ" required />
        <select><option>TP. Hồ Chí Minh</option><option>Hà Nội</option><option>Đà Nẵng</option></select>
        <select><option>TP Thủ Đức</option><option>Bình Thạnh</option><option>Tân Bình</option></select>
        <textarea placeholder="Mô tả" />
        <div className="role-cards"><label><input name="house-status" type="radio" defaultChecked /> Hoạt động</label><label><input name="house-status" type="radio" /> Tạm đóng</label></div>
        <div className="upload-box">Kéo thả ảnh đại diện hoặc bấm để chọn</div>
        <div className="check-grid">{['Wifi', 'Bãi xe', 'Camera', 'Máy giặt', 'Thang máy'].map((item) => <label key={item}><input type="checkbox" /> {item}</label>)}</div>
      </FormShell>
    </main>
  )
}

export function HouseDetailPage() {
  const house = houses.find((item) => item.id === pageId('h1')) ?? houses[0]
  return (
    <main className="page">
      <PageHeader title={house.name} subtitle={house.address} action={<Link className="app-button app-button--primary" to={`/houses/${house.id}/edit`}>Sửa</Link>} />
      <div className="stat-grid"><Card><span>Tổng phòng</span><strong>{house.rooms}</strong></Card><Card><span>Đang thuê</span><strong>{house.occupied}</strong></Card><Card><span>Còn trống</span><strong>{house.rooms - house.occupied}</strong></Card><Card><span>Trạng thái</span><Badge variant={house.active ? 'success' : 'gray'}>{house.active ? 'Hoạt động' : 'Tạm đóng'}</Badge></Card></div>
      <RoomsPage />
    </main>
  )
}

export function RoomsPage() {
  const query = useQuery(QK.rooms, () => read('/Rooms', rooms))
  return (
    <section className="page compact">
      <PageHeader title="Phòng" subtitle="Danh sách phòng, giá thuê, trạng thái và thao tác nhanh." action={<Link className="app-button app-button--primary" to="/rooms/create">+ Thêm phòng</Link>} />
      {query.isLoading ? <SkeletonGrid /> : <div className="grid-3">{(query.data ?? rooms).map((room) => <RoomCard key={room.id} room={room} />)}</div>}
    </section>
  )
}

function RoomCard({ room }: { room: Room }) {
  return (
    <Card className="room-card">
      <Illustration kind="room" />
      <div className="card-heading"><h2>Phòng {room.roomNumber}</h2><Badge variant={statusVariant(room.status)}>{room.status}</Badge></div>
      <p>Tầng {room.floor} • {room.area}m² • tối đa {room.maxOccupants} người</p>
      <strong>{formatVND(room.monthlyRent)}/tháng</strong>
      <div className="actions"><Link className="app-button app-button--outline" to={`/rooms/${room.id}`}>Xem</Link><Link className="app-button app-button--ghost" to={`/rooms/${room.id}/edit`}>Sửa</Link></div>
    </Card>
  )
}

export function RoomDetailPage() {
  const room = rooms.find((item) => item.id === pageId('r101')) ?? rooms[0]
  return (
    <main className="page">
      <PageHeader title={`Phòng ${room.roomNumber}`} subtitle={room.description} action={<Link className="app-button app-button--primary" to={`/rooms/${room.id}/edit`}>Sửa phòng</Link>} />
      <div className="tabs"><button>Thông tin</button><button>Hợp đồng</button><button>Hóa đơn</button><button>Lịch sử điện nước</button></div>
      <div className="split">
        <Card><h2>Thông tin</h2><dl className="info-list"><dt>Tầng</dt><dd>{room.floor}</dd><dt>Diện tích</dt><dd>{room.area}m²</dd><dt>Giá thuê</dt><dd>{formatVND(room.monthlyRent)}</dd><dt>Tiền cọc</dt><dd>{formatVND(room.depositAmount)}</dd><dt>Giá điện/nước</dt><dd>{formatVND(room.electricityUnitPrice)} / {formatVND(room.waterUnitPrice)}</dd></dl></Card>
        <Card><h2>Ảnh phòng</h2><div className="gallery"><div /><div /><div /></div><div className="upload-box">Upload thêm ảnh</div></Card>
      </div>
      <Card><h2>Lịch sử điện nước</h2><AreaChartLite /></Card>
    </main>
  )
}

export function RoomFormPage() {
  const isEdit = window.location.pathname.endsWith('/edit')
  const save = useMutation(() => ok({}), { onSuccess: () => navigateTo('/houses/h1/rooms') })
  return (
    <main className="page">
      <PageHeader title={isEdit ? 'Sửa phòng' : 'Thêm phòng'} subtitle="Thông tin cơ bản, tiện nghi, đơn giá điện nước và ảnh." />
      <FormShell onSubmit={() => save.mutate()} loading={save.isLoading}>
        <input defaultValue={isEdit ? rooms[0].roomNumber : ''} placeholder="Số phòng" required />
        <input type="number" min="1" max="20" defaultValue={isEdit ? rooms[0].floor : 1} placeholder="Tầng" />
        <input type="number" defaultValue={isEdit ? rooms[0].area : 24} placeholder="Diện tích m²" />
        <input type="number" defaultValue={isEdit ? rooms[0].maxOccupants : 2} placeholder="Số người tối đa" />
        <input type="number" defaultValue={isEdit ? rooms[0].monthlyRent : 3500000} placeholder="Giá thuê/tháng" />
        <input type="number" defaultValue={isEdit ? rooms[0].depositAmount : 3500000} placeholder="Tiền cọc" />
        <textarea placeholder="Mô tả" />
        <div className="check-grid">{['Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Máy giặt riêng', 'Ban công', 'Gác lửng'].map((item) => <label key={item}><input type="checkbox" /> {item}</label>)}</div>
        <input type="number" defaultValue={3800} placeholder="Giá điện" />
        <input type="number" defaultValue={18000} placeholder="Giá nước" />
        <div className="upload-box">Upload ảnh, tối đa 5 ảnh</div>
      </FormShell>
    </main>
  )
}

export function ContractsPage() {
  const [status, setStatus] = useState('all')
  const activate = useMutation((id: string) => ok(id), { onSuccess: () => queryClient.invalidateQueries(QK.contracts) })
  const rows = contracts.filter((item) => status === 'all' || item.status === status)
  return (
    <main className="page">
      <PageHeader title="Hợp đồng" subtitle="Theo dõi hợp đồng nháp, hiệu lực, sắp hết hạn và đã kết thúc." action={<Link className="app-button app-button--primary" to="/contracts/create">Tạo hợp đồng</Link>} />
      <div className="tabs">{['all', 'Draft', 'Active', 'Expired', 'Terminated'].map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item === 'all' ? 'Tất cả' : item}</button>)}</div>
      <DataTable headers={['Mã HĐ', 'Tenant', 'Phòng', 'Ngày BĐ', 'Ngày KT', 'Tiền thuê', 'Trạng thái', 'Hành động']} rows={rows.map((item) => [item.code, item.tenant, item.room, formatDate(item.startDate), formatDate(item.endDate), formatVND(item.rent), <Badge variant={statusVariant(item.status)}>{item.status}</Badge>, <div className="actions"><Link to={`/contracts/${item.id}`}>Xem</Link>{item.status === 'Draft' ? <Button variant="outline" loading={activate.isLoading} onClick={() => activate.mutate(item.id)}>Ký duyệt</Button> : null}<Button variant="ghost">Kết thúc</Button></div>])} />
    </main>
  )
}

export function ContractCreatePage() {
  const [step, setStep] = useState(1)
  const save = useMutation(() => ok({}))
  return (
    <main className="page">
      <PageHeader title="Tạo hợp đồng" subtitle="Wizard 3 bước: chọn phòng, nhập điều khoản và xác nhận." />
      <div className="wizard"><span style={{ width: `${step * 33.33}%` }} /></div>
      <Card>
        <h2>Bước {step}: {step === 1 ? 'Chọn phòng & Tenant' : step === 2 ? 'Điều khoản' : 'Xác nhận'}</h2>
        {step === 1 ? <div className="form-grid"><select><option>Tro88 An Phú</option></select><select><option>Phòng 102 - Available</option></select><input placeholder="Tìm tenant" /><label className="check"><input type="checkbox" /> Tạo tenant mới</label></div> : null}
        {step === 2 ? <div className="form-grid"><input type="date" defaultValue="2026-06-01" /><select><option>12 tháng</option><option>6 tháng</option><option>3 tháng</option></select><input defaultValue="31/05/2027" readOnly /><input type="number" defaultValue={3200000} /><input type="number" defaultValue={3200000} /><select><option>Ngày 5</option><option>Ngày 10</option></select><textarea placeholder="Điều khoản đặc biệt" /></div> : null}
        {step === 3 ? <div className="summary-card"><p>Phòng 102, Tenant Trần Hoàng Nam, thời hạn 12 tháng.</p><strong>{formatVND(3200000)}/tháng • Cọc {formatVND(3200000)}</strong><label className="check"><input type="checkbox" /> Xác nhận thông tin</label></div> : null}
        <div className="actions footer-actions"><Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))}>Back</Button>{step < 3 ? <Button onClick={() => setStep(step + 1)}>Next</Button> : <><Button variant="outline" loading={save.isLoading}>Lưu bản nháp</Button><Button loading={save.isLoading} onClick={() => save.mutate()}>Ký & Kích hoạt</Button></>}</div>
      </Card>
    </main>
  )
}

export function ContractDetailPage() {
  const contract = contracts.find((item) => item.id === pageId('c1')) ?? contracts[0]
  return (
    <main className="page">
      <PageHeader title={`Hợp đồng ${contract.code}`} />
      <div className="split">
        <Card className="document"><h2>HỢP ĐỒNG THUÊ PHÒNG</h2><p>Mã: #{contract.code}</p><h3>Thông tin hai bên</h3><p>Bên thuê: {contract.tenant}. Phòng: {contract.room}.</p><h3>Điều khoản</h3><p>Thời hạn {formatDate(contract.startDate)} - {formatDate(contract.endDate)}. Giá thuê {formatVND(contract.rent)}. Cọc {formatVND(contract.deposit)}. Thanh toán ngày {contract.paymentDay} hàng tháng.</p><div className="signatures"><span>Chủ trọ</span><span>Người thuê</span></div></Card>
        <Card><Badge variant={statusVariant(contract.status)}>{contract.status}</Badge><Timeline items={['Tạo', 'Ký', 'Kích hoạt', 'Hết hạn']} /><div className="actions vertical"><Button>Ký duyệt</Button><Button variant="outline">Tải PDF</Button><Link to={`/rooms/${rooms[0].id}`}>Xem phòng</Link><Link to="/invoices">Xem hóa đơn</Link></div></Card>
      </div>
      <div className="tabs"><button>Người trong phòng</button><button>Hóa đơn liên quan</button></div>
    </main>
  )
}

export function ContractTenantsPage() {
  return <SimplePage title="Người trong phòng" subtitle="Danh sách tenant, CCCD, số điện thoại và ngày vào phòng." />
}

export function InvoicesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const counts = useMemo(() => ({ paid: invoices.filter((item) => item.status === 'Paid').length, unpaid: invoices.filter((item) => item.status === 'Unpaid').length, overdue: invoices.filter((item) => item.status === 'Overdue').length }), [])
  return (
    <main className="page">
      <PageHeader title="Hóa đơn tháng 05/2026" subtitle="Tạo, gửi, đánh dấu thanh toán và xuất PDF." action={<div className="actions"><Link className="app-button app-button--outline" to="/invoices/bulk">Tạo hàng loạt</Link><Link className="app-button app-button--primary" to="/invoices/create">Tạo hóa đơn</Link></div>} />
      <div className="stat-grid"><Card><span>Tổng</span><strong>{invoices.length}</strong></Card><Card><span>Đã TT</span><strong>{counts.paid}</strong></Card><Card><span>Chưa TT</span><strong>{counts.unpaid}</strong></Card><Card><span>Quá hạn</span><strong>{counts.overdue}</strong></Card></div>
      {selected.length ? <Card className="bulk-bar">Gửi {selected.length} hóa đơn được chọn <Button variant="outline">Gửi hàng loạt</Button></Card> : null}
      <DataTable headers={['', 'Mã', 'Phòng', 'Tenant', 'Tiền thuê', 'Điện', 'Nước', 'DV', 'Tổng', 'Hạn TT', 'Trạng thái', 'Hành động']} rows={invoices.map((item) => [<input type="checkbox" checked={selected.includes(item.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} />, item.code, item.room, item.tenant, formatVND(item.rent), formatVND(item.electricity), formatVND(item.water), formatVND(item.service), formatVND(total(item)), formatDate(item.dueDate), <Badge variant={statusVariant(item.status)}>{item.status}</Badge>, <div className="actions"><Link to={`/invoices/${item.id}`}>Xem</Link><Button variant="ghost">Gửi</Button><Button variant="outline">Đã TT</Button></div>])} />
    </main>
  )
}

export function InvoiceDetailPage() {
  const invoice = invoices.find((item) => item.id === pageId('i1')) ?? invoices[0]
  return (
    <main className="page">
      <PageHeader title={`Hóa đơn ${invoice.code}`} />
      <div className="split">
        <Card className="document"><h2>HÓA ĐƠN TIỀN NHÀ</h2><p>Mã: #{invoice.code}</p><p>Người thuê: {invoice.tenant} - Phòng {invoice.room}</p><DataTable headers={['STT', 'Khoản', 'Đơn giá', 'SL', 'Thành tiền']} rows={[[1, 'Tiền thuê phòng', formatVND(invoice.rent), 1, formatVND(invoice.rent)], [2, 'Tiền điện', '3.800đ', 120, formatVND(invoice.electricity)], [3, 'Tiền nước', '18.000đ', 7, formatVND(invoice.water)], [4, 'Dịch vụ', formatVND(invoice.service), 1, formatVND(invoice.service)]]} /><strong className="money">Tổng cộng: {formatVND(total(invoice))}</strong><div className="qr">QR</div><p>TK ngân hàng: 0123456789 - Tro88</p></Card>
        <Card><Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge><Timeline items={['Tạo', 'Gửi', 'Đến hạn', 'Thanh toán']} /><div className="actions vertical"><Button>Gửi email</Button><Button variant="outline">PDF</Button><Button variant="secondary">Đánh dấu đã TT</Button><Button variant="ghost">Copy thông tin CK</Button></div></Card>
      </div>
    </main>
  )
}

export function InvoiceCreatePage() {
  return <SimpleFormPage title="Tạo hóa đơn" fields={['Hợp đồng', 'Tháng', 'Tiền thuê', 'Tiền điện', 'Tiền nước', 'Dịch vụ', 'Hạn thanh toán', 'Ghi chú']} />
}

export function InvoiceBulkPage() {
  return (
    <main className="page">
      <PageHeader title="Tạo hóa đơn hàng loạt T05/2026" subtitle="Chọn nhà, nhập chỉ số mới, xem trước và tạo hóa đơn." />
      <Card><h2>Chỉ số điện nước</h2><UtilityTable /><div className="footer-actions"><span>3/3 phòng đã nhập</span><Button variant="outline">Xem trước</Button><Button>Tạo 3 hóa đơn</Button></div></Card>
    </main>
  )
}

export function MyInvoicesPage() {
  const invoice = invoices[0]
  return (
    <section className="tenant-page">
      <h1>Hóa đơn của tôi</h1>
      <Card className="tenant-room-card"><Badge variant={statusVariant(invoice.status)}>{invoice.status}</Badge><strong className="money danger">{formatVND(total(invoice))}</strong><p>Hạn TT: {formatDate(invoice.dueDate)}</p><details open><summary>Chi tiết</summary><p>Tiền thuê {formatVND(invoice.rent)}</p><p>Điện {formatVND(invoice.electricity)}</p><p>Nước {formatVND(invoice.water)}</p><p>Dịch vụ {formatVND(invoice.service)}</p></details><div className="qr">QR</div><Button full>Đã chuyển khoản → Thông báo</Button></Card>
      <Card><h2>Lịch sử</h2>{invoices.map((item) => <details key={item.id}><summary>T{item.month}/{item.year} • {formatVND(total(item))} • {item.status}</summary><Link to={`/invoices/${item.id}`}>Xem chi tiết</Link></details>)}</Card>
    </section>
  )
}

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

function UtilityTable() {
  return <DataTable headers={['Phòng', 'Điện cũ', 'Điện mới', 'Tiêu thụ', 'Nước cũ', 'Nước mới', 'Tiêu thụ', 'Ghi chú']} rows={rooms.map((room, index) => [room.roomNumber, 120 + index * 10, <input defaultValue={150 + index * 11} />, 30 + index, 20 + index, <input defaultValue={27 + index} />, 7, index === 2 ? 'Tăng bất thường' : ''])} />
}

export function MaintenancePage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isTenant = pathname.startsWith('/my')
  if (isTenant) {
    return (
      <section className="tenant-page">
        <h1>Bảo trì</h1>
        <Link className="app-button app-button--primary" to="/my/maintenance/create">Gửi yêu cầu</Link>
        <div className="list">{maintenance.map((item) => <MaintenanceCard key={item.id} item={item} />)}</div>
      </section>
    )
  }
  const columns: Array<{ status: Maintenance['status']; label: string }> = [{ status: 'New', label: 'Mới' }, { status: 'InProgress', label: 'Đang xử lý' }, { status: 'Done', label: 'Hoàn thành' }]
  return (
    <main className="page">
      <PageHeader title="Yêu cầu bảo trì" subtitle="Kanban xử lý bảo trì, phân công và theo dõi tiến độ." />
      <div className="kanban">{columns.map((column) => <Card key={column.status} className={`kanban-col ${column.status}`}><h2>{column.label} ({maintenance.filter((item) => item.status === column.status).length})</h2>{maintenance.filter((item) => item.status === column.status).map((item) => <MaintenanceCard key={item.id} item={item} />)}</Card>)}</div>
    </main>
  )
}

function MaintenanceCard({ item }: { item: Maintenance }) {
  return <Card className="maintenance-card"><div className="card-heading"><Badge variant="info">Phòng {item.room}</Badge><Badge variant={item.priority === 'Urgent' ? 'danger' : item.priority === 'Soon' ? 'warning' : 'success'}>{item.priority}</Badge></div><h3>{item.title}</h3><p>{item.tenant} • {item.time}</p><select defaultValue="Kỹ thuật A"><option>Kỹ thuật A</option><option>Kỹ thuật B</option></select><Link to={`/maintenance/${item.id}`}>Xem chi tiết</Link></Card>
}

export function MaintenanceDetailPage() {
  const item = maintenance.find((m) => m.id === pageId('m1')) ?? maintenance[0]
  return (
    <main className="page">
      <PageHeader title={item.title} subtitle={`Phòng ${item.room} • ${item.category}`} />
      <div className="split"><Card><Badge variant={statusVariant(item.status)}>{item.status}</Badge><p>{item.tenant} gửi yêu cầu: {item.title}. Mô tả chi tiết vấn đề và ảnh đính kèm nằm trong khu vực này.</p><div className="gallery"><div /><div /><div /></div><Timeline items={['Gửi', 'Nhận', 'Xử lý', 'Hoàn thành']} /></Card><Card><select defaultValue={item.status}><option>New</option><option>InProgress</option><option>Done</option></select><select><option>Kỹ thuật A</option></select><textarea placeholder="Ghi chú xử lý" /><Button>Lưu trạng thái</Button><div className="upload-box">Upload thêm ảnh</div></Card></div>
    </main>
  )
}

export function MaintenanceCreatePage() {
  const save = useMutation(() => ok({}), { onSuccess: () => navigateTo('/my/maintenance') })
  return (
    <section className="tenant-page">
      <h1>Gửi yêu cầu bảo trì</h1>
      <FormShell onSubmit={() => save.mutate()} loading={save.isLoading}>
        <div className="category-grid">{['Điện', 'Nước', 'ĐH', 'Cửa', 'Wifi', 'Khác'].map((item) => <label key={item}><input name="cat" type="radio" /> {item}</label>)}</div>
        <input placeholder="Tiêu đề" required /><textarea placeholder="Mô tả" required /><div className="role-cards"><label><input name="priority" type="radio" defaultChecked /> Bình thường</label><label><input name="priority" type="radio" /> Cần sớm</label><label><input name="priority" type="radio" /> Khẩn cấp</label></div><div className="upload-box">Upload tối đa 3 ảnh</div>
      </FormShell>
    </section>
  )
}

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

export function AiAgentPage() {
  const [messages, setMessages] = useState([{ role: 'assistant', text: 'Xin chào, tôi có thể giúp bạn kiểm tra phòng trống, công nợ và doanh thu.' }])
  const [input, setInput] = useState('')
  const send = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: 'user', text: input }, { role: 'assistant', text: `Tôi đã ghi nhận: "${input}". Dữ liệu demo cho thấy phòng 102 đang trống.` }])
    setInput('')
  }
  return (
    <main className="chat-page">
      <aside className="chat-sidebar"><Button full>Cuộc trò chuyện mới</Button>{['Công nợ tháng này', 'Phòng trống', 'Doanh thu'].map((item) => <button key={item}>{item}<span>Hôm nay</span></button>)}</aside>
      <section className="chat-main"><header>Trợ lý Tro88 AI</header><div className="messages">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`message ${message.role}`}>{message.text}</div>)}</div><div className="prompt-chips">{['Phòng nào đang trống?', 'Tháng này ai chưa đóng tiền?', 'Doanh thu 6 tháng gần nhất', 'Hợp đồng sắp hết hạn'].map((text) => <button key={text} onClick={() => setInput(text)}>{text}</button>)}</div><div className="chat-input"><textarea value={input} onChange={(event) => setInput(event.target.value)} rows={2} /><Button onClick={send}>Gửi</Button></div></section>
    </main>
  )
}

export function StatisticsPage() {
  return (
    <main className="page">
      <PageHeader title="Thống kê & Báo cáo" subtitle="Lọc theo khoảng thời gian và nhà trọ." />
      <div className="filter-bar"><input type="month" defaultValue="2026-05" /><select><option>Tất cả nhà</option></select></div>
      <div className="stat-grid"><Card><span>Tổng doanh thu tháng này</span><strong>{formatVND(128500000)}</strong><small>↑ 12%</small></Card><Card><span>HĐ active</span><strong>24</strong></Card><Card><span>Tỷ lệ lấp đầy</span><strong>82%</strong></Card><Card><span>Công nợ</span><strong>{formatVND(18600000)}</strong></Card></div>
      <Card><h2>Revenue Chart</h2><AreaChartLite /></Card>
      <div className="split"><Card><h2>Phân bổ thu nhập</h2><div className="pie-lite" /></Card><Card><h2>Top phòng doanh thu cao</h2>{rooms.map((room) => <div className="mini-bar" key={room.id}><span>Phòng {room.roomNumber}</span><div><i style={{ width: `${room.monthlyRent / 50000}%` }} /></div><strong>{formatVND(room.monthlyRent)}</strong></div>)}</Card></div>
      <Card><h2>Unpaid analysis</h2><DataTable headers={['Phòng', 'Tenant', 'Số tiền', 'Quá hạn']} rows={invoices.filter((item) => item.status !== 'Paid').map((item) => [item.room, item.tenant, formatVND(total(item)), item.status === 'Overdue' ? '25 ngày' : '0 ngày'])} /></Card>
    </main>
  )
}

export function ServiceFeesPage() {
  const [open, setOpen] = useState(false)
  const fees = [['Wifi', 'Cố định tháng', 100000, 'Tất cả nhà', true], ['Bãi xe', 'Cố định tháng', 150000, 'An Phú', true], ['Máy giặt', 'Theo đơn vị', 20000, 'Bình Thạnh', false]] as const
  return (
    <main className="page">
      <PageHeader title="Dịch vụ & Phí" action={<Button onClick={() => setOpen(true)}>Thêm dịch vụ</Button>} />
      <DataTable headers={['Tên', 'Loại', 'Đơn giá', 'Áp dụng', 'Trạng thái', 'Sửa/Xóa']} rows={fees.map((fee) => [fee[0], fee[1], formatVND(fee[2]), fee[3], <label className="switch"><input type="checkbox" defaultChecked={fee[4]} /><span /></label>, <div className="actions"><Button variant="ghost">Sửa</Button><Button variant="danger">Xóa</Button></div>])} />
      {open ? <div className="modal"><Card><h2>Thêm dịch vụ</h2><FormShell onSubmit={() => setOpen(false)}><input placeholder="Tên dịch vụ" /><select><option>Cố định tháng</option><option>Theo đơn vị</option></select><input placeholder="Đơn giá" /><select multiple><option>Tro88 An Phú</option><option>Tro88 Bình Thạnh</option></select><label className="check"><input type="checkbox" defaultChecked /> Bật</label></FormShell></Card></div> : null}
    </main>
  )
}

export function ProfilePage() {
  const [tab, setTab] = useState('info')
  return (
    <main className="page">
      <PageHeader title="Hồ sơ cá nhân" />
      <div className="split"><Card className="profile-card"><span className="avatar large">AT</span><Button variant="outline">Đổi ảnh</Button><h2>An Tro88</h2><p>an@tro88.local</p><Badge variant="info">Owner</Badge><small>Ngày tham gia 01/01/2026</small></Card><Card><div className="tabs"><button className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>Thông tin</button><button className={tab === 'security' ? 'active' : ''} onClick={() => setTab('security')}>Bảo mật</button></div>{tab === 'info' ? <FormShell><input defaultValue="An Tro88" /><input defaultValue="an@tro88.local" readOnly /><input placeholder="Số điện thoại" /><input placeholder="CCCD/CMND" /><input type="date" /><Button>Lưu thay đổi</Button></FormShell> : <FormShell><input type="password" placeholder="Mật khẩu hiện tại" /><input type="password" placeholder="Mật khẩu mới" /><input type="password" placeholder="Xác nhận mật khẩu" /><Button>Đổi mật khẩu</Button></FormShell>}</Card></div>
    </main>
  )
}

export function AuditLogsPage() {
  return (
    <main className="page">
      <PageHeader title="Lịch sử hoạt động" subtitle="Admin only: lọc user, module, action và xem diff JSON." />
      <div className="filter-bar"><input placeholder="Search user/action" /><select><option>Module</option></select><select><option>CREATE</option><option>UPDATE</option><option>DELETE</option><option>LOGIN</option></select><input type="date" /></div>
      <DataTable dense headers={['Thời gian', 'User', 'Role', 'Action', 'Module', 'Mô tả', 'IP', 'Chi tiết']} rows={[['28/05/2026 15:20', 'admin', 'Admin', 'UPDATE', 'Invoice', 'Đánh dấu đã thanh toán', '127.0.0.1', <Button variant="outline">Chi tiết</Button>], ['28/05/2026 14:10', 'owner', 'Owner', 'CREATE', 'Room', 'Tạo phòng 102', '127.0.0.1', <Button variant="outline">Chi tiết</Button>]]} />
      <Card className="drawer"><h2>Diff JSON</h2><pre>{JSON.stringify({ old: { status: 'Unpaid' }, new: { status: 'Paid' } }, null, 2)}</pre></Card>
    </main>
  )
}

function DataTable({ headers, rows, dense = false }: { headers: string[]; rows: ReactNode[][]; dense?: boolean }) {
  return (
    <div className={`table-wrap ${dense ? 'dense' : ''}`}>
      <table>
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function FormShell({ children, onSubmit, loading = false }: { children: ReactNode; onSubmit?: () => void; loading?: boolean }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.()
  }
  return <Card><form className="form-grid" onSubmit={submit}>{children}<div className="footer-actions"><Link className="app-button app-button--outline" to="/dashboard">Hủy</Link><Button type="submit" loading={loading}>Lưu</Button></div></form></Card>
}

function Timeline({ items }: { items: string[] }) {
  return <ol className="timeline">{items.map((item) => <li key={item}>{item}</li>)}</ol>
}

function SimplePage({ title, subtitle, chart = false }: { title: string; subtitle: string; chart?: boolean }) {
  return <main className="page"><PageHeader title={title} subtitle={subtitle} />{chart ? <Card><AreaChartLite /></Card> : <EmptyState title={title} description={subtitle} />}</main>
}

function SimpleFormPage({ title, fields }: { title: string; fields: string[] }) {
  return <main className="page"><PageHeader title={title} /><FormShell>{fields.map((field) => <input key={field} placeholder={field} />)}</FormShell></main>
}
