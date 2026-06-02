import { useRouterState } from '@tanstack/react-router'
import { UploadOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, InputNumber, Select } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse } from '../../../services/houseService'
import { HouseRoomsTable } from './components/HouseRoomsTable'
import {
  AreaChartLite, Badge, Button, Card, DataTable, EmptyState, FormShell, Illustration, Link, navigateTo,
  MaintenanceCard, MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'
import ModalForm from '../../../shared/components/modal-form/ModalForm'

export function HousesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [editingHouseId, setEditingHouseId] = useState<string | null>(null)
  const [provinceValue, setProvinceValue] = useState<string | undefined>()
  const [wardValue, setWardValue] = useState<string | undefined>()
  const [editForm] = Form.useForm()

  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  const ownerId = pathParts[0] === 'houses' && pathParts[1] && pathParts[1] !== 'create' && pathParts[1] !== 'detail' ? pathParts[1] : null

  const query = useQuery(QK.houses, () => read(ownerId ? `/Houses/owner/${ownerId}` : '/Houses', houses))

  // Fetch provinces for dropdown
  const provinces = useQuery(['public-provinces'], fetchProvinceOptions, {
    staleTime: 1000 * 60 * 60 * 24,
  })

  // Fetch wards when province changes
  const wards = useQuery(
    ['public-wards', provinceValue],
    () => fetchWardOptions(provinceValue ?? ''),
    {
      enabled: Boolean(provinceValue),
      staleTime: 1000 * 60 * 60 * 24,
    }
  )

  const detail = useQuery(
    ['house-detail', editingHouseId],
    () => fetchHouseDetail(editingHouseId ?? ''),
    {
      enabled: Boolean(editingHouseId),
      retry: 1,
    },
  )
  const saveEdit = useMutation(updateHouse, {
    onSuccess: () => {
      queryClient.invalidateQueries(QK.houses)
      queryClient.invalidateQueries(['house-detail', editingHouseId])
      setEditingHouseId(null)
      editForm.resetFields()
      setProvinceValue(undefined)
      setWardValue(undefined)
    },
  })
  const filtered = (query.data ?? [])
    .map(normalizeHouse)
    .filter((house) => (
      house.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === 'all' || house.status === status)
    ))

  useEffect(() => {
    if (!detail.data) return
    // Set form values and dropdown values
    editForm.setFieldsValue({
      name: detail.data.name,
      address: detail.data.address,
      province: detail.data.tinhThanhOption?.id ?? detail.data.province ?? undefined,
      district: detail.data.xaPhuongOption?.id ?? detail.data.district ?? undefined,
      description: detail.data.description ?? '',
    })
    // Set dropdown values for display
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
    <main className="page">
      <PageHeader title="Nhà trọ" subtitle="Quản lý danh sách nhà, ảnh đại diện và trạng thái duyệt." action={!isTenant ? <Link className="app-button app-button--primary" to="/houses/create">+ Thêm nhà trọ</Link> : undefined} />
      <div className="filter-bar"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nhà trọ" /><Select value={status} onChange={setStatus} options={[{ value: 'all', label: 'Tất cả' }, { value: 'PendingApproval', label: 'Chờ duyệt' }, { value: 'Active', label: 'Hoạt động' }, { value: 'Inactive', label: 'Không hoạt động' }]} /></div>
      {query.isLoading ? <SkeletonGrid /> : filtered.length === 0 ? <EmptyState title="Chưa có nhà trọ" description="Thêm nhà trọ đầu tiên để bắt đầu quản lý phòng." /> : (
        <div className="grid-3">
          {filtered.map((house) => {
            const percent = house.totalRooms > 0 ? Math.round((house.occupiedRooms / house.totalRooms) * 100) : 0
            const thumbnailUrl = house.mediaUrls[0]
            return (
              <Card key={house.id} className="house-card">
                {thumbnailUrl ? <img className="thumbnail" src={thumbnailUrl} alt={house.name} /> : <div className="thumbnail" />}
                <h2>{house.name}</h2><p>{house.address}</p>
                <Badge variant={statusVariant(house.status as Status)}>{houseStatusLabel(house.status, house.isActive)}</Badge>
                <p>{house.totalRooms} phòng • {house.occupiedRooms} đang thuê</p>
                <div className="progress"><span style={{ width: `${percent}%` }} /></div>
                <div className="actions">
                  <Link className="app-button app-button--outline" to={`/houses/detail/${house.id}`}>Xem chi tiết</Link>
                  {!isTenant && (
                    <>
                      <Button variant="ghost" onClick={() => setEditingHouseId(house.id)}>Sửa</Button>
                      <Button variant="danger">Xóa</Button>
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
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
                  // Thêm option từ API nếu chưa có trong list
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
    </main>
  )
}

export function HouseFormPage() {
  const isEdit = window.location.pathname.endsWith('/edit')
  const houseId = isEdit ? pageId('h1') : null
  const [provinceValue, setProvinceValue] = useState<string | undefined>()
  const [wardValue, setWardValue] = useState<string | undefined>()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [submitError, setSubmitError] = useState('')
  const selectedSize = selectedFiles.reduce((totalSize, file) => totalSize + file.size, 0)
  const isUploadTooLarge = selectedSize > 25 * 1024 * 1024
  const previews = useMemo(
    () => selectedFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    })),
    [selectedFiles],
  )
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews])

  // Fetch provinces for dropdown
  const provinces = useQuery(['public-provinces'], fetchProvinceOptions, {
    staleTime: 1000 * 60 * 60 * 24,
  })

  // Fetch wards when province changes
  const wards = useQuery(
    ['public-wards', provinceValue],
    () => fetchWardOptions(provinceValue ?? ''),
    {
      enabled: Boolean(provinceValue),
      staleTime: 1000 * 60 * 60 * 24,
    }
  )

  // Fetch house detail when editing
  const houseDetail = useQuery(
    ['house-detail', houseId],
    () => fetchHouseDetail(houseId!),
    {
      enabled: Boolean(houseId),
      staleTime: 1000 * 60 * 5,
    }
  )

  // Set initial values from fetched data
  useEffect(() => {
    if (!houseDetail.data) return
    // Set from tinhThanhOption and xaPhuongOption if available
    if (houseDetail.data.tinhThanhOption) {
      setProvinceValue(houseDetail.data.tinhThanhOption.id)
    }
    if (houseDetail.data.xaPhuongOption) {
      setWardValue(houseDetail.data.xaPhuongOption.id)
    }
  }, [houseDetail.data])

  // Use updateHouse for edit, createHouse for add
  const save = useMutation((payload: any) => (isEdit ? updateHouse(payload) : createHouse(payload)), {
    onSuccess: () => {
      const ownerId = localStorage.getItem('authUserId')
      navigateTo(ownerId ? `/houses/${ownerId}` : '/houses')
    },
    onError: (error: unknown) => {
      setSubmitError(error instanceof Error ? error.message : (isEdit ? 'Không thể cập nhật nhà trọ' : 'Không thể tạo nhà trọ'))
    },
  })

  const submitHouse = (event: FormEvent<HTMLFormElement>) => {
    setSubmitError('')
    if (isUploadTooLarge) {
      setSubmitError('Tổng dung lượng ảnh tối đa là 25MB')
      return
    }

    const form = new FormData(event.currentTarget)
    const payload = {
      name: String(form.get('name') ?? ''),
      address: String(form.get('address') ?? ''),
      province: provinceValue,
      district: wardValue,
      description: String(form.get('description') ?? ''),
      files: selectedFiles,
    }

    if (isEdit && houseId) {
      save.mutate({ id: houseId, ...payload })
    } else {
      save.mutate(payload)
    }
  }

  return (
    <main className="page">
      <PageHeader title={isEdit ? 'Sửa nhà trọ' : 'Thêm nhà trọ'} subtitle="Thông tin cơ bản, trạng thái duyệt và ảnh đại diện." />
      <FormShell onSubmit={submitHouse} loading={save.isLoading || houseDetail?.isLoading}>
        <input name="name" defaultValue={isEdit && houseDetail.data ? houseDetail.data.name : (isEdit ? houses[0].name : '')} placeholder="Tên nhà trọ" required />
        <textarea name="address" defaultValue={isEdit && houseDetail.data ? houseDetail.data.address : (isEdit ? houses[0].address : '')} placeholder="Địa chỉ" required />
        <Select
          style={{ width: '100%' }}
          showSearch
          allowClear
          placeholder={provinces.isLoading ? 'Đang tải tỉnh...' : 'Chọn tỉnh'}
          optionFilterProp="label"
          loading={provinces.isLoading}
          disabled={provinces.isLoading}
          value={provinceValue}
          onChange={(value) => {
            setProvinceValue(value)
            setWardValue(undefined)
          }}
          options={(provinces.data ?? []).map((province) => ({
            value: province.value,
            label: province.label,
          }))}
        />
        <Select
          style={{ width: '100%' }}
          showSearch
          allowClear
          placeholder={!provinceValue ? 'Chọn tỉnh trước' : wards.isLoading ? 'Đang tải xã/phường...' : 'Chọn xã/phường'}
          optionFilterProp="label"
          loading={wards.isLoading}
          disabled={!provinceValue || wards.isLoading}
          value={wardValue}
          onChange={(value) => setWardValue(value)}
          options={(wards.data ?? []).map((ward) => ({
            value: ward.value,
            label: ward.label,
          }))}
        />
        <textarea name="description" defaultValue={isEdit && houseDetail.data ? houseDetail.data.description ?? '' : ''} placeholder="Mô tả" />
        {!isEdit && <p className="form-info">Nhà trọ mới sẽ ở trạng thái Chờ duyệt. Admin duyệt xong mới chuyển sang Hoạt động.</p>}
        <label className="house-upload-button">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              setSelectedFiles((current) => [...current, ...Array.from(event.target.files ?? [])])
              event.currentTarget.value = ''
            }}
          />
          <UploadOutlined />
          <span>Upload ảnh</span>
          <small>Tối đa 25MB</small>
        </label>
        {previews.length ? (
          <div className="house-media-preview">
            {previews.map((preview) => (
              <figure key={preview.url}>
                <img src={preview.url} alt={preview.name} />
              </figure>
            ))}
          </div>
        ) : null}
        {isUploadTooLarge ? <p className="form-error">Tổng dung lượng ảnh tối đa là 25MB.</p> : null}
        {submitError ? <p className="form-error">{submitError}</p> : null}
        <div className="check-grid">{['Wifi', 'Bãi xe', 'Camera', 'Máy giặt', 'Thang máy'].map((item) => <label key={item}><input type="checkbox" /> {item}</label>)}</div>
      </FormShell>
    </main>
  )
}

export function HouseDetailPage() {
  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  const houseId = pathParts[pathParts.length - 1] === 'rooms'
    ? pathParts[pathParts.length - 2] ?? pageId('h1')
    : pageId('h1')
  const fallbackHouse = normalizeHouse(houses.find((item) => item.id === houseId) ?? houses[0])
  const [editOpen, setEditOpen] = useState(false)
  const [editForm] = Form.useForm()
  const detail = useQuery(['house-detail', houseId], () => fetchHouseDetail(houseId), {
    retry: 1,
  })
  const house = normalizeHouse(detail.data ?? fallbackHouse)
  const saveEdit = useMutation(updateHouse, {
    onSuccess: () => {
      queryClient.invalidateQueries(QK.houses)
      queryClient.invalidateQueries(['house-detail', houseId])
      setEditOpen(false)
      editForm.resetFields()
    },
  })

  useEffect(() => {
    if (!detail.data) return
    editForm.setFieldsValue({
      name: detail.data.name,
      address: detail.data.address,
      province: detail.data.province ?? undefined,
      district: detail.data.district ?? undefined,
      description: detail.data.description ?? '',
    })
  }, [detail.data, editForm])

  const submitEditModal = async () => {
    const values = await editForm.validateFields()
    saveEdit.mutate({
      id: houseId,
      name: String(values.name ?? ''),
      address: String(values.address ?? ''),
      province: values.province,
      district: values.district,
      description: values.description,
    })
  }

  return (
    <main className="page">
      <PageHeader title={house.name} subtitle={house.address} action={!isTenant ? <Button onClick={() => setEditOpen(true)}>Sửa</Button> : undefined} />
      <div className="stat-grid"><Card><span>Tổng phòng</span><strong>{house.totalRooms}</strong></Card><Card><span>Đang thuê</span><strong>{house.occupiedRooms}</strong></Card><Card><span>Còn trống</span><strong>{house.totalRooms - house.occupiedRooms}</strong></Card><Card><span>Trạng thái</span><Badge variant={statusVariant(house.status as Status)}>{houseStatusLabel(house.status, house.isActive)}</Badge></Card></div>
      <HouseRoomsTable houseId={houseId} />
      <ModalForm
        open={editOpen}
        title="Sửa nhà trọ"
        form={editForm}
        formItems={[
          { label: 'Tên nhà trọ', name: 'name', component: <Input placeholder="Tên nhà trọ" />, rules: [{ required: true, message: 'Vui lòng nhập tên nhà trọ' }], span: 24 },
          { label: 'Địa chỉ', name: 'address', component: <Input.TextArea rows={3} placeholder="Địa chỉ" />, rules: [{ required: true, message: 'Vui lòng nhập địa chỉ' }], span: 24 },
          { label: 'Tỉnh', name: 'province', component: <Input placeholder="Tỉnh" />, span: 12 },
          { label: 'Xã/phường', name: 'district', component: <Input placeholder="Xã/phường" />, span: 12 },
          { label: 'Mô tả', name: 'description', component: <Input.TextArea rows={4} placeholder="Mô tả" />, span: 24 },
        ]}
        isLoadingGetDetail={detail.isLoading}
        loading={saveEdit.isLoading}
        onCancel={() => {
          setEditOpen(false)
          editForm.resetFields()
        }}
        onOk={submitEditModal}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        layout="vertical"
      />
    </main>
  )
}

export function RoomsPage() {
  const query = useQuery(QK.rooms, () => read('/Rooms', rooms))
  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  return (
    <section className="page compact">
      <PageHeader title="Phòng" subtitle="Danh sách phòng, giá thuê, trạng thái và thao tác nhanh." action={!isTenant ? <Link className="app-button app-button--primary" to="/rooms/create">+ Thêm phòng</Link> : undefined} />
      {query.isLoading ? <SkeletonGrid /> : <div className="grid-3">{(query.data ?? rooms).map((room) => <RoomCard key={room.id} room={room} />)}</div>}
    </section>
  )
}

function RoomCard({ room }: { room: Room }) {
  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  return (
    <Card className="room-card">
      <Illustration kind="room" />
      <div className="card-heading"><h2>Phòng {room.roomNumber}</h2><Badge variant={statusVariant(room.status)}>{room.status}</Badge></div>
      <p>Tầng {room.floor} • {room.area}m² • tối đa {room.maxOccupants} người</p>
      <strong>{formatVND(room.monthlyRent)}/tháng</strong>
      <div className="actions"><Link className="app-button app-button--outline" to={`/rooms/${room.id}`}>Xem</Link>{!isTenant && <Link className="app-button app-button--ghost" to={`/rooms/${room.id}/edit`}>Sửa</Link>}</div>
    </Card>
  )
}

export function RoomDetailPage() {
  const room = rooms.find((item) => item.id === pageId('r101')) ?? rooms[0]
  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  return (
    <main className="page">
      <PageHeader title={`Phòng ${room.roomNumber}`} subtitle={room.description} action={!isTenant ? <Link className="app-button app-button--primary" to={`/rooms/${room.id}/edit`}>Sửa phòng</Link> : undefined} />
      <div className="tabs"><button>Thông tin</button><button>Hóa đơn</button><button>Lịch sử điện nước</button></div>
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
  const save = useMutation(() => ok({}), { onSuccess: () => navigateTo('/houses/detail/h1/rooms') })
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


