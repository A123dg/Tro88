import { useMemo, useState } from 'react'
import { Form, Input, Select, Switch } from 'antd'
import type { TableProps } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { queryClient } from '../../../queryClient'
import TableWithPagination from '../../../shared/components/table-pagination'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import {
  fetchServices,
  createService,
  updateService,
  deleteService,
  toggleService,
  SaveServicePayload,
} from '../../../services/managementService'
import { ListFilters, ServiceDto } from '../../../types/management.types'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'

export function AdminServiceFeesPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const [editingService, setEditingService] = useState<ServiceDto | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<SaveServicePayload>()

  // Fetch Global Services
  const query = useQuery(['admin-services', filters], () => fetchServices(filters), {
    keepPreviousData: true,
  })

  const saveService = useMutation(
    (payload: SaveServicePayload) => (payload.id ? updateService(payload) : createService(payload)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-services')
        setModalOpen(false)
        setEditingService(null)
        form.resetFields()
      },
    }
  )

  const removeService = useMutation(deleteService, {
    onSuccess: () => queryClient.invalidateQueries('admin-services'),
  })

  const toggleServiceMut = useMutation(toggleService, {
    onSuccess: () => queryClient.invalidateQueries('admin-services'),
  })

  const openCreate = () => {
    setEditingService(null)
    form.resetFields()
    form.setFieldsValue({
      feeType: 'Fixed',
      unit: 'Tháng',
    })
    setModalOpen(true)
  }

  const openEdit = (service: ServiceDto) => {
    setEditingService(service)
    form.setFieldsValue({
      id: service.id,
      name: service.name,
      feeType: service.feeType,
      unit: service.unit ?? undefined,
    })
    setModalOpen(true)
  }

  const columns = useMemo<TableProps<ServiceDto>['columns']>(
    () => [
      {
        key: 'name',
        title: 'Tên dịch vụ',
        render: (_, service) => <strong>{service.name}</strong>,
      },
      {
        key: 'feeType',
        title: 'Loại phí',
        render: (_, service) => (service.feeType === 'Fixed' ? 'Cố định tháng' : 'Theo chỉ số sử dụng'),
      },
      {
        key: 'unit',
        title: 'Đơn vị',
        render: (_, service) => <span>{service.unit || '—'}</span>,
      },
      {
        key: 'status',
        title: 'Trạng thái',
        render: (_, service) => (
          <Switch
            checked={service.isActive}
            loading={toggleServiceMut.isLoading}
            onChange={() => toggleServiceMut.mutate(service.id)}
          />
        ),
      },
      {
        key: 'actions',
        title: 'Thao tác',
        className: 'action-column',
        render: (_, service) => (
          <div className="row-actions">
            <button type="button" className="button button--ghost" onClick={() => openEdit(service)}>
              Sửa
            </button>
            <button
              type="button"
              className="button button--danger"
              disabled={removeService.isLoading}
              onClick={() => {
                if (window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.name}"?`)) {
                  removeService.mutate(service.id)
                }
              }}
            >
              Xóa
            </button>
          </div>
        ),
      },
    ],
    [removeService, toggleServiceMut]
  )

  const submit = async () => {
    const values = await form.validateFields()
    saveService.mutate({
      ...values,
      id: editingService?.id,
    })
  }

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
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
                  placeholder="Trạng thái"
                  style={{ width: 180 }}
                  allowClear
                  value={filters.isActive === undefined ? undefined : String(filters.isActive)}
                  onChange={(val) =>
                    setFilters({ ...filters, isActive: val ? val === 'true' : undefined, page: 1 })
                  }
                  options={[
                    { value: 'true', label: 'Đang hoạt động' },
                    { value: 'false', label: 'Tạm dừng' },
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
        title={editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'}
        form={form}
        formItems={[
          {
            label: 'Tên dịch vụ',
            name: 'name',
            component: <Input placeholder="Ví dụ: Điện, Nước, Wifi, Gửi xe, Rác..." />,
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
            component: <Input placeholder="Ví dụ: kWh, m³, Tháng, Xe..." />,
            span: 12,
          },
        ]}
        loading={saveService.isLoading}
        onCancel={() => {
          setModalOpen(false)
          setEditingService(null)
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
