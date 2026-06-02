import { useMemo, useState } from 'react'
import { Form, Input, Select, Switch } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { DataColumn, DataPage, formatDate, StatusPill } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { queryClient } from '../../../queryClient'
import { createUser, deleteUser, fetchUsers, SaveUserPayload, updateUser, UserFilters } from '../../../services/userService'
import { UserDto } from '../../../types/app.types'
import ModalForm from '../../../shared/components/modal-form/ModalForm'

const roleOptions = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'Admin', label: 'Admin' },
  { value: 'Owner', label: 'Owner' },
  { value: 'Tenant', label: 'Tenant' },
]

export function AdminUsersPage() {
  const [filters, setFilters] = useUrlListFilters<UserFilters>({ page: 1, pageSize: 10 })
  const [editingUser, setEditingUser] = useState<UserDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<SaveUserPayload>()

  const query = useQuery(['admin-users', filters], () => fetchUsers(filters), { keepPreviousData: true })
  const saveUser = useMutation((payload: SaveUserPayload) => (payload.id ? updateUser(payload) : createUser(payload)), {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-users')
      setModalOpen(false)
      setEditingUser(null)
      form.resetFields()
    },
  })
  const removeUser = useMutation(deleteUser, {
    onSuccess: () => queryClient.invalidateQueries('admin-users'),
  })

  const openCreate = () => {
    setEditingUser(null)
    form.setFieldsValue({ role: 'Tenant', isActive: true })
    setModalOpen(true)
  }

  const openEdit = (user: UserDto) => {
    setEditingUser(user)
    form.setFieldsValue({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role as SaveUserPayload['role'],
      nationalId: user.nationalId ?? undefined,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : undefined,
      isActive: user.isActive,
      password: '',
    })
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
            <button type="button" className="button button--ghost" onClick={() => openEdit(item)}>
              Sửa
            </button>
            <button
              type="button"
              className="button button--danger"
              disabled={removeUser.isLoading}
              onClick={() => {
                if (window.confirm(`Xóa tài khoản ${item.email}?`)) removeUser.mutate(item.id)
              }}
            >
              Xóa
            </button>
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
      dateOfBirth: values.dateOfBirth || undefined,
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
            <Input
              value={filters.search ?? ''}
              placeholder="Tìm tên, email, số điện thoại"
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
            />
            <Select
              value={filters.role ?? ''}
              onChange={(role) => setFilters({ ...filters, role: role || undefined, page: 1 })}
              options={roleOptions}
            />
            <button type="button" className="button button--primary" onClick={openCreate}>
              Thêm người dùng
            </button>
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
          { label: 'Ngày sinh', name: 'dateOfBirth', component: <Input type="date" />, span: 12 },
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
