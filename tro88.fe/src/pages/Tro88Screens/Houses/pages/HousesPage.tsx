import { useState, useEffect } from 'react'
import { Form, Input, Select, InputNumber, Card, Button, Progress, Flex, Row, Col, Typography } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EnvironmentOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useHousesQuery, useProvincesQuery, useWardsQuery, useHouseDetailQuery } from '../services/query'
import { useUpdateHouseMutation } from '../services/mutation'
import  useDebounce  from '../../../../shared/hooks/useDebounce'
import { PageHeader, Badge, statusVariant, houseStatusLabel, normalizeHouse, SkeletonGrid, EmptyState } from '../../shared'
import ModalForm from '../../../../shared/components/modal-form/ModalForm'

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

  const [editingHouseId, setEditingHouseId] = useState<string | null>(null)
  const [provinceValue, setProvinceValue] = useState<string | undefined>()
  const [wardValue, setWardValue] = useState<string | undefined>()
  const [editForm] = Form.useForm()

  const isTenant = localStorage.getItem('authRole') === 'Tenant'

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

  const provinces = useProvincesQuery()
  const wards = useWardsQuery(provinceValue)
  const detail = useHouseDetailQuery(editingHouseId, Boolean(editingHouseId))

  const saveEdit = useUpdateHouseMutation({
    onSuccess: () => {
      setEditingHouseId(null)
      editForm.resetFields()
      setProvinceValue(undefined)
      setWardValue(undefined)
    }
  })

  const filtered = (query.data?.items ?? [])
    .map((house: any) => normalizeHouse(house))
    .filter((house) => (
      house.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
      (status === 'all' || house.status === status)
    ))

  useEffect(() => {
    if (!detail.data) return
    editForm.setFieldsValue({
      name: detail.data.name,
      address: detail.data.address,
      province: detail.data.tinhThanhOption?.id ?? detail.data.province ?? undefined,
      district: detail.data.xaPhuongOption?.id ?? detail.data.district ?? undefined,
      description: detail.data.description ?? '',
    })
    setProvinceValue(detail.data.tinhThanhOption?.id ?? detail.data.province ?? undefined)
    setWardValue(detail.data.xaPhuongOption?.id ?? detail.data.district ?? undefined)
  }, [detail.data, editForm])

  const closeEditModal = () => {
    setEditingHouseId(null)
    editForm.resetFields()
    setProvinceValue(undefined)
    setWardValue(undefined)
  }

  const submitEditModal = async () => {
    if (!editingHouseId) return
    const values = await editForm.validateFields()
    saveEdit.mutate({
      id: editingHouseId,
      name: String(values.name ?? ''),
      address: String(values.address ?? ''),
      province: provinceValue,
      district: wardValue,
      description: values.description,
    })
  }

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
                        <Button type="text" icon={<EditOutlined />} onClick={() => setEditingHouseId(house.id)}>
                          Sửa
                        </Button>,
                        <Button type="text" danger icon={<DeleteOutlined />}>
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

      <ModalForm
        open={Boolean(editingHouseId)}
        title="Sửa nhà trọ"
        form={editForm}
        formItems={[
          {
            label: 'Tên nhà trọ',
            name: 'name',
            component: <Input placeholder="Tên nhà trọ" />,
            rules: [{ required: true, message: 'Vui lòng nhập tên nhà trọ' }],
            span: 24,
          },
          {
            label: 'Địa chỉ',
            name: 'address',
            component: <Input.TextArea rows={3} placeholder="Địa chỉ" />,
            rules: [{ required: true, message: 'Vui lòng nhập địa chỉ' }],
            span: 24,
          },
          {
            label: 'Tỉnh/Thành phố',
            name: 'province',
            component: (
              <Select
                style={{ width: '100%' }}
                showSearch
                allowClear
                placeholder={provinces.isLoading ? 'Đang tải tỉnh...' : 'Chọn tỉnh'}
                optionFilterProp="label"
                loading={provinces.isLoading}
                disabled={provinces.isLoading}
                value={provinceValue}
                onChange={(val) => {
                  setProvinceValue(val)
                  setWardValue(undefined)
                }}
                options={[
                  ...(provinces.data ?? []).map((p) => ({ value: p.value, label: p.label })),
                  ...(provinceValue && detail.data?.tinhThanhOption && !(provinces.data ?? []).find(p => p.value === provinceValue)
                    ? [{ value: provinceValue, label: detail.data.tinhThanhOption.name }]
                    : []
                  ),
                ]}
              />
            ),
            span: 12,
          },
          {
            label: 'Xã/Phường',
            name: 'district',
            component: (
              <Select
                style={{ width: '100%' }}
                showSearch
                allowClear
                placeholder={!provinceValue ? 'Chọn tỉnh trước' : wards.isLoading ? 'Đang tải xã/phường...' : 'Chọn xã/phường'}
                optionFilterProp="label"
                loading={wards.isLoading}
                disabled={!provinceValue || wards.isLoading}
                value={wardValue}
                onChange={(val) => setWardValue(val)}
                options={[
                  ...(wards.data ?? []).map((w) => ({ value: w.value, label: w.label })),
                  ...(wardValue && detail.data?.xaPhuongOption && !(wards.data ?? []).find(w => w.value === wardValue)
                    ? [{ value: wardValue, label: detail.data.xaPhuongOption.name }]
                    : []
                  ),
                ]}
              />
            ),
            span: 12,
          },
          {
            label: 'Mô tả',
            name: 'description',
            component: <Input.TextArea rows={4} placeholder="Mô tả" />,
            span: 24,
          },
        ]}
        isLoadingGetDetail={detail.isLoading}
        loading={saveEdit.isLoading}
        onCancel={closeEditModal}
        onOk={submitEditModal}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        layout="vertical"
      />
    </div>
  )
}
