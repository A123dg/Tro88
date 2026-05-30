import { useEffect, useState } from 'react'
import { RoomFilters, RoomSort, RoomStatus, RoomStats } from '../../types/room.types'

interface RoomFilterBarProps {
  filters: RoomFilters
  stats: RoomStats
  onChange: (filters: RoomFilters) => void
}

const statusTabs: Array<{ value: RoomStatus | 'all'; label: string; countKey: keyof RoomStats | 'total' }> = [
  { value: 'all', label: 'Tất cả', countKey: 'total' },
  { value: RoomStatus.Occupied, label: 'Đang thuê', countKey: 'occupied' },
  { value: RoomStatus.Available, label: 'Trống', countKey: 'available' },
  { value: RoomStatus.Maintenance, label: 'BT', countKey: 'maintenance' },
]

export function RoomFilterBar({ filters, stats, onChange }: RoomFilterBarProps) {
  const [searchValue, setSearchValue] = useState(filters.search ?? '')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onChange({ ...filters, search: searchValue, page: 1 })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchValue])

  const setStatus = (status: RoomStatus | 'all') => {
    onChange({ ...filters, status, page: 1 })
  }

  const setSort = (sort: RoomSort) => {
    onChange({ ...filters, sort, page: 1 })
  }

  return (
    <section className="room-filter-bar" aria-label="Bộ lọc phòng">
      <div className="room-filter-bar__controls">
        <label className="search-field" aria-label="Tìm kiếm số phòng">
          <span>🔍</span>
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Tìm số phòng..."
          />
        </label>

        <select
          value={filters.status ?? 'all'}
          onChange={(event) => setStatus(event.target.value as RoomStatus | 'all')}
          aria-label="Lọc theo trạng thái"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value={RoomStatus.Occupied}>Đang thuê</option>
          <option value={RoomStatus.Available}>Phòng trống</option>
          <option value={RoomStatus.Maintenance}>Bảo trì</option>
        </select>

        <select
          value={filters.sort ?? 'roomNumberAsc'}
          onChange={(event) => setSort(event.target.value as RoomSort)}
          aria-label="Sắp xếp phòng"
        >
          <option value="roomNumberAsc">Số phòng tăng dần</option>
          <option value="rentAsc">Giá thấp trước</option>
          <option value="rentDesc">Giá cao trước</option>
          <option value="areaDesc">Diện tích lớn trước</option>
        </select>
      </div>

      <div className="room-filter-bar__tabs" role="tablist" aria-label="Trạng thái phòng">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={filters.status === tab.value || (!filters.status && tab.value === 'all') ? 'is-active' : ''}
            onClick={() => setStatus(tab.value)}
          >
            {tab.label} <span>({stats[tab.countKey]})</span>
          </button>
        ))}
      </div>
    </section>
  )
}
