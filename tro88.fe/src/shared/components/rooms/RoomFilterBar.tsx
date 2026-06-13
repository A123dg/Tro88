// Component: Owner/Rooms/RoomsPage
import { Select, Input } from 'antd'
import { useEffect, useState } from 'react'
import { RoomFilters, RoomSort, RoomStatus, RoomStats } from '../../../types/room.types'

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
        <Input.Search
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Tìm số phòng..."
          enterButton
          style={{ width: 220 }}
        />

        <Select
          value={filters.status ?? 'all'}
          onChange={(value) => setStatus(value as RoomStatus | 'all')}
          aria-label="Lọc theo trạng thái"
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: RoomStatus.Occupied, label: 'Đang thuê' },
            { value: RoomStatus.Available, label: 'Phòng trống' },
            { value: RoomStatus.Maintenance, label: 'Bảo trì' },
          ]}
        />

        <Select
          value={filters.sort ?? 'roomNumberAsc'}
          onChange={(value) => setSort(value as RoomSort)}
          aria-label="Sắp xếp phòng"
          options={[
            { value: 'roomNumberAsc', label: 'Số phòng tăng dần' },
            { value: 'rentAsc', label: 'Giá thấp trước' },
            { value: 'rentDesc', label: 'Giá cao trước' },
            { value: 'areaDesc', label: 'Diện tích lớn trước' },
          ]}
        />
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
