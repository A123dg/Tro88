import { useState, useMemo } from 'react'
import { Select, Form, InputNumber, Button } from 'antd'
import { useQuery, useMutation } from 'react-query'
import { queryClient } from '../../../queryClient'
import { DataPage } from '../../../components/shared/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useServiceFeeActions, useServiceFees } from './hooks'
import { useServices } from '../../../hooks/useManagement'
import { useColumn } from './hooks/useColumn'
import { ListFilters, ServiceFeeDto } from './service/types'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import { createServiceFee, updateServiceFee } from '../../../services/managementService'
import { useNotification } from '../../../hooks/useNotification'

export function ServiceFeesPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const houseId = filters.houseId || localStorage.getItem('selectedHouseId') || ''
  
  // Set houseId in filters for the query
  const queryFilters = useMemo(() => ({ ...filters, houseId: houseId || undefined }), [filters, houseId])
  const query = useServiceFees(queryFilters)
  const toggle = useServiceFeeActions()
  const { showSuccessNotify, showErrorNotify } = useNotification()

  // Modal States
  const [modalOpen, setModalOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<ServiceFeeDto | null>(null)
  const [form] = Form.useForm()

  // Fetch Global Services catalog
  const servicesQuery = useServices({ page: 1, pageSize: 100, isActive: true })

  const saveMutation = useMutation(
    (payload: { id?: string; houseId: string; serviceId?: string; amount: number }) => {
      if (payload.id) {
        return updateServiceFee({ id: payload.id, houseId: payload.houseId, amount: payload.amount, name: '', feeType: '' })
      } else {
        return createServiceFee({ houseId: payload.houseId, serviceId: payload.serviceId, amount: payload.amount, name: '', feeType: '' } as any)
      }
    },
    {
      onSuccess: () => {
        showSuccessNotify('Lưu cấu hình dịch vụ thành công')
        queryClient.invalidateQueries('service-fees')
        setModalOpen(false)
        setEditingFee(null)
        form.resetFields()
      },
      onError: (err: any) => {
        showErrorNotify(err?.message || 'Không thể lưu dịch vụ')
      }
    }
  )

  const handleEdit = (fee: ServiceFeeDto) => {
    setEditingFee(fee)
    form.setFieldsValue({
      serviceId: fee.serviceId,
      amount: fee.amount,
    })
    setModalOpen(true)
  }

  const openCreate = () => {
    setEditingFee(null)
    form.resetFields()
    setModalOpen(true)
  }

  const { columns } = useColumn({
    handleToggle: (id) => {
      toggle.mutate(id, {
        onSuccess: () => showSuccessNotify('Thay đổi trạng thái dịch vụ thành công'),
        onError: (err: any) => showErrorNotify(err?.message || 'Thao tác thất bại'),
      })
    },
    handleEdit,
  })

  // Filter out services already added to this house to prevent duplicates in dropdown
  const availableServices = useMemo(() => {
    const configuredServiceIds = (query.data?.items ?? []).map(f => f.serviceId)
    return (servicesQuery.data?.items ?? []).filter(s => !configuredServiceIds.includes(s.id))
  }, [servicesQuery.data, query.data])

  return (
    <>
      <DataPage<ServiceFeeDto>
        title="Quản lý phí dịch vụ"
        subtitle="Theo dõi phí gửi xe, vệ sinh, internet và các khoản thu định kỳ."
        breadcrumb="Tro88 / Phí dịch vụ"
        items={query.data?.items ?? []}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
        actions={
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Select
              value={filters.isActive === undefined ? '' : String(filters.isActive)}
              onChange={(value) => setFilters({ ...filters, isActive: value ? value === 'true' : undefined, page: 1 })}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'true', label: 'Đang dùng' },
                { value: 'false', label: 'Tạm tắt' },
              ]}
              style={{ width: '160px' }}
            />
            {houseId && (
              <Button type="primary" onClick={openCreate} style={{ background: '#f4845f', borderColor: '#f4845f' }}>
                + Áp dụng dịch vụ
              </Button>
            )}
          </div>
        }
        columns={columns}
      />

      <ModalForm
        open={modalOpen}
        title={editingFee ? 'Cập nhật giá dịch vụ' : 'Áp dụng dịch vụ cho nhà trọ'}
        form={form}
        formItems={[
          {
            label: 'Chọn dịch vụ hệ thống',
            name: 'serviceId',
            component: (
              <Select
                placeholder="Chọn loại dịch vụ"
                disabled={Boolean(editingFee)}
                options={
                  editingFee 
                    ? [{ value: editingFee.serviceId, label: editingFee.name }] 
                    : availableServices.map(s => ({ value: s.id, label: `${s.name} ${s.unit ? `(${s.unit})` : ''}` }))
                }
              />
            ),
            rules: [{ required: true, message: 'Vui lòng chọn dịch vụ' }],
            span: 24,
          },
          {
            label: 'Mức phí (VNĐ)',
            name: 'amount',
            component: (
              <InputNumber<number>
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
                placeholder="Nhập giá dịch vụ ví dụ: 50000"
                min={0}
              />
            ),
            rules: [{ required: true, message: 'Vui lòng nhập giá dịch vụ' }],
            span: 24,
          },
        ]}
        loading={saveMutation.isLoading}
        onCancel={() => {
          setModalOpen(false)
          setEditingFee(null)
          form.resetFields()
        }}
        onOk={async () => {
          const values = await form.validateFields()
          saveMutation.mutate({
            id: editingFee?.id,
            houseId,
            serviceId: values.serviceId,
            amount: values.amount,
          })
        }}
        okText="Lưu"
        cancelText="Hủy"
        layout="vertical"
      />
    </>
  )
}
