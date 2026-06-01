import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from 'react-query'
import { Input, Select } from 'antd'
import { SearchOutlined, FilterOutlined, HomeOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons'
import { fetchProvinceOptions, fetchWardOptions } from '../../Tro88Screens/shared'
import { useRoomSearch } from '../../../hooks/useRoomSearch'
import { RoomSearchFilters } from '../../../services/roomSearchService'
import { MetaData, RoomDto } from '../../../types/room.types'

// Types
interface RoomFilters {
  keyword: string
  province: string
  district: string
  maxOccupants: number | undefined
  monthlyRent: number | undefined
  page: number
  sortBy: 'newest' | 'priceAsc' | 'priceDesc' | 'capacityDesc'
}

// Default filters
const defaultFilters: RoomFilters = {
  keyword: '',
  province: '',
  district: '',
  maxOccupants: undefined,
  monthlyRent: undefined,
  page: 1,
  sortBy: 'newest',
}

// Occupant options
const occupantOptions = [
  { value: undefined, label: 'Tất cả' },
  { value: 1, label: '1 người' },
  { value: 2, label: '2 người' },
  { value: 3, label: '3 người' },
  { value: 4, label: '4 người' },
  { value: 5, label: '5+ người' },
]

// Price options
const priceOptions = [
  { value: undefined, label: 'Tất cả' },
  { value: 2000000, label: '≤ 2 triệu' },
  { value: 3000000, label: '≤ 3 triệu' },
  { value: 5000000, label: '≤ 5 triệu' },
  { value: 7000000, label: '≤ 7 triệu' },
  { value: 10000000, label: '≤ 10 triệu' },
]

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'priceAsc', label: 'Giá thấp đến cao' },
  { value: 'priceDesc', label: 'Giá cao đến thấp' },
  { value: 'capacityDesc', label: 'Sức chứa nhiều nhất' },
]

function formatCurrency(value: number): string {
  return value.toLocaleString('vi-VN')
}

function SkeletonCard() {
  return (
    <article className="tenant-room-card-skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-line skeleton-line--medium" />
        <div className="skeleton-line skeleton-line--price" />
      </div>
    </article>
  )
}

function RoomCard({ room, onNavigate }: { room: RoomDto; onNavigate: (id: string) => void }) {
  const [isFavorite, setIsFavorite] = useState(false)

  // Determine status based on availability
  const isAvailable = room.status === 'Available'
  const isAlmostFull = !isAvailable && room.maxOccupants > 0

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  return (
    <article
      className="tenant-room-card"
      onClick={() => onNavigate(room.id)}
    >
      <div className="tenant-room-card__image">
        {room.imageUrls && room.imageUrls.length > 0 ? (
          <img src={room.imageUrls[0]} alt={`Phòng ${room.roomNumber}`} />
        ) : (
          <div className="tenant-room-card__image-placeholder">
            <HomeOutlined />
          </div>
        )}

        {/* Status Badge */}
        <div className={`tenant-room-card__status ${isAvailable ? 'status-available' : 'status-soon'}`}>
          {isAvailable ? 'Còn trống' : 'Sắp hết chỗ'}
        </div>

        {/* Favorite Button */}
        <button
          className={`tenant-room-card__favorite ${isFavorite ? 'is-active' : ''}`}
          onClick={handleFavorite}
          aria-label={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          <svg viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="tenant-room-card__content">
        <h3 className="tenant-room-card__title">{room.houseName || 'Nhà trọ'}</h3>
        <p className="tenant-room-card__room">P.{room.roomNumber}</p>
        <p className="tenant-room-card__address">
          <span style={{ fontSize: 14 }}>📍</span> {room.district || ''}{room.province ? `, ${room.province}` : ''}
        </p>

        <p className="tenant-room-card__price">
          {formatCurrency(room.monthlyRent)}đ/tháng
        </p>

        <div className="tenant-room-card__meta">
          <div className="tenant-room-card__meta-item">
            <span className="meta-icon">👥</span>
            <span>Tối đa {room.maxOccupants} người</span>
          </div>
          <div className="tenant-room-card__meta-item">
            <span className="meta-icon">📐</span>
            <span>{room.area}m²</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="tenant-room-card__amenities">
          {room.amenities?.slice(0, 4).map((amenity, index) => (
            <span key={index} className="amenity-chip">{amenity}</span>
          ))}
          {(room.amenities?.length ?? 0) > 4 && (
            <span className="amenity-chip amenity-chip--more">+{(room.amenities?.length ?? 0) - 4}</span>
          )}
        </div>

        {/* Footer */}
        <div className="tenant-room-card__footer">
          <div className="tenant-room-card__owner">
            <div className="owner-avatar">{room.ownerName?.charAt(0) || 'C'}</div>
            <span className="owner-name">{room.ownerName || 'Chủ trọ'}</span>
          </div>
          {room.ownerRating && (
            <div className="tenant-room-card__rating">
              <span className="rating-star">⭐</span>
              <span>{room.ownerRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="tenant-rooms-empty">
      <div className="tenant-rooms-empty__illustration">
        <svg viewBox="0 0 200 160" fill="none">
          <path d="M20 140L100 60L180 140" stroke="#F0EBE3" strokeWidth="8" strokeLinecap="round"/>
          <rect x="40" y="80" width="40" height="60" rx="4" fill="#F0EBE3"/>
          <rect x="80" y="100" width="40" height="40" rx="4" fill="#F0EBE3"/>
          <rect x="120" y="70" width="40" height="70" rx="4" fill="#F0EBE3"/>
          <circle cx="60" cy="110" r="8" fill="#F4845F" opacity="0.3"/>
          <circle cx="100" cy="120" r="8" fill="#F4845F" opacity="0.3"/>
          <circle cx="140" cy="105" r="8" fill="#F4845F" opacity="0.3"/>
        </svg>
      </div>
      <h3>Không tìm thấy phòng phù hợp</h3>
      <p>Hãy thử thay đổi bộ lọc hoặc khu vực tìm kiếm</p>
      <button className="btn-reset-filter" onClick={onReset}>Xóa bộ lọc</button>
    </div>
  )
}

function Pagination({
  page,
  totalPage,
  onChange
}: {
  page: number
  totalPage: number
  onChange: (p: number) => void
}) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPage <= maxVisible) {
      for (let i = 1; i <= totalPage; i++) pages.push(i)
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPage)
      } else if (page >= totalPage - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPage - 3; i <= totalPage; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPage)
      }
    }

    return pages
  }

  return (
    <nav className="tenant-pagination" aria-label="Phân trang">
      <button
        className="pagination-btn pagination-btn--prev"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>

      <div className="pagination-pages">
        {getPageNumbers().map((p, index) => (
          typeof p === 'number' ? (
            <button
              key={index}
              className={`pagination-page ${page === p ? 'is-active' : ''}`}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          ) : (
            <span key={index} className="pagination-ellipsis">...</span>
          )
        ))}
      </div>

      <button
        className="pagination-btn pagination-btn--next"
        disabled={page >= totalPage}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  )
}

export function TenantRoomsPage() {
  const [filters, setFilters] = useState<RoomFilters>(defaultFilters)

  // Fetch provinces
  const provinces = useQuery(['public-provinces'], fetchProvinceOptions, {
    staleTime: 1000 * 60 * 60 * 24,
  })

  // Fetch districts when province changes
  const districts = useQuery(
    ['public-districts', filters.province],
    () => fetchWardOptions(filters.province),
    {
      enabled: Boolean(filters.province),
      staleTime: 1000 * 60 * 60 * 24,
    }
  )

  // Build API filters
  const apiFilters: RoomSearchFilters = useMemo(() => ({
    keyword: filters.keyword,
    province: filters.province || undefined,
    district: filters.district || undefined,
    maxOccupants: filters.maxOccupants,
    monthlyRent: filters.monthlyRent,
    page: filters.page,
    pageSize: 12,
    sortBy: filters.sortBy,
  }), [filters])

  // Search rooms
  const { data, isLoading, isFetching, isError, error, refetch } = useRoomSearch(apiFilters)

  // Reset page when filters change (except page)
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }))
  }, [filters.keyword, filters.province, filters.district, filters.maxOccupants, filters.monthlyRent, filters.sortBy])

  // Handlers
  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, page: 1 }))
  }, [])

  const handleReset = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleNavigate = useCallback((roomId: string) => {
    window.location.href = `/rooms/${roomId}`
  }, [])

  // Update filter values
  const updateFilter = <K extends keyof RoomFilters>(key: K, value: RoomFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    if (key !== 'page') {
      setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }
  }

  return (
    <main className="tenant-rooms-page">
      {/* Section 1: Header */}
      <header className="tenant-rooms-header">
        <h1>Tìm phòng trọ</h1>
        <p>Tìm nơi ở phù hợp với nhu cầu của bạn</p>
      </header>

      {/* Section 2: Search & Filter */}
      <section className="tenant-rooms-search">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <label className="search-label">
            <SearchOutlined />
            Địa chỉ
          </label>
          <Input
            className="search-input"
            placeholder="Nhập địa chỉ, tên đường, khu vực..."
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword', e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
        </div>

        {/* Filter Row */}
        <div className="filter-row">
          {/* Province */}
          <div className="filter-item">
            <label className="filter-label">
              <span style={{ fontSize: 14 }}>📍</span>
              Tỉnh / Thành phố
            </label>
            <Select
              className="filter-select"
              placeholder="Tất cả"
              value={filters.province || undefined}
              onChange={(value) => {
                updateFilter('province', value || '')
                updateFilter('district', '')
              }}
              allowClear
              showSearch
              optionFilterProp="label"
              loading={provinces.isLoading}
              disabled={provinces.isLoading}
              options={provinces.data?.map(p => ({ value: p.value, label: p.label }))}
            />
          </div>

          {/* District */}
          <div className="filter-item">
            <label className="filter-label">
              <span style={{ fontSize: 14 }}>📍</span>
              Quận / Huyện
            </label>
            <Select
              className="filter-select"
              placeholder="Tất cả"
              value={filters.district || undefined}
              onChange={(value) => updateFilter('district', value || '')}
              allowClear
              showSearch
              optionFilterProp="label"
              loading={districts.isLoading}
              disabled={!filters.province || districts.isLoading}
              options={districts.data?.map(d => ({ value: d.value, label: d.label }))}
            />
          </div>

          {/* Occupants */}
          <div className="filter-item">
            <label className="filter-label">
              <UserOutlined />
              Số người ở
            </label>
            <Select
              className="filter-select"
              placeholder="Tất cả"
              value={filters.maxOccupants}
              onChange={(value) => updateFilter('maxOccupants', value)}
              options={occupantOptions}
            />
          </div>

          {/* Price */}
          <div className="filter-item">
            <label className="filter-label">
              <DollarOutlined />
              Giá tối đa
            </label>
            <Select
              className="filter-select"
              placeholder="Tất cả"
              value={filters.monthlyRent}
              onChange={(value) => updateFilter('monthlyRent', value)}
              options={priceOptions}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button className="btn-search" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
          </button>
          <button className="btn-reset" onClick={handleReset}>
            <FilterOutlined /> Đặt lại
          </button>
        </div>
      </section>

      {/* Section 3: Result Header */}
      <section className="tenant-rooms-result-header">
        <div className="result-count">
          <span className="result-label">Kết quả tìm kiếm</span>
          <span className="result-number">{data?.meta.total || 0} phòng phù hợp</span>
        </div>
        <div className="result-sort">
          <Select
            className="sort-select"
            value={filters.sortBy}
            onChange={(value) => updateFilter('sortBy', value)}
            options={sortOptions}
          />
        </div>
      </section>

      {/* Section 4: Room List */}
      <section className="tenant-rooms-grid">
        {isLoading ? (
          <>
            {Array.from({ length: 9 }, (_, index) => (
              <SkeletonCard key={index} />
            ))}
          </>
        ) : isError ? (
          <div className="tenant-rooms-error">
            <p>⚠ Không thể tải dữ liệu phòng</p>
            <p>{error?.message || 'Vui lòng kiểm tra API và thử lại.'}</p>
            <button className="btn-retry" onClick={() => refetch()}>Thử lại</button>
          </div>
        ) : data?.rooms.length === 0 ? (
          <EmptyState onReset={handleReset} />
        ) : (
          <div className={`room-grid-content ${isFetching ? 'is-fetching' : ''}`}>
            {data?.rooms.map((room) => (
              <RoomCard key={room.id} room={room} onNavigate={handleNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* Section 5: Pagination */}
      {data && data.meta.totalPage > 1 && (
        <section className="tenant-rooms-pagination">
          <Pagination
            page={filters.page}
            totalPage={data.meta.totalPage}
            onChange={handlePageChange}
          />
        </section>
      )}
    </main>
  )
}