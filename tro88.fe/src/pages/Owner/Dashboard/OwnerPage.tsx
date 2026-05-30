import { useMemo, useState } from 'react'
import { RoomsPage } from '../Rooms/RoomsPage'
import { useHouses, useOwnerDashboard } from './hooks'
import { HouseDto } from './service/types'

type OwnerSection = 'dashboard' | 'houses' | 'rooms'

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}

function OwnerMetric({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: string
}) {
  return (
    <article className="admin-metric" style={{ borderLeftColor: color }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function OwnerDashboardSection() {
  const dashboard = useOwnerDashboard()
  const data = dashboard.data

  if (dashboard.isLoading) {
    return <section className="panel-state">Đang tải tổng quan nhà trọ...</section>
  }

  if (dashboard.isError || !data) {
    return (
      <section className="room-error">
        <strong>Không thể tải tổng quan quản lý nhà trọ</strong>
        <p>Kiểm tra đăng nhập role Owner hoặc API <code>/Dashboard/owner</code>.</p>
        <button type="button" className="button button--primary" onClick={() => dashboard.refetch()}>Thử lại</button>
      </section>
    )
  }

  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <h2>Tổng quan nhà trọ đang quản lý</h2>
          <p>Dữ liệu được lọc theo chủ trọ hiện tại.</p>
        </div>
      </div>

      <div className="admin-metric-grid">
        <OwnerMetric label="Nhà trọ của tôi" value={data.totalHouses} color="#5B8DEF" />
        <OwnerMetric label="Tổng phòng" value={data.totalRooms} color="#52C593" />
        <OwnerMetric label="Phòng đang thuê" value={data.occupiedRooms} color="#F4845F" />
        <OwnerMetric label="Phòng trống" value={data.availableRooms} color="#52C593" />
        <OwnerMetric label="Hợp đồng hiệu lực" value={data.activeContracts} color="#5B8DEF" />
        <OwnerMetric label="Hóa đơn chờ thu" value={data.pendingInvoices} color="#FFB547" />
        <OwnerMetric label="Doanh thu" value={formatCurrency(data.totalRevenue)} color="#F4845F" />
        <OwnerMetric label="Bảo trì chờ xử lý" value={data.pendingMaintenanceRequests} color="#FFB547" />
      </div>
    </section>
  )
}

function HouseCard({ house, onSelect }: { house: HouseDto; onSelect: (id: string) => void }) {
  const occupancyRate = house.totalRooms > 0 ? Math.round((house.occupiedRooms / house.totalRooms) * 100) : 0

  return (
    <article className="house-card">
      <div className="house-card__top">
        <div>
          <h3>{house.name}</h3>
          <p>{house.address}</p>
        </div>
        <span className={house.isActive ? 'house-status is-active' : 'house-status'}>{house.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}</span>
      </div>
      <div className="house-card__stats">
        <span>{house.totalRooms} phòng</span>
        <span>{house.occupiedRooms} đang thuê</span>
        <span>{occupancyRate}% sử dụng</span>
      </div>
      <div className="stat-card__progress">
        <span style={{ width: `${occupancyRate}%`, backgroundColor: '#52C593' }} />
      </div>
      <button type="button" className="button button--primary" onClick={() => onSelect(house.id)}>
        Quản lý phòng
      </button>
    </article>
  )
}

function OwnerHousesSection({ onOpenRooms }: { onOpenRooms: () => void }) {
  const [search, setSearch] = useState('')
  const houses = useHouses({ page: 1, pageSize: 12, search })

  const handleSelectHouse = (id: string) => {
    localStorage.setItem('selectedHouseId', id)
    onOpenRooms()
  }

  return (
    <section className="admin-section">
      <div className="section-heading">
        <div>
          <h2>Nhà trọ của tôi</h2>
          <p>Role Owner chỉ thấy các nhà trọ thuộc quyền quản lý.</p>
        </div>
        <label className="search-field admin-search">
          <span>🔍</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nhà trọ..." />
        </label>
      </div>

      {houses.isLoading ? <div className="panel-state">Đang tải danh sách nhà trọ...</div> : null}
      {houses.isError ? (
        <section className="room-error">
          <strong>Không thể tải danh sách nhà trọ</strong>
          <button type="button" className="button button--primary" onClick={() => houses.refetch()}>Thử lại</button>
        </section>
      ) : null}

      {houses.data ? (
        <div className="house-grid">
          {houses.data.items.map((house) => (
            <HouseCard key={house.id} house={house} onSelect={handleSelectHouse} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function OwnerPage() {
  const [section, setSection] = useState<OwnerSection>('dashboard')
  const sections = useMemo(
    () => [
      { value: 'dashboard' as const, label: 'Tổng quan' },
      { value: 'houses' as const, label: 'Nhà trọ' },
      { value: 'rooms' as const, label: 'Phòng trọ' },
    ],
    [],
  )

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
          <nav className="breadcrumb">Tro88 / Quản lý nhà trọ</nav>
          <h1>Trang quản lý nhà trọ</h1>
          <p>Dành cho chủ trọ hoặc người quản lý vận hành phòng trọ.</p>
        </div>
      </header>

      <div className="section-tabs">
        {sections.map((item) => (
          <button
            key={item.value}
            type="button"
            className={section === item.value ? 'is-active' : ''}
            onClick={() => setSection(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'dashboard' ? <OwnerDashboardSection /> : null}
      {section === 'houses' ? <OwnerHousesSection onOpenRooms={() => setSection('rooms')} /> : null}
      {section === 'rooms' ? <RoomsPage /> : null}
    </main>
  )
}
