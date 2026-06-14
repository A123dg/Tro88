import { useMemo, useState } from 'react'
import { Button, Form, Input, Select, Switch, Modal } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { DataColumn, DataPage, formatDate, StatusPill } from '../../../shared/components/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { queryClient } from '../../../queryClient'
import { createUser, deleteUser, fetchUsers, SaveUserPayload, updateUser, UserFilters } from '../../../services/userService'
import { UserDto } from '../../../types/app.types'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import { CustomDatePicker } from '../../../shared/components/custom-datepicker'
import dayjs from 'dayjs'

import { useNotification } from '../../../hooks/useNotification'

const roleOptions = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Owner', label: 'Owner' },
  { value: 'Tenant', label: 'Tenant' },
]

interface UserFormValues extends Omit<SaveUserPayload, 'dateOfBirth'> {
  dateOfBirth?: dayjs.Dayjs
}

export function AdminUsersPage() {
  const [filters, setFilters] = useUrlListFilters<UserFilters>({ page: 1, pageSize: 10 })
  const [editingUser, setEditingUser] = useState<UserDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<UserFormValues>()
  const { showSuccessNotify, showErrorNotify } = useNotification()

  const query = useQuery(['admin-users', filters], () => fetchUsers(filters), { keepPreviousData: true })
  const saveUser = useMutation((payload: SaveUserPayload) => (payload.id ? updateUser(payload) : createUser(payload)), {
    onSuccess: (response) => {
      if (!response.success) {
        showErrorNotify(response.message || 'Không thể lưu người dùng')
        return
      }
      queryClient.invalidateQueries('admin-users')
      setModalOpen(false)
      setEditingUser(null)
      form.resetFields()
      showSuccessNotify('Lưu thông tin người dùng thành công')
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể lưu người dùng')
    }
  })
  const removeUser = useMutation(deleteUser, {
    onSuccess: (response) => {
      if (!response.success) {
        showErrorNotify(response.message || 'Không thể xóa người dùng')
        return
      }
      queryClient.invalidateQueries('admin-users')
      showSuccessNotify('Xóa người dùng thành công')
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể xóa người dùng')
    }
  })

  const openCreate = () => {
    setEditingUser(null)
    form.setFieldsValue({ role: 'Tenant', isActive: true })
    setModalOpen(true)
  }


  const columns = useMemo<Array<DataColumn<UserDto>>>(
    () => [
      { key: 'fullName', title: 'Người dùng', render: (item) => <strong>{item.fullName}</strong> },
      { key: 'email', title: 'Email', render: (item) => item.email },
      { key: 'phoneNumber', title: 'Số điện thoại', render: (item) => item.phoneNumber || 'Chưa cập nhật' },
      { key: 'role', title: 'Vai trò', render: (item) => <StatusPill value={item.role} /> },
      { key: 'createdAt', title: 'Ngày tạo', render: (item) => formatDate(item.createdAt) },
      { key: 'status', title: 'Trạng thái', render: (item) => <StatusPill value={item.isActive ? 'Active' : 'Inactive'} /> },
      {
        key: 'actions',
        title: 'Thao tác',
        render: (item) => (
          <div className="row-actions">
            <Button
              type="text"
              danger
              disabled={removeUser.isLoading}
              onClick={() => {
                Modal.confirm({
                  title: 'Xóa tài khoản',
                  content: `Bạn có chắc chắn muốn xóa tài khoản ${item.email}?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: () => removeUser.mutate(item.id),
                })
              }}
            >
              Xóa
            </Button>
          </div>
        ),
      },
    ],
    [removeUser],
  )

  const submit = async () => {
    const values = await form.validateFields()
    saveUser.mutate({
      ...values,
      id: editingUser?.id,
      phoneNumber: values.phoneNumber ?? '',
      nationalId: values.nationalId || undefined,
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
      password: values.password || undefined,
      isActive: values.isActive ?? true,
    })
  }

  return (
    <>
      <DataPage<UserDto>
        title="Quản lý người dùng"
        subtitle="Thêm, sửa, xóa tài khoản và phân quyền Admin, Owner, Tenant."
        breadcrumb="Tro88 / Admin / Người dùng"
        items={query.data?.items ?? []}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
        actions={
          <div className="data-actions__row">
            <Input.Search
              value={filters.search ?? ''}
              placeholder="Tìm tên, email, số điện thoại"
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              enterButton
            />
            <Select
              value={filters.role ?? ''}
              onChange={(role) => setFilters({ ...filters, role: role || undefined, page: 1 })}
              options={roleOptions}
            />
            <Button type="primary" onClick={openCreate}>
              Thêm người dùng
            </Button>
          </div>
        }
        columns={columns}
      />

      <ModalForm
        open={modalOpen}
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
        form={form}
        formItems={[
          { label: 'Họ tên', name: 'fullName', component: <Input />, rules: [{ required: true, message: 'Vui lòng nhập họ tên' }], span: 12 },
          { label: 'Email', name: 'email', component: <Input type="email" />, rules: [{ required: true, message: 'Vui lòng nhập email' }], span: 12 },
          { label: 'Số điện thoại', name: 'phoneNumber', component: <Input />, span: 12 },
          { label: 'Vai trò', name: 'role', component: <Select options={roleOptions.filter((item) => item.value)} />, rules: [{ required: true, message: 'Vui lòng chọn vai trò' }], span: 12 },
          { label: 'Mật khẩu', name: 'password', component: <Input.Password placeholder={editingUser ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'} />, rules: editingUser ? [] : [{ required: true, message: 'Vui lòng nhập mật khẩu' }], span: 12 },
          { label: 'Ngày sinh', name: 'dateOfBirth', component: <CustomDatePicker placeholder="Chọn ngày sinh" />, span: 12 },
          { label: 'CCCD/CMND', name: 'nationalId', component: <Input />, span: 12 },
          { label: 'Hoạt động', name: 'isActive', component: <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />, valuePropName: 'checked', span: 12 },
        ]}
        loading={saveUser.isLoading}
        onCancel={() => {
          setModalOpen(false)
          setEditingUser(null)
          form.resetFields()
        }}
        onOk={submit}
        okText="Lưu"
        cancelText="Hủy"
        layout="vertical"
      />
    </>
  )
}
