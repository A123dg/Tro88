import { useState } from 'react'
import { useQuery } from 'react-query'
import { InputNumber, Input, Modal, Carousel, Image, Spin, Alert, Button } from 'antd'
import axios from 'axios'
import portalIllustration from '../../assets/portal-illustration.png'
import {
  Badge, Card, EmptyState, SkeletonGrid,
  Status, houseStatusLabel, houses,
  normalizeHouse, statusVariant, formatVND,
} from '../Tro88Screens/shared'
import useDebounce from '../../shared/hooks/useDebounce'
import {
  SearchOutlined,
  DollarOutlined,
  UndoOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

// Gọi API public, không đính kèm token để tránh 401 redirect
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5073/api/v1',
  timeout: 10000,
})

async function fetchPublicHouses(minPrice?: number, maxPrice?: number) {
  const params = new URLSearchParams()
  params.append('status', 'Active')
  params.append('pageSize', '100')
  if (minPrice !== undefined) params.append('minPrice', String(minPrice))
  if (maxPrice !== undefined) params.append('maxPrice', String(maxPrice))
  const qs = params.toString()
  const res = await publicApi.get<any>(`/Houses${qs ? `?${qs}` : ''}`)
  const raw = res.data
  return Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : (houses as any[])
}

async function fetchPublicHouseDetail(id: string) {
  const res = await publicApi.get<any>(`/public/houses/${id}`)
  return res.data?.data || res.data
}

// Redirect đúng theo role đã đăng nhập
function getHome() {
  const role = localStorage.getItem('authRole')
  if (role === 'Admin') return '/admin'
  if (role === 'Tenant') return '/my/rooms'
  if (role === 'Owner') {
    const id = localStorage.getItem('authUserId')
    return id ? `/houses/${id}` : '/dashboard'
  }
  return null // chưa đăng nhập
}

function NavLinks() {
  const home = getHome()
  if (home) {
    // Đã đăng nhập: hiện nút vào trang chính
    return (
      <div>
        <a className="app-button app-button--primary" href={home}>Vào trang của tôi</a>
      </div>
    )
  }
  return (
    <div>
      <a href="/login/owner">Owner</a>
      <a href="/login/tenant">Tenant</a>
    </div>
  )
}

function HouseListSection({ onViewDetail }: { onViewDetail: (id: string, e: React.MouseEvent) => void }) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [debouncedMinPrice, setDebouncedMinPrice] = useState<number | undefined>()
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<number | undefined>()

  const debounce = useDebounce(300)
  const debouncePrice = useDebounce(500)

  const query = useQuery(
    ['portal-houses', debouncedMinPrice, debouncedMaxPrice],
    () => fetchPublicHouses(debouncedMinPrice, debouncedMaxPrice),
    { staleTime: 1000 * 60 }
  )

  const filtered = (query.data ?? [])
    .map(normalizeHouse)
    .filter((house: any) =>
      house.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      house.status === 'Active'
    )

  return (
    <section className="portal-house-section">
      <div className="portal-house-section__header">
        <h2>Nhà trọ đang cho thuê</h2>
        <p>Khám phá các nhà trọ đang hoạt động, xem phòng và liên hệ chủ trọ.</p>
      </div>

      <div className="portal-search-box">
        <div className="search-grid">
          <div className="search-field">
            <span className="field-label"><SearchOutlined /> Từ khoá</span>
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                debounce(() => setDebouncedSearch(e.target.value))
              }}
              placeholder="Nhập tên nhà trọ, địa chỉ, khu vực..."
              className="custom-search-input"
              allowClear
            />
          </div>
          <div className="search-field">
            <span className="field-label"><DollarOutlined /> Giá từ</span>
            <InputNumber
              placeholder="Giá tối thiểu"
              value={minPrice}
              onChange={(val) => {
                const value = val === null ? undefined : val
                setMinPrice(value)
                debouncePrice(() => setDebouncedMinPrice(value))
              }}
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
              value={maxPrice}
              onChange={(val) => {
                const value = val === null ? undefined : val
                setMaxPrice(value)
                debouncePrice(() => setDebouncedMaxPrice(value))
              }}
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
            onClick={() => {
              setDebouncedSearch(search)
              setDebouncedMinPrice(minPrice)
              setDebouncedMaxPrice(maxPrice)
            }}
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
            onClick={() => {
              setSearch('')
              setMinPrice(undefined)
              setMaxPrice(undefined)
              setDebouncedSearch('')
              setDebouncedMinPrice(undefined)
              setDebouncedMaxPrice(undefined)
            }}
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

      <div className="portal-house-section__body">
        {query.isLoading ? (
          <SkeletonGrid />
        ) : filtered.length === 0 ? (
          <EmptyState title="Chưa có nhà trọ" description="Hiện chưa có nhà trọ nào đang cho thuê phù hợp với tìm kiếm." />
        ) : (
          <div className="grid-3">
            {filtered.map((house: any) => {
              const percent = house.totalRooms > 0
                ? Math.round((house.occupiedRooms / house.totalRooms) * 100)
                : 0
              const thumbnailUrl = house.mediaUrls[0]
              return (
                <Card key={house.id} className="house-card">
                  {thumbnailUrl
                    ? <img className="thumbnail" src={thumbnailUrl} alt={house.name} />
                    : <div className="thumbnail" />
                  }
                  <h2>{house.name}</h2>
                  <p>{house.address}</p>
                  <Badge variant={statusVariant(house.status as Status)}>
                    {houseStatusLabel(house.status, house.isActive)}
                  </Badge>
                  <p>{house.totalRooms} phòng • {house.occupiedRooms} đang thuê</p>
                  <div className="progress"><span style={{ width: `${percent}%` }} /></div>
                  <div className="actions">
                    <a className="app-button app-button--outline" href="#" onClick={(e) => onViewDetail(house.id, e)}>
                      Xem chi tiết
                    </a>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export function PortalPage() {
  const home = getHome()
  const ownerHref = home ?? '/login/owner'
  const tenantHref = home ?? '/login/tenant'

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [houseDetail, setHouseDetail] = useState<any | null>(null)

  const handleViewDetail = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
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
  }

  return (
    <main className="portal-page">
      <nav className="portal-nav">
        <a className="brand" href="/">
          <span>88</span>
          <strong>Tro88</strong>
        </a>
        <NavLinks />
      </nav>

      <div className="content-body">
        <section className="portal-hero">
          <div className="portal-hero__copy">
            <span className="portal-kicker">Quản lý nhà trọ trên một nền tảng</span>
            <h1>Tro88</h1>
            <p>
              Theo dõi nhà, phòng, hợp đồng, hóa đơn và phản ánh bảo trì trong một trải nghiệm rõ ràng cho cả chủ trọ và người thuê.
            </p>
            <div className="portal-actions">
              <a className="app-button app-button--primary" href={ownerHref}>Đăng nhập với vai trò chủ trọ</a>
              <a className="app-button app-button--outline" href={tenantHref}>Đăng nhập với vai trò người thuê</a>
            </div>
          </div>
          <figure className="portal-illustration">
            <img src={portalIllustration} alt="Minh họa quản lý nhà trọ Tro88" />
          </figure>
        </section>

        <section className="portal-feature-strip">
          <article>
            <strong>Chủ trọ</strong>
            <p>Duyệt nhà, quản lý phòng, hóa đơn và vận hành.</p>
          </article>
          <article>
            <strong>Người thuê</strong>
            <p>Xem hóa đơn, dịch vụ và gửi phản ánh bảo trì.</p>
          </article>
        </section>

        <HouseListSection onViewDetail={handleViewDetail} />
      </div>


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
                        const { contactHouse } = await import('../../services/houseService')
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
