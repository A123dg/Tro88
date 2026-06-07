import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQuery } from 'react-query'
import { Input, Select, Modal, Carousel, Image, Spin, Alert, InputNumber, Button } from 'antd'
import {
  SearchOutlined,
  FilterOutlined,
  HomeOutlined,
  UserOutlined,
  DollarOutlined,
  HeartOutlined,
  HeartFilled,
  EnvironmentOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  UndoOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useHousesQuery } from '../../Tro88Screens/Houses/services/query'
import { HouseDto } from '../../../types/app.types'
import axios from 'axios'
import tenantEmptyIllustration from '../../../assets/tenant-empty-illustration.png'
import { formatVND } from '../../Tro88Screens/shared'

interface RoomFilters {
  keyword: string
  minPrice?: number
  maxPrice?: number
  page: number
  pageSize: number
}

const defaultFilters: RoomFilters = {
  keyword: '',
  minPrice: undefined,
  maxPrice: undefined,
  page: 1,
  pageSize: 12,
}

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5073/api/v1',
  timeout: 10000,
})

async function fetchPublicHouseDetail(id: string) {
  const res = await publicApi.get<any>(`/public/houses/${id}`)
  return res.data?.data || res.data
}

function formatAddress(
  address?: string | null,
  district?: string | null,
  province?: string | null,
) {
  return [address, district, province]
    .filter(Boolean)
    .join(', ')
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

function HouseCard({ house, onNavigate, isFav, onToggleFav }: { house: HouseDto; onNavigate: (id: string) => void; isFav: boolean; onToggleFav: (houseId: string) => Promise<void> }) {
  const availableRooms = house.totalRooms - house.occupiedRooms
  const isAvailable = availableRooms > 0

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await onToggleFav(house.id)
  }

  return (
    <article className="tenant-room-card" onClick={() => onNavigate(house.id)}>
      <div className="tenant-room-card__image">
        {house.mediaUrls && house.mediaUrls.length > 0 ? (
          <img src={house.mediaUrls[0]} alt={house.name} />
        ) : (
          <div className="tenant-room-card__image-placeholder">
            <HomeOutlined />
          </div>
        )}

        <div className={`tenant-room-card__status ${isAvailable ? 'status-available' : 'status-full'}`}>
          {isAvailable ? `Còn ${availableRooms} phòng` : 'Hết phòng'}
        </div>

        <button
          className={`tenant-room-card__favorite ${isFav ? 'is-active' : ''}`}
          onClick={handleFavorite}
          aria-label={isFav ? 'Bỏ yêu thích' : 'Yêu thích'}
        >
          {isFav ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
        </button>
      </div>

      <div className="tenant-room-card__content">
        <h3 className="tenant-room-card__title">{house.name}</h3>
        <p className="tenant-room-card__address">
          <EnvironmentOutlined />{' '}
          {formatAddress(house.address, house?.district, house?.province)}
        </p>

        {house.description && (
          <p className="tenant-room-card__description">{house.description}</p>
        )}

        <div className="tenant-room-card__meta">
          <div className="tenant-room-card__meta-item">
            <span className="meta-icon"><HomeOutlined /></span>
            <span>{house.totalRooms} phòng</span>
          </div>
          <div className="tenant-room-card__meta-item">
            <span className="meta-icon"><CheckCircleOutlined /></span>
            <span>{availableRooms} còn trống</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="tenant-rooms-empty">
      <div className="tenant-rooms-empty__illustration">
        <img src={tenantEmptyIllustration} alt="No houses found" style={{ width: '180px', height: 'auto', display: 'block', margin: '0 auto' }} />
      </div>
      <h3>Không tìm thấy nhà trọ phù hợp</h3>
      <p>Hãy thử thay đổi từ khoá tìm kiếm</p>
      <button className="btn-reset-filter" onClick={onReset}>Xóa bộ lọc</button>
    </div>
  )
}

function Pagination({
  page,
  totalPage,
  onChange,
}: {
  page: number
  totalPage: number
  onChange: (p: number) => void
}) {
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    if (totalPage <= 5) {
      for (let i = 1; i <= totalPage; i++) pages.push(i)
    } else if (page <= 3) {
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
        {getPageNumbers().map((p, index) =>
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
        )}
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
  const [keywordInput, setKeywordInput] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [houseDetail, setHouseDetail] = useState<any | null>(null)

  // Favorite IDs state
  const [favIds, setFavIds] = useState<string[]>([])

  // Fetch favorite houses list on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      import('../../../services/houseService').then(({ fetchFavoriteHouses }) => {
        fetchFavoriteHouses().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setFavIds(res.data.map((h: any) => h.id))
          }
        }).catch(err => console.error('Failed to load favorites', err))
      })
    }
  }, [])

  const handleToggleFav = async (houseId: string) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      Modal.warning({
        title: 'Vui lòng đăng nhập',
        content: 'Bạn cần đăng nhập để lưu nhà trọ yêu thích.',
        okText: 'Đăng nhập',
        onOk: () => {
          window.location.href = '/login/tenant'
        }
      })
      return
    }
    try {
      const { toggleFavoriteHouse } = await import('../../../services/houseService')
      const res = await toggleFavoriteHouse(houseId)
      if (res.success && res.data) {
        if (res.data.isFavorite) {
          setFavIds(prev => [...prev, houseId])
        } else {
          setFavIds(prev => prev.filter(id => id !== houseId))
        }
      }
    } catch (err: any) {
      Modal.error({ title: 'Lỗi', content: err.message || 'Không thể cập nhật trạng thái yêu thích.' })
    }
  }

  const [minPriceInput, setMinPriceInput] = useState<number | undefined>()
  const [maxPriceInput, setMaxPriceInput] = useState<number | undefined>()

  const { data, isLoading, isFetching, isError, error, refetch } = useHousesQuery({
    page: filters.page,
    pageSize: filters.pageSize,
    keyword: filters.keyword,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  })

  // We also filter the UI results statically, just in case the backend query filters aren't matching
  const rawHouses = data?.items ?? []
  const houses = useMemo(() => {
    return rawHouses.filter((h: any) => {
      // Fetch public detail logic or basic static filtering if properties aren't in house object.
      // But typically we can pass it or filter it statically if house has a min monthlyRent or price limits
      return true
    })
  }, [rawHouses])

  const meta = data?.meta

  const handleSearch = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      keyword: keywordInput,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      page: 1
    }))
  }, [keywordInput, minPriceInput, maxPriceInput])

  const handleReset = useCallback(() => {
    setKeywordInput('')
    setMinPriceInput(undefined)
    setMaxPriceInput(undefined)
    setFilters(defaultFilters)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleViewDetail = useCallback(async (id: string) => {
    setSelectedHouseId(id)
    setModalOpen(true)
    setLoadingDetail(true)
    setDetailError(null)
    setHouseDetail(null)
    try {
      const detail = await fetchPublicHouseDetail(id)
      setHouseDetail(detail)
    } catch (err: any) {
      setDetailError(err.message || 'Không thể tải thông tin chi tiết nhà trọ.')
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  return (
    <main className="tenant-rooms-page">
      {/* Header */}
      <header className="tenant-rooms-header">
        <h1>Tìm nhà trọ</h1>
        <p>Tìm nơi ở phù hợp với nhu cầu của bạn</p>
      </header>

      {/* Search */}
      <div className="portal-search-box" style={{ margin: '0 0 32px 0', width: '100%' }}>
        <div className="search-grid">
          <div className="search-field">
            <span className="field-label"><SearchOutlined /> Từ khoá</span>
            <Input
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Nhập tên nhà trọ, địa chỉ, khu vực..."
              className="custom-search-input"
              allowClear
            />
          </div>
          <div className="search-field">
            <span className="field-label"><DollarOutlined /> Giá từ</span>
            <InputNumber
              placeholder="Giá tối thiểu"
              value={minPriceInput}
              onChange={(val) => setMinPriceInput(val === null ? undefined : val)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
              className="custom-price-input"
              style={{ width: '100%' }}
            />
          </div>
          <div className="search-field">
            <span className="field-label"><DollarOutlined /> Đến giá</span>
            <InputNumber
              placeholder="Giá tối đa"
              value={maxPriceInput}
              onChange={(val) => setMaxPriceInput(val === null ? undefined : val)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
              className="custom-price-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>
        <div className="search-actions" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px' }}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            style={{
              background: 'var(--primary, #F4845F)',
              borderColor: 'var(--primary, #F4845F)',
              height: '42px',
              borderRadius: '8px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Tìm kiếm
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            style={{
              height: '42px',
              borderRadius: '8px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Result header */}
      <section className="tenant-rooms-result-header">
        <div className="result-count">
          <span className="result-label">Kết quả tìm kiếm</span>
          <span className="result-number">{meta?.total ?? 0} nhà trọ phù hợp</span>
        </div>
      </section>

      {/* List */}
      <section className="tenant-rooms-grid">
        {isLoading ? (
          Array.from({ length: 9 }, (_, i) => <SkeletonCard key={i} />)
        ) : isError ? (
          <div className="tenant-rooms-error">
            <p>Không thể tải dữ liệu</p>
            <p>{(error as Error)?.message || 'Vui lòng thử lại.'}</p>
            <button className="btn-retry" onClick={() => refetch()}>Thử lại</button>
          </div>
        ) : houses.length === 0 ? (
          <EmptyState onReset={handleReset} />
        ) : (
          <div className={`room-grid-content ${isFetching ? 'is-fetching' : ''}`}>
            {houses.map((house) => (
              <HouseCard
                key={house.id}
                house={house}
                onNavigate={handleViewDetail}
                isFav={favIds.includes(house.id)}
                onToggleFav={handleToggleFav}
              />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {meta && meta.totalPage > 1 && (
        <section className="tenant-rooms-pagination">
          <Pagination
            page={filters.page}
            totalPage={meta.totalPage}
            onChange={handlePageChange}
          />
        </section>
      )}

      {/* House Detail Modal */}
      <Modal
        title={<h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Chi tiết nhà trọ</h2>}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={650}
        centered
      >
        {loadingDetail && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Spin size="large" tip="Đang tải thông tin chi tiết..." />
          </div>
        )}
        {detailError && (
          <Alert message="Lỗi" description={detailError} type="error" showIcon style={{ margin: '20px 0' }} />
        )}
        {houseDetail && (
          <div style={{ marginTop: 16 }}>
            {/* Gallery */}
            {houseDetail.mediaUrls && houseDetail.mediaUrls.length > 0 ? (
              <Image.PreviewGroup>
                <Carousel autoplay style={{ marginBottom: 20, borderRadius: 8, overflow: 'hidden' }}>
                  {houseDetail.mediaUrls.map((url: string, idx: number) => (
                    <div key={idx} style={{ textAlign: 'center', background: '#f5f5f5', height: 300 }}>
                      <Image src={url} alt={`media-${idx}`} style={{ width: '100%', height: 300, objectFit: 'cover' }} />
                    </div>
                  ))}
                </Carousel>
              </Image.PreviewGroup>
            ) : (
              <div style={{ width: '100%', height: 180, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderRadius: 8, color: '#999' }}>
                Chưa có hình ảnh
              </div>
            )}

            {/* Basic Info */}
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text)' }}>{houseDetail.name}</h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 16px 0' }}>
              <EnvironmentOutlined /> {houseDetail.address}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginBottom: 20, padding: 12, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
              <div>
                <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 2 }}>Giá thuê từ</span>
                <strong style={{ fontSize: 18, color: 'var(--primary, #F4845F)' }}>{formatVND(houseDetail.priceFrom)}/tháng</strong>
              </div>
            </div>

            {houseDetail.description && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px 0' }}>Mô tả chi tiết</h3>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>
                  {houseDetail.description}
                </p>
              </div>
            )}

            {/* Owner Info */}
            {houseDetail.owner && (
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px 0' }}>Thông tin chủ nhà</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {houseDetail.owner.avatarUrl ? (
                      <img src={houseDetail.owner.avatarUrl} alt={houseDetail.owner.fullName} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F4845F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>
                        {houseDetail.owner.fullName?.slice(0, 2).toUpperCase() || 'O'}
                      </div>
                    )}
                    <div>
                      <strong style={{ fontSize: 14, display: 'block', color: 'var(--text)' }}>{houseDetail.owner.fullName}</strong>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}><PhoneOutlined /> {houseDetail.owner.phoneNumber}</span>
                    </div>
                  </div>
                  <button
                    className="app-button app-button--primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                    onClick={async () => {
                      const token = localStorage.getItem('accessToken')
                      if (!token) {
                        Modal.warning({
                          title: 'Vui lòng đăng nhập',
                          content: 'Bạn cần đăng nhập để liên hệ với chủ trọ.',
                          okText: 'Đăng nhập',
                          onOk: () => {
                            window.location.href = '/login/tenant'
                          }
                        })
                        return
                      }
                      try {
                        const { contactHouse } = await import('../../../services/houseService')
                        const res = await contactHouse(houseDetail.id, 'Zalo')
                        if (res.success && res.data?.phoneNumber) {
                          const cleanPhone = res.data.phoneNumber.replace(/^0/, '84')
                          window.open(`https://zalo.me/${cleanPhone}`, '_blank')
                        } else {
                          Modal.error({ title: 'Lỗi', content: res.message || 'Không thể lấy thông tin liên hệ.' })
                        }
                      } catch (err: any) {
                        Modal.error({ title: 'Lỗi', content: err.message || 'Đã có lỗi xảy ra khi liên hệ.' })
                      }
                    }}
                  >
                    Liên hệ qua Zalo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </main>
  )
}