import { Button, Card, Form, Input, InputNumber } from 'antd'
import { useState } from 'react'
import { PaginatedTable, PaginatedTableColumn } from '../../../../components/shared/pagination'
import { useCreateRoom, useDeleteRoom, useRooms, useUpdateRoom } from '../../../../hooks/useRooms'
import type { RoomPayload } from '../../../../services/roomService'
import ModalForm from '../../../../shared/components/modal-form/ModalForm'
import type { RoomDto } from '../../../../types/room.types'
import { Badge, formatVND, statusVariant, Status } from '../../shared'

function toRoomPayload(values: Record<string, unknown>): RoomPayload {
  return {
    roomNumber: String(values.roomNumber ?? ''),
    floor: Number(values.floor ?? 1),
    area: Number(values.area ?? 0),
    maxOccupants: Number(values.maxOccupants ?? 1),
    monthlyRent: Number(values.monthlyRent ?? 0),
    depositAmount: Number(values.depositAmount ?? 0),
    electricityUnitPrice: Number(values.electricityUnitPrice ?? 0),
    waterUnitPrice: Number(values.waterUnitPrice ?? 0),
    description: values.description ? String(values.description) : null,
  }
}

function roomFormItems() {
  return [
    { label: 'Số phòng', name: 'roomNumber', component: <Input placeholder="Ví dụ: 101" />, rules: [{ required: true, message: 'Vui lòng nhập số phòng' }], span: 12 },
    { label: 'Tầng', name: 'floor', component: <InputNumber min={1} precision={0} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập tầng' }], span: 12 },
    { label: 'Diện tích (m²)', name: 'area', component: <InputNumber min={1} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập diện tích' }], span: 12 },
    { label: 'Số người tối đa', name: 'maxOccupants', component: <InputNumber min={1} precision={0} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập số người tối đa' }], span: 12 },
    { label: 'Giá thuê/tháng', name: 'monthlyRent', component: <InputNumber min={0} step={100000} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập giá thuê' }], span: 12 },
    { label: 'Tiền cọc', name: 'depositAmount', component: <InputNumber min={0} step={100000} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập tiền cọc' }], span: 12 },
    { label: 'Giá điện', name: 'electricityUnitPrice', component: <InputNumber min={0} step={100} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập giá điện' }], span: 12 },
    { label: 'Giá nước', name: 'waterUnitPrice', component: <InputNumber min={0} step={1000} style={{ width: '100%' }} />, rules: [{ required: true, message: 'Vui lòng nhập giá nước' }], span: 12 },
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

  const openCreate = () => {
    setEditingRoom(null)
    roomForm.resetFields()
    roomForm.setFieldsValue({
      floor: 1,
      area: 20,
      maxOccupants: 2,
      monthlyRent: 0,
      depositAmount: 0,
      electricityUnitPrice: 3800,
      waterUnitPrice: 18000,
    })
    setOpen(true)
  }

  const openEdit = (room: RoomDto) => {
    setEditingRoom(room)
    roomForm.setFieldsValue(room)
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

  const columns: Array<PaginatedTableColumn<RoomDto>> = [
    { key: 'roomNumber', title: 'Phòng', render: (room) => <strong>{room.roomNumber}</strong> },
    { key: 'floor', title: 'Tầng', render: (room) => room.floor },
    { key: 'area', title: 'Diện tích', render: (room) => `${room.area}m²` },
    { key: 'maxOccupants', title: 'Sức chứa', render: (room) => `${room.maxOccupants} người` },
    { key: 'monthlyRent', title: 'Giá thuê', render: (room) => formatVND(room.monthlyRent) },
    { key: 'status', title: 'Trạng thái', render: (room) => <Badge variant={statusVariant(room.status as Status)}>{room.status}</Badge> },
    {
      key: 'actions',
      title: 'Thao tác',
      className: 'house-rooms-table__actions',
      render: (room) => (
        <div className="actions">
          <Button variant="outlined" onClick={() => openEdit(room)}>Sửa</Button>
          <Button variant="solid" danger loading={deleteRoom.isLoading} onClick={() => handleDelete(room)}>Xóa</Button>
        </div>
      ),
    },
  ]

  return (
    <Card className="house-rooms-card">
      <div className="house-rooms-card__header">
        <div>
          <h2>Danh sách phòng</h2>
          <p>Quản lý phòng của nhà trọ này, bao gồm thêm, sửa và xóa phòng.</p>
        </div>
        <Button onClick={openCreate}>+ Thêm phòng</Button>
      </div>

      {roomsQuery.isLoading ? <div className="panel-state">Đang tải danh sách phòng...</div> : null}
      {roomsQuery.isError ? (
        <div className="room-error">
          <strong>Không thể tải danh sách phòng</strong>
          <button type="button" className="app-button app-button--outline" onClick={() => roomsQuery.refetch()}>Thử lại</button>
        </div>
      ) : null}

      {!roomsQuery.isLoading && !roomsQuery.isError ? (
        <PaginatedTable
          className="house-rooms-table"
          columns={columns}
          items={roomList}
          meta={meta}
          rowKey={(room) => room.id}
          emptyText="Chưa có phòng nào."
          disabled={roomsQuery.isFetching}
          onPageChange={(nextPage, nextPageSize) => {
            setPage(nextPage)
            setPageSize(nextPageSize)
          }}
        />
      ) : null}

      <ModalForm
        open={open}
        title={editingRoom ? 'Sửa phòng' : 'Thêm phòng'}
        form={roomForm}
        formItems={roomFormItems()}
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
