import { useRouterState } from '@tanstack/react-router'
import { UploadOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../services/apiClient'
import { queryClient } from '../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse } from '../../services/houseService'
import ModalForm from '../../shared/components/modal-form/ModalForm'

export function Link({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return <a href={to} className={className}>{children}</a>
}

export function navigateTo(to: string) {
  window.location.href = to
}

export type Status = 'Available' | 'Occupied' | 'Maintenance' | 'Draft' | 'Active' | 'Expired' | 'Terminated' | 'Unpaid' | 'Paid' | 'Overdue' | 'New' | 'InProgress' | 'Done' | 'Normal' | 'Soon' | 'Urgent' | 'PendingApproval' | 'Inactive'

export interface ApiResponse<T> {
  code: number
  success: boolean
  message: string
  data: T
}

export interface ProvinceListResponse {
  code: number
  success: boolean
  message: string | null
  messages: string | null
  data: Record<string, string>
}

export interface ProvinceOption {
  value: string
  label: string
}

export interface WardListResponse {
  code: number
  success: boolean
  message: string | null
  messages: string | null
  data: Array<{
    id: number
    ten: string
    tinhThanh: {
      id: number
      ten: string
    }
  }>
}

export interface WardOption {
  value: string
  label: string
}

export async function fetchProvinceOptions(): Promise<ProvinceOption[]> {
  const response = await fetch('https://cmcdtqgapi.zamiga.vn/api/TinhXaPhuongCongKhai/lay-danh-sach-chon-tinh-cong-khai')

  if (!response.ok) {
    throw new Error('Không tải được danh sách tỉnh')
  }

  const payload = await response.json() as ProvinceListResponse

  if (!payload.success) {
    throw new Error(payload.message ?? 'Không tải được danh sách tỉnh')
  }

  return Object.entries(payload.data)
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label, 'vi'))
}

export async function fetchWardOptions(provinceId: string): Promise<WardOption[]> {
  const response = await fetch(`https://cmcdtqgapi.zamiga.vn/api/TinhXaPhuongCongKhai/xa-cong-khai?Query.TinhThanhId=${encodeURIComponent(provinceId)}`)

  if (!response.ok) {
    throw new Error('Không tải được danh sách xã/phường')
  }

  const payload = await response.json() as WardListResponse

  if (!payload.success) {
    throw new Error(payload.message ?? 'Không tải được danh sách xã/phường')
  }

  return payload.data
    .map((ward) => ({
      value: String(ward.id),
      label: ward.ten,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, 'vi'))
}

export interface House {
  id: string
  name: string
  address: string
  active?: boolean
  rooms?: number
  occupied?: number
  isActive?: boolean
  totalRooms?: number
  occupiedRooms?: number
  status?: 'PendingApproval' | 'Active' | 'Inactive' | string
  mediaUrl?: string | null
  mediaUrls?: string[]
}

export interface Room {
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

export interface Contract {
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

export interface Invoice {
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

export interface Maintenance {
  id: string
  room: string
  title: string
  tenant: string
  category: string
  priority: 'Normal' | 'Soon' | 'Urgent'
  status: 'New' | 'InProgress' | 'Done'
  time: string
}

export const QK = {
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

export const houses: House[] = [
  { id: 'h1', name: 'Tro88 An Phú', address: '12 Nguyễn Văn Hưởng, TP Thủ Đức', active: true, rooms: 18, occupied: 15 },
  { id: 'h2', name: 'Tro88 Bình Thạnh', address: '88 Xô Viết Nghệ Tĩnh, Bình Thạnh', active: true, rooms: 12, occupied: 9 },
  { id: 'h3', name: 'Tro88 Tân Bình', address: '45 Cộng Hòa, Tân Bình', active: false, rooms: 10, occupied: 0 },
]

export const rooms: Room[] = [
  { id: 'r101', houseId: 'h1', roomNumber: '101', floor: 1, area: 24, maxOccupants: 2, monthlyRent: 3500000, depositAmount: 3500000, status: 'Occupied', electricityUnitPrice: 3800, waterUnitPrice: 18000, description: 'Phòng sáng, có ban công và máy lạnh.' },
  { id: 'r102', houseId: 'h1', roomNumber: '102', floor: 1, area: 22, maxOccupants: 2, monthlyRent: 3200000, depositAmount: 3200000, status: 'Available', electricityUnitPrice: 3800, waterUnitPrice: 18000, description: 'Phòng mới sơn, gần khu giặt.' },
  { id: 'r203', houseId: 'h2', roomNumber: '203', floor: 2, area: 28, maxOccupants: 3, monthlyRent: 4200000, depositAmount: 4200000, status: 'Maintenance', electricityUnitPrice: 4000, waterUnitPrice: 20000, description: 'Đang sửa hệ thống nước.' },
]

export const contracts: Contract[] = [
  { id: 'c1', code: 'CTR-2026-001', tenant: 'Nguyễn Minh Anh', room: '101', startDate: '2026-01-01', endDate: '2026-12-31', rent: 3500000, deposit: 3500000, paymentDay: 5, status: 'Active' },
  { id: 'c2', code: 'CTR-2026-002', tenant: 'Trần Hoàng Nam', room: '102', startDate: '2026-06-01', endDate: '2027-05-31', rent: 3200000, deposit: 3200000, paymentDay: 8, status: 'Draft' },
  { id: 'c3', code: 'CTR-2025-011', tenant: 'Lê Thu Hà', room: '203', startDate: '2025-05-01', endDate: '2026-05-31', rent: 4200000, deposit: 4200000, paymentDay: 3, status: 'Expired' },
]

export const invoices: Invoice[] = [
  { id: 'i1', code: 'INV-05-001', room: '101', tenant: 'Nguyễn Minh Anh', month: 5, year: 2026, rent: 3500000, electricity: 456000, water: 126000, service: 150000, dueDate: '2026-06-05', status: 'Unpaid' },
  { id: 'i2', code: 'INV-05-002', room: '102', tenant: 'Trần Hoàng Nam', month: 5, year: 2026, rent: 3200000, electricity: 360000, water: 108000, service: 150000, dueDate: '2026-06-08', status: 'Paid' },
  { id: 'i3', code: 'INV-04-006', room: '203', tenant: 'Lê Thu Hà', month: 4, year: 2026, rent: 4200000, electricity: 500000, water: 160000, service: 180000, dueDate: '2026-05-03', status: 'Overdue' },
]

export const maintenance: Maintenance[] = [
  { id: 'm1', room: '101', title: 'Máy lạnh không lạnh', tenant: 'Nguyễn Minh Anh', category: 'Điện lạnh', priority: 'Soon', status: 'New', time: '2 giờ trước' },
  { id: 'm2', room: '203', title: 'Rò nước lavabo', tenant: 'Lê Thu Hà', category: 'Nước', priority: 'Urgent', status: 'InProgress', time: 'Hôm qua' },
  { id: 'm3', room: '102', title: 'Thay ổ khóa cửa', tenant: 'Trần Hoàng Nam', category: 'Cửa', priority: 'Normal', status: 'Done', time: '3 ngày trước' },
]

export function ok<T>(data: T): Promise<ApiResponse<T>> {
  return Promise.resolve({ code: 200, success: true, message: 'OK', data })
}

export async function read<T>(endpoint: string, fallback: T): Promise<T> {
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

export function formatVND(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return '0đ'
  return `${amount.toLocaleString('vi-VN')}đ`
}

export function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

export function pageId(fallback: string) {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  const previous = parts[parts.length - 2]
  return last === 'edit' ? previous ?? fallback : last ?? fallback
}

export function total(invoice: Invoice) {
  return invoice.rent + invoice.electricity + invoice.water + invoice.service
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

export function Button({ children, variant = 'primary', full = false, loading = false, onClick, type = 'button' }: { children: ReactNode; variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'; full?: boolean; loading?: boolean; onClick?: () => void; type?: 'button' | 'submit' }) {
  return <button type={type} className={`app-button app-button--${variant} ${full ? 'app-button--full' : ''}`} disabled={loading} onClick={onClick}>{loading ? 'Đang xử lý...' : children}</button>
}

export function Badge({ children, variant = 'gray' }: { children: ReactNode; variant?: 'success' | 'warning' | 'danger' | 'info' | 'gray' }) {
  return <span className={`badge badge--${variant}`}><span />{children}</span>
}

export function statusVariant(status: Status): 'success' | 'warning' | 'danger' | 'info' | 'gray' {
  if (status === 'Active' || status === 'Paid' || status === 'Available' || status === 'Done') return 'success'
  if (status === 'Unpaid' || status === 'Draft' || status === 'New' || status === 'PendingApproval') return 'warning'
  if (status === 'Overdue' || status === 'Expired' || status === 'Urgent' || status === 'Inactive') return 'danger'
  if (status === 'Maintenance' || status === 'InProgress') return 'info'
  return 'gray'
}

export function houseStatusLabel(status?: string, active?: boolean) {
  if (status === 'PendingApproval') return 'Chờ duyệt'
  if (status === 'Active') return 'Hoạt động'
  if (status === 'Inactive') return 'Không hoạt động'
  return active ? 'Hoạt động' : 'Không hoạt động'
}

export function normalizeHouse(house: House) {
  const totalRooms = house.totalRooms ?? house.rooms ?? 0
  const occupiedRooms = house.occupiedRooms ?? house.occupied ?? 0
  const isActive = house.isActive ?? house.active ?? house.status === 'Active'
  const status = house.status ?? (isActive ? 'Active' : 'Inactive')
  const mediaUrls = house.mediaUrls ?? (house.mediaUrl ? [house.mediaUrl] : [])

  return {
    ...house,
    totalRooms,
    occupiedRooms,
    isActive,
    status,
    mediaUrls,
  }
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
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

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="empty">
      <Illustration kind="empty" />
      <h3>{title}</h3>
      <p>{description}</p>
    </Card>
  )
}

export function SkeletonGrid() {
  return <div className="grid-3">{[1, 2, 3].map((item) => <div key={item} className="skeleton-card" />)}</div>
}

export function Illustration({ kind }: { kind: 'tenant' | 'room' | 'maintenance' | 'invoice' | 'contract' | 'empty' }) {
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

export function MiniBarChart({ values }: { values: number[] }) {
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

export function AreaChartLite() {
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


export function UtilityTable() {
  return <DataTable headers={['Phòng', 'Điện cũ', 'Điện mới', 'Tiêu thụ', 'Nước cũ', 'Nước mới', 'Tiêu thụ', 'Ghi chú']} rows={rooms.map((room, index) => [room.roomNumber, 120 + index * 10, <input defaultValue={150 + index * 11} />, 30 + index, 20 + index, <input defaultValue={27 + index} />, 7, index === 2 ? 'Tăng bất thường' : ''])} />
}

export function MaintenanceCard({ item }: { item: Maintenance }) {
  return <Card className="maintenance-card"><div className="card-heading"><Badge variant="info">Phòng {item.room}</Badge><Badge variant={item.priority === 'Urgent' ? 'danger' : item.priority === 'Soon' ? 'warning' : 'success'}>{item.priority}</Badge></div><h3>{item.title}</h3><p>{item.tenant} • {item.time}</p><Select defaultValue="Kỹ thuật A" options={[{ value: 'Kỹ thuật A', label: 'Kỹ thuật A' }, { value: 'Kỹ thuật B', label: 'Kỹ thuật B' }]} /><Link to={`/maintenance/${item.id}`}>Xem chi tiết</Link></Card>
}

export function NotificationList({ limit, muted = false }: { limit: number; muted?: boolean }) {
  return <div className={`list ${muted ? 'muted' : ''}`}>{['Hóa đơn tháng này đã được tạo', 'Yêu cầu bảo trì đã chuyển sang đang xử lý', 'Hợp đồng phòng 102 chờ ký'].slice(0, limit).map((text) => <Link className="notification-item" to="/notifications" key={text}><span className="unread-dot" /> <strong>{text}</strong><small>2 giờ trước</small></Link>)}</div>
}

export function DataTable({ headers, rows, dense = false }: { headers: string[]; rows: ReactNode[][]; dense?: boolean }) {
  return (
    <div className={`table-wrap ${dense ? 'dense' : ''}`}>
      <table>
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

export function FormShell({ children, onSubmit, loading = false }: { children: ReactNode; onSubmit?: (event: FormEvent<HTMLFormElement>) => void; loading?: boolean }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.(event)
  }
  return <Card><form className="form-grid" onSubmit={submit}>{children}<div className="footer-actions"><Link className="app-button app-button--outline" to="/dashboard">Hủy</Link><Button type="submit" loading={loading}>Lưu</Button></div></form></Card>
}

export function Timeline({ items }: { items: string[] }) {
  return <ol className="timeline">{items.map((item) => <li key={item}>{item}</li>)}</ol>
}

export function SimplePage({ title, subtitle, chart = false }: { title: string; subtitle: string; chart?: boolean }) {
  return <main className="page"><PageHeader title={title} subtitle={subtitle} />{chart ? <Card><AreaChartLite /></Card> : <EmptyState title={title} description={subtitle} />}</main>
}

export function SimpleFormPage({ title, fields }: { title: string; fields: string[] }) {
  return <main className="page"><PageHeader title={title} /><FormShell>{fields.map((field) => <input key={field} placeholder={field} />)}</FormShell></main>
}

