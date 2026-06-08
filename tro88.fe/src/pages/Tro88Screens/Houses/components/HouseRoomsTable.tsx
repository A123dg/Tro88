import { Button, Card, Form, Input, InputNumber } from 'antd'
import type { TableProps } from 'antd'
import { useState } from 'react'
import { useCreateRoom, useDeleteRoom, useRooms, useUpdateRoom } from '../../../../hooks/useRooms'
import type { RoomPayload } from '../../../../services/roomService'
import ModalForm from '../../../../shared/components/modal-form/ModalForm'
import TableWithPagination from '../../../../shared/components/table-pagination'
import type { RoomDto } from '../../../../types/room.types'
import { Badge, formatVND, statusVariant, Status, navigateTo } from '../../shared'

import { useServiceFees } from '../../../../hooks/useManagement'
import { ServiceFeeDto } from '../../../../types/management.types'

function toRoomPayload(values: Record<string, any>): RoomPayload {
  const servicesPayload = Object.entries(values.services_price ?? {}).map(([serviceId, amount]) => ({
    serviceId,
    amount: Number(amount ?? 0),
  }))

  const electricityPrice = servicesPayload.find(s => s.serviceId === '11111111-1111-1111-1111-111111111111')?.amount ?? 0
  const waterPrice = servicesPayload.find(s => s.serviceId === '22222222-2222-2222-2222-222222222222')?.amount ?? 0

  return {
    roomNumber: String(values.roomNumber ?? ''),
    floor: Number(values.floor ?? 1),
    area: Number(values.area ?? 0),
    maxOccupants: Number(values.maxOccupants ?? 1),
    monthlyRent: Number(values.monthlyRent ?? 0),
    depositAmount: Number(values.depositAmount ?? 0),
    electricityUnitPrice: electricityPrice,
    waterUnitPrice: waterPrice,
    description: values.description ? String(values.description) : null,
    serviceFees: servicesPayload,
  }
}

function roomFormItems(houseServices: ServiceFeeDto[]) {
  const baseItems = [
    { label: 'Số phòng', name: 'roomNumber', component: <Input placeholder="Ví dụ: 101" />, rules: [{ required: true, message: 'Vui lòng nhập số phòng' }], span: 12 },
    { label: 'Tầng', name: 'floor', component: <InputNumber min={1} precision={0} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập tầng' }], span: 12 },
    { label: 'Diện tích (m²)', name: 'area', component: <InputNumber min={1} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập diện tích' }], span: 12 },
    { label: 'Số người tối đa', name: 'maxOccupants', component: <InputNumber min={1} precision={0} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập số người tối đa' }], span: 12 },
    { label: 'Giá thuê/tháng', name: 'monthlyRent', component: <InputNumber min={0} step={100000} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập giá thuê' }], span: 12 },
    { label: 'Tiền cọc', name: 'depositAmount', component: <InputNumber min={0} step={100000} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập tiền cọc' }], span: 12 },
  ]

  const serviceItems = houseServices.map((service) => ({
    label: `Giá ${service.name} ${service.unit ? `(${service.unit})` : ''}`,
    name: ['services_price', service.serviceId],
    component: (
      <InputNumber<number>
        min={0}
        style={{ width: '100%' }}
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
      />
    ),
    rules: [{ required: true, message: `Vui lòng nhập giá ${service.name}` }],
    span: 12,
  }))

  return [
    ...baseItems,
    ...serviceItems,
    { label: 'Mô tả', name: 'description', component: <Input.TextArea rows={4} placeholder="Mô tả phòng" />, span: 24 },
  ]
}

export function HouseRoomsTable({ houseId }: { houseId: string }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<RoomDto | null>(null)
  const [roomForm] = Form.useForm()
  const roomsQuery = useRooms(houseId, { page, pageSize, sort: 'roomNumberAsc' })
  const createRoom = useCreateRoom(houseId)
  const updateRoom = useUpdateRoom()
  const deleteRoom = useDeleteRoom()
  const roomList = roomsQuery.data?.rooms ?? []
  const meta = roomsQuery.data?.meta ?? { page: 1, pageSize, total: 0, totalPage: 1 }

  const houseServicesQuery = useServiceFees({ houseId, isActive: true })
  const houseServices = houseServicesQuery.data?.items ?? []

  const openCreate = () => {
    setEditingRoom(null)
    roomForm.resetFields()

    const servicesPrice: Record<string, number> = {}
    houseServices.forEach((hs) => {
      servicesPrice[hs.serviceId] = hs.amount
    })

    roomForm.setFieldsValue({
      floor: 1,
      area: 20,
      maxOccupants: 2,
      monthlyRent: 0,
      depositAmount: 0,
      services_price: servicesPrice,
    })
    setOpen(true)
  }

  const openEdit = (room: RoomDto) => {
    setEditingRoom(room)

    const servicesPrice: Record<string, number> = {}
    houseServices.forEach((hs) => {
      servicesPrice[hs.serviceId] = hs.amount
    })

    room.serviceFees?.forEach((rs) => {
      servicesPrice[rs.serviceId] = rs.amount
    })

    roomForm.setFieldsValue({
      ...room,
      services_price: servicesPrice,
    })
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditingRoom(null)
    roomForm.resetFields()
  }

  const submitRoom = async () => {
    const values = await roomForm.validateFields()
    const payload = toRoomPayload(values)

    if (editingRoom) {
      updateRoom.mutate({ id: editingRoom.id, data: payload }, { onSuccess: closeModal })
      return
    }

    createRoom.mutate(payload, { onSuccess: closeModal })
  }

  const handleDelete = (room: RoomDto) => {
    if (!window.confirm(`Xóa phòng ${room.roomNumber}?`)) {
      return
    }

    deleteRoom.mutate(room.id)
  }

  const isTenant = localStorage.getItem('authRole') === 'Tenant'

  const columns: TableProps<RoomDto>['columns'] = [
    { key: 'roomNumber', title: 'Phòng', dataIndex: 'roomNumber', render: (value) => <strong>{value}</strong> },
    { key: 'floor', title: 'Tầng', dataIndex: 'floor' },
    { key: 'area', title: 'Diện tích', dataIndex: 'area', render: (value) => `${value}m²` },
    { key: 'maxOccupants', title: 'Sức chứa', dataIndex: 'maxOccupants', render: (value) => `${value} người` },
    { key: 'monthlyRent', title: 'Giá thuê', dataIndex: 'monthlyRent', render: (value) => formatVND(value) },
    { key: 'status', title: 'Trạng thái', dataIndex: 'status', render: (value) => <Badge variant={statusVariant(value as Status)}>{value}</Badge> },
  ]

  if (!isTenant) {
    columns.push({
      key: 'actions',
      title: 'Thao tác',
      className: 'action-column house-rooms-table__actions',
      render: (_, room) => (
        <div className="actions">
          <Button variant="outlined" onClick={() => navigateTo(`/rooms/${room.id}`)}>Xem</Button>
          <Button variant="outlined" onClick={() => openEdit(room)}>Sửa</Button>
          <Button variant="solid" danger loading={deleteRoom.isLoading} onClick={() => handleDelete(room)}>Xóa</Button>
        </div>
      ),
    })
  }

  return (
    <Card className="house-rooms-card">
      <div className="house-rooms-card__header">
        <div>
          <h2>Danh sách phòng</h2>
          <p>{isTenant ? 'Danh sách phòng của nhà trọ này.' : 'Quản lý phòng của nhà trọ này, bao gồm thêm, sửa và xóa phòng.'}</p>
        </div>
        {!isTenant && <Button onClick={openCreate}>+ Thêm phòng</Button>}
      </div>

      {roomsQuery.isError ? (
        <div className="room-error">
          <strong>Không thể tải danh sách phòng</strong>
          <button type="button" className="app-button app-button--outline" onClick={() => roomsQuery.refetch()}>Thử lại</button>
        </div>
      ) : null}

      {!roomsQuery.isError ? (
        <TableWithPagination
          className="house-rooms-table"
          columns={columns}
          dataSource={roomList}
          loading={roomsQuery.isLoading}
          rowKey="id"
          pagination={{
            current: meta.page,
            pageSize: meta.pageSize,
            total: meta.total,
            disabled: roomsQuery.isFetching,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
            },
          }}
          locale={{ emptyText: 'Chưa có phòng nào.' }}
        />
      ) : null}

      <ModalForm
        open={open}
        title={editingRoom ? 'Sửa phòng' : 'Thêm phòng'}
        form={roomForm}
        formItems={roomFormItems(houseServices)}
        loading={createRoom.isLoading || updateRoom.isLoading}
        onCancel={closeModal}
        onOk={submitRoom}
        okText={editingRoom ? 'Lưu thay đổi' : 'Thêm phòng'}
        cancelText="Hủy"
        layout="vertical"
      />
    </Card>
  )
}
