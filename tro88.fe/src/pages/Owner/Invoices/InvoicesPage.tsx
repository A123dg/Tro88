import { Select, Form, Input, InputNumber } from 'antd'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { DataPage } from '../../../shared/components/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useInvoiceActions, useInvoices } from './hooks'
import { useColumn } from './hooks/useColumn'
import { InvoiceDto, ListFilters } from './service/types'
import ModalForm from '../../../shared/components/modal-form/ModalForm'

export function InvoicesPage() {
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10 })
  const query = useInvoices(filters)
  const actions = useInvoiceActions()

  // State for detail modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDto | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (selectedInvoice) {
      form.setFieldsValue({
        ...selectedInvoice,
        period: `${selectedInvoice.billingMonth}/${selectedInvoice.billingYear}`,
        dueDate: dayjs(selectedInvoice.dueDate).format('DD/MM/YYYY'),
        status: selectedInvoice.status === 'Paid' ? 'Đã thanh toán' : selectedInvoice.status === 'Unpaid' ? 'Chưa thanh toán' : 'Quá hạn',
      })
    } else {
      form.resetFields()
    }
  }, [selectedInvoice, form])

  const { columns } = useColumn({
    handleSend: (id) => actions.send.mutate(id),
    handleMarkPaid: (id) => actions.markPaid.mutate(id),
    onViewDetail: (item) => {
      setSelectedInvoice(item)
      setDetailModalOpen(true)
    },
  })

  const formItems = [
    {
      label: 'Mã hóa đơn',
      name: 'invoiceCode',
      component: <Input disabled style={{ color: '#000' }} />,
      span: 12,
    },
    {
      label: 'Kỳ thanh toán',
      name: 'period',
      component: <Input disabled style={{ color: '#000' }} />,
      span: 12,
    },
    {
      label: 'Tiền thuê phòng',
      name: 'rentAmount',
      component: (
        <InputNumber<number>
          style={{ width: '100%', color: '#000' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
          disabled
        />
      ),
      span: 12,
    },
    {
      label: 'Tiền điện',
      name: 'electricityAmount',
      component: (
        <InputNumber<number>
          style={{ width: '100%', color: '#000' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
          disabled
        />
      ),
      span: 12,
    },
    {
      label: 'Tiền nước',
      name: 'waterAmount',
      component: (
        <InputNumber<number>
          style={{ width: '100%', color: '#000' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
          disabled
        />
      ),
      span: 12,
    },
    {
      label: 'Tiền dịch vụ',
      name: 'serviceAmount',
      component: (
        <InputNumber<number>
          style={{ width: '100%', color: '#000' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
          disabled
        />
      ),
      span: 12,
    },
    {
      label: 'Tổng tiền',
      name: 'totalAmount',
      component: (
        <InputNumber<number>
          style={{ width: '100%', color: '#000', fontWeight: 'bold' }}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
          disabled
        />
      ),
      span: 12,
    },
    {
      label: 'Hạn thanh toán',
      name: 'dueDate',
      component: <Input disabled style={{ color: '#000' }} />,
      span: 12,
    },
    {
      label: 'Trạng thái',
      name: 'status',
      component: <Input disabled style={{ color: '#000' }} />,
      span: 12,
    },
    {
      label: 'Ghi chú',
      name: 'notes',
      component: <Input.TextArea disabled style={{ color: '#000' }} rows={3} />,
      span: 24,
    },
  ]

  return (
    <>
      <DataPage<InvoiceDto>
        title="Quản lý hóa đơn"
        subtitle="Theo dõi hóa đơn tiền phòng, điện nước, dịch vụ và trạng thái thanh toán."
        breadcrumb="Tro88 / Hóa đơn"
        items={query.data?.items ?? []}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
        actions={
          <Select
            value={filters.status ?? ''}
            onChange={(value) => setFilters({ ...filters, status: value || undefined, page: 1 })}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'Unpaid', label: 'Chưa thanh toán' },
              { value: 'Paid', label: 'Đã thanh toán' },
              { value: 'Overdue', label: 'Quá hạn' },
            ]}
          />
        }
        columns={columns}
      />

      <ModalForm
        open={detailModalOpen}
        title="Chi tiết hóa đơn"
        form={form}
        formItems={formItems}
        onCancel={() => {
          setDetailModalOpen(false)
          setSelectedInvoice(null)
        }}
        onOk={() => {
          setDetailModalOpen(false)
          setSelectedInvoice(null)
        }}
        okText="Đóng"
        cancelButtonProps={{ style: { display: 'none' } }}
      />
    </>
  )
}
