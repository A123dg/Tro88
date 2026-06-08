import { useState, useEffect } from 'react'
import { Form, Input, Select, InputNumber, Card, Button, Progress, Flex, Row, Col, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useHousesQuery } from '../services/query'
import { useDeleteHouseMutation } from '../services/mutation'
import  useDebounce  from '../../../../shared/hooks/useDebounce'
import { PageHeader, Badge, statusVariant, houseStatusLabel, normalizeHouse, SkeletonGrid, EmptyState } from '../../shared'
import { useNotification } from '../../../../hooks/useNotification'

const { Title, Paragraph, Text } = Typography

export function HousesPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { ownerId?: string }
  const ownerId = params.ownerId || null

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [debouncedMinPrice, setDebouncedMinPrice] = useState<number | undefined>()
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState<number | undefined>()

  const debounce = useDebounce(300)
  const debouncePrice = useDebounce(500)

  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  const { showSuccessNotify, showErrorNotify } = useNotification()

  const deleteMutation = useDeleteHouseMutation({
    onSuccess: () => {
      showSuccessNotify('Xóa nhà trọ thành công')
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể xóa nhà trọ')
    }
  })

  const query = useHousesQuery({
    page: 1,
    pageSize: 100,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
    keyword: debouncedSearch || undefined,
  })

  const handleMinPriceChange = (val: number | null) => {
    const value = val === null ? undefined : val
    setMinPrice(value)
    debouncePrice(() => setDebouncedMinPrice(value))
  }

  const handleMaxPriceChange = (val: number | null) => {
    const value = val === null ? undefined : val
    setMaxPrice(value)
    debouncePrice(() => setDebouncedMaxPrice(value))
  }

  // No edit state required

  const filtered = (query.data?.items ?? [])
    .map((house: any) => normalizeHouse(house))
    .filter((house) => (
      house.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      (status === 'all' || house.status === status)
    ))

  // No edit handlers required

  return (
    <div className="page">
      <PageHeader
        title="Nhà trọ"
        subtitle="Quản lý danh sách nhà, ảnh đại diện và trạng thái duyệt."
        action={
          !isTenant ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: '/houses/create' as any })}
              style={{ background: '#f4845f', borderColor: '#f4845f' }}
            >
              Thêm nhà trọ
            </Button>
          ) : undefined
        }
      />

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
        <Input.Search
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            debounce(() => setDebouncedSearch(event.target.value))
          }}
          placeholder="Tìm nhà trọ"
          enterButton
          style={{ width: 220 }}
        />
        {isTenant ? (
          <>
            <InputNumber
              placeholder="Giá từ"
              value={minPrice}
              onChange={handleMinPriceChange}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
              style={{ width: 150 }}
            />
            <InputNumber
              placeholder="Đến giá"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
              style={{ width: 150 }}
            />
          </>
        ) : (
          <Select
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'PendingApproval', label: 'Chờ duyệt' },
              { value: 'Active', label: 'Hoạt động' },
              { value: 'Inactive', label: 'Không hoạt động' },
            ]}
            style={{ width: 180 }}
          />
        )}
      </div>

      {query.isLoading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState title="Chưa có nhà trọ" description="Thêm nhà trọ đầu tiên để bắt đầu quản lý phòng." />
      ) : (
        <Row gutter={[24, 24]}>
          {filtered.map((house) => {
            const percent = house.totalRooms > 0 ? Math.round((house.occupiedRooms / house.totalRooms) * 100) : 0
            const thumbnailUrl = house.mediaUrls[0]
            return (
              <Col xs={24} sm={12} md={8} key={house.id}>
                <Card
                  hoverable
                  cover={
                    thumbnailUrl ? (
                      <img
                        alt={house.name}
                        src={thumbnailUrl}
                        style={{ height: 200, objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                      />
                    ) : (
                      <div
                        style={{
                          height: 200,
                          background: '#fdf0eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '16px 16px 0 0',
                        }}
                      >
                        <HomeOutlined style={{ fontSize: '48px', color: '#f4845f' }} />
                      </div>
                    )
                  }
                  actions={[
                    <Button type="link" onClick={() => navigate({ to: `/houses/detail/${house.id}` as any })}>
                      Xem chi tiết
                    </Button>,
                    ...(!isTenant
                      ? [
                        <Button type="text" icon={<EditOutlined />} onClick={() => navigate({ to: `/houses/detail/${house.id}/edit` as any })}>
                          Sửa
                        </Button>,
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          loading={deleteMutation.isLoading}
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa nhà trọ "${house.name}"?`)) {
                              deleteMutation.mutate(house.id)
                            }
                          }}
                        >
                          Xóa
                        </Button>,
                      ]
                      : []),
                  ]}
                  style={{ borderRadius: '16px', overflow: 'hidden' }}
                >
                  <Card.Meta
                    title={<Title level={4} style={{ margin: 0 }}>{house.name}</Title>}
                    description={
                      <Flex vertical gap="4px">
                        <Paragraph style={{ margin: 0, color: '#6b6b6b' }}>
                          <EnvironmentOutlined /> {house.address}
                        </Paragraph>
                        <div style={{ marginTop: '8px' }}>
                          <Badge variant={statusVariant(house.status as any)}>
                            {houseStatusLabel(house.status, house.isActive)}
                          </Badge>
                        </div>
                        <Text style={{ marginTop: '8px', display: 'block' }}>
                          {house.totalRooms} phòng • {house.occupiedRooms} đang thuê
                        </Text>
                        <Progress percent={percent} strokeColor="#f4845f" trailColor="#fdf0eb" style={{ marginTop: '8px' }} />
                      </Flex>
                    }
                  />
                </Card>
              </Col>
            )
          })}
        </Row>
      )}

    </div>
  )
}
