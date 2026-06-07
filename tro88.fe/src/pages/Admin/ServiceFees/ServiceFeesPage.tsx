import { useMemo, useState } from 'react'
import { Form, Input, InputNumber, Select, Switch } from 'antd'
import type { TableProps } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { queryClient } from '../../../queryClient'
import TableWithPagination from '../../../shared/components/table-pagination'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import {
  fetchServiceFees,
  createServiceFee,
  updateServiceFee,
  deleteServiceFee,
  toggleServiceFee,
  SaveServiceFeePayload,
} from '../../../services/managementService'
import { fetchHouses } from '../../../services/houseService'
import { ListFilters, ServiceFeeDto } from '../../../types/management.types'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'

export function AdminServiceFeesPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const [editingFee, setEditingFee] = useState<ServiceFeeDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<SaveServiceFeePayload>()

  // Fetch Service Fees
  const query = useQuery(['admin-service-fees', filters], () => fetchServiceFees(filters), {
    keepPreviousData: true,
  })

  // Fetch Houses for select dropdown
  const housesQuery = useQuery(['all-houses-list'], () => fetchHouses({ page: 1, pageSize: 100 }))
  const houseOptions = useMemo(() => {
    return (housesQuery.data?.items ?? []).map((h) => ({
      value: h.id,
      label: h.name,
    }))
  }, [housesQuery.data])

  const saveFee = useMutation(
    (payload: SaveServiceFeePayload) => (payload.id ? updateServiceFee(payload) : createServiceFee(payload)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-service-fees')
        setModalOpen(false)
        setEditingFee(null)
        form.resetFields()
      },
    }
  )

  const removeFee = useMutation(deleteServiceFee, {
    onSuccess: () => queryClient.invalidateQueries('admin-service-fees'),
  })

  const toggleFee = useMutation(toggleServiceFee, {
    onSuccess: () => queryClient.invalidateQueries('admin-service-fees'),
  })

  const openCreate = () => {
    setEditingFee(null)
    form.setFieldsValue({
      feeType: 'Fixed',
      amount: 0,
      unit: 'Tháng',
    })
    setModalOpen(true)
  }

  const openEdit = (fee: ServiceFeeDto) => {
    setEditingFee(fee)
    form.setFieldsValue({
      id: fee.id,
      houseId: fee.houseId,
      name: fee.name,
      feeType: fee.feeType,
      amount: fee.amount,
      unit: fee.unit ?? undefined,
    })
    setModalOpen(true)
  }

  const columns = useMemo<TableProps<ServiceFeeDto>['columns']>(
    () => [
      {
        key: 'name',
        title: 'Tên dịch vụ',
        render: (_, fee) => <strong>{fee.name}</strong>,
      },
      {
        key: 'houseName',
        title: 'Nhà trọ',
        render: (_, fee) => {
          const house = (housesQuery.data?.items ?? []).find((h) => h.id === fee.houseId)
          return house ? house.name : 'Chưa xác định'
        },
      },
      {
        key: 'feeType',
        title: 'Loại phí',
        render: (_, fee) => (fee.feeType === 'Fixed' ? 'Cố định tháng' : fee.feeType),
      },
      {
        key: 'amount',
        title: 'Đơn giá',
        render: (_, fee) => <span>{fee.amount.toLocaleString('vi-VN')}đ</span>,
      },
      {
        key: 'unit',
        title: 'Đơn vị',
        render: (_, fee) => <span>{fee.unit || '—'}</span>,
      },
      {
        key: 'status',
        title: 'Trạng thái',
        render: (_, fee) => (
          <Switch
            checked={fee.isActive}
            checkedChildren="Mở"
            unCheckedChildren="Tắt"
            loading={toggleFee.isLoading}
            onChange={() => toggleFee.mutate(fee.id)}
          />
        ),
      },
      {
        key: 'actions',
        title: 'Thao tác',
        className: 'action-column',
        render: (_, fee) => (
          <div className="row-actions">
            <button type="button" className="button button--ghost" onClick={() => openEdit(fee)}>
              Sửa
            </button>
            <button
              type="button"
              className="button button--danger"
              disabled={removeFee.isLoading}
              onClick={() => {
                if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${fee.name}"?`)) {
                  removeFee.mutate(fee.id)
                }
              }}
            >
              Xóa
            </button>
          </div>
        ),
      },
    ],
    [housesQuery.data, removeFee, toggleFee]
  )

  const submit = async () => {
    const values = await form.validateFields()
    saveFee.mutate({
      ...values,
      id: editingFee?.id,
    })
  }

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
          <nav className="breadcrumb">Quản lý dịch vụ toàn hệ thống</nav>
        </div>
      </header>

      <section className="admin-section system-data-section">
        {query.isError ? (
          <section className="room-error">
            <strong>Không thể tải danh sách dịch vụ</strong>
            <button type="button" className="button button--primary" onClick={() => query.refetch()}>
              Thử lại
            </button>
          </section>
        ) : null}

        {!query.isError ? (
          <div className="data-table data-table--antd">
            <div className="table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Select
                  placeholder="Lọc theo nhà trọ"
                  style={{ width: 220 }}
                  allowClear
                  value={filters.houseId}
                  onChange={(val) => setFilters({ ...filters, houseId: val || undefined, page: 1 })}
                  options={houseOptions}
                />
                <Select
                  placeholder="Trạng thái"
                  style={{ width: 140 }}
                  allowClear
                  value={filters.isActive === undefined ? undefined : String(filters.isActive)}
                  onChange={(val) =>
                    setFilters({ ...filters, isActive: val ? val === 'true' : undefined, page: 1 })
                  }
                  options={[
                    { value: 'true', label: 'Đang hoạt động' },
                    { value: 'false', label: 'Tạm ngắt' },
                  ]}
                />
              </div>
              <button type="button" className="button button--primary" onClick={openCreate}>
                Thêm dịch vụ
              </button>
            </div>

            <TableWithPagination
              columns={columns}
              dataSource={query.data?.items ?? []}
              loading={query.isLoading}
              rowKey="id"
              scroll={{ x: true }}
              pagination={{
                current: query.data?.meta.page ?? filters.page,
                pageSize: query.data?.meta.pageSize ?? filters.pageSize,
                total: query.data?.meta.total ?? 0,
                onChange: (page, pageSize) => {
                  setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))
                },
              }}
              locale={{ emptyText: 'Không có dịch vụ phù hợp.' }}
            />
          </div>
        ) : null}
      </section>

      <ModalForm
        open={modalOpen}
        title={editingFee ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
        form={form}
        formItems={[
          {
            label: 'Chọn nhà trọ',
            name: 'houseId',
            component: <Select options={houseOptions} placeholder="Chọn nhà áp dụng" />,
            rules: [{ required: true, message: 'Vui lòng chọn nhà trọ' }],
            span: 24,
          },
          {
            label: 'Tên dịch vụ',
            name: 'name',
            component: <Input placeholder="Ví dụ: Tiền mạng Wifi, Bãi gửi xe..." />,
            rules: [{ required: true, message: 'Vui lòng nhập tên dịch vụ' }],
            span: 24,
          },
          {
            label: 'Loại phí',
            name: 'feeType',
            component: (
              <Select
                options={[
                  { value: 'Fixed', label: 'Cố định tháng' },
                  { value: 'Usage', label: 'Theo đơn vị sử dụng' },
                ]}
              />
            ),
            rules: [{ required: true, message: 'Vui lòng chọn loại phí' }],
            span: 12,
          },
          {
            label: 'Đơn vị tính',
            name: 'unit',
            component: <Input placeholder="Ví dụ: Tháng, Xe, Phòng..." />,
            span: 12,
          },
          {
            label: 'Số tiền (VNĐ)',
            name: 'amount',
            component: <InputNumber style={{ width: '100%' }} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value!.replace(/\$\s?|(,*)/g, '')} />,
            rules: [{ required: true, message: 'Vui lòng nhập đơn giá' }],
            span: 24,
          },
        ]}
        loading={saveFee.isLoading}
        onCancel={() => {
          setModalOpen(false)
          setEditingFee(null)
          form.resetFields()
        }}
        onOk={submit}
        okText="Lưu"
        cancelText="Hủy"
        layout="vertical"
      />
    </main>
  )
}
