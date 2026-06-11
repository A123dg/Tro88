import { useRouterState } from '@tanstack/react-router'
import { UploadOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse } from '../../../services/houseService'
import { fetchInvoices, notifyInvoicePayment } from '../../../services/managementService'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import { useNotification } from '../../../hooks/useNotification'
import {
  AreaChartLite, Badge, Button, Card, DataTable, EmptyState, FormShell, Illustration, Link, navigateTo,
  MaintenanceCard, MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance,  Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'

export function InvoicesPage() {
  const [selected, setSelected] = useState<string[]>([])
  const counts = useMemo(() => ({ paid: invoices.filter((item) => item.status === 'Paid').length, unpaid: invoices.filter((item) => item.status === 'Unpaid').length, overdue: invoices.filter((item) => item.status === 'Overdue').length }), [])
  return (
    <main className="page">
      <PageHeader title="Hóa đơn tháng 05/2026" subtitle="Tạo, gửi, đánh dấu thanh toán và xuất PDF." action={<div className="actions"><Link className="app-button app-button--outline" to="/invoices/bulk">Tạo hàng loạt</Link><Link className="app-button app-button--primary" to="/invoices/create">Tạo hóa đơn</Link></div>} />
      <div className="stat-grid"><Card><span>Tổng</span><strong>{invoices.length}</strong></Card><Card><span>Đã TT</span><strong>{counts.paid}</strong></Card><Card><span>Chưa TT</span><strong>{counts.unpaid}</strong></Card><Card><span>Quá hạn</span><strong>{counts.overdue}</strong></Card></div>
      {selected.length ? <Card className="bulk-bar">Gửi {selected.length} hóa đơn được chọn <Button variant="outline">Gửi hàng loạt</Button></Card> : null}
      <DataTable headers={['', 'Mã', 'Phòng', 'Tenant', 'Tiền thuê', 'Điện', 'Nước', 'DV', 'Tổng', 'Hạn TT', 'Trạng thái', 'Hành động']} rows={invoices.map((item) => [<input type="checkbox" checked={selected.includes(item.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} />, item.code, item.room, item.tenant, formatVND(item.rent), formatVND(item.electricity), formatVND(item.water), formatVND(item.service), formatVND(total(item)), formatDate(item.dueDate), <Badge variant={statusVariant(item.status)}>{item.status}</Badge>, <div className="actions"><Link to={`/invoices/${item.id}`}>Xem</Link><Button variant="ghost">Gửi</Button><Button variant="outline">Đã TT</Button></div>])} />
    </main>
  )
}

export function InvoiceDetailPage() {
  const routerState = useRouterState()
  const isOwner = routerState.location.pathname.startsWith('/invoices')
  const invoice = invoices.find((item) => item.id === pageId('i1')) ?? invoices[0]
  const { showSuccessNotify } = useNotification()
  const [status, setStatus] = useState(invoice.status)

  const handleConfirmTransfer = () => {
    invoice.status = 'Paid'
    setStatus('Paid')
    showSuccessNotify('Xác nhận chuyển khoản thành công! Hóa đơn đã được ghi nhận thanh toán.')
  }

  const handleNotifyTransfer = () => {
    invoice.status = 'WaitingConfirm'
    setStatus('WaitingConfirm')
    showSuccessNotify('Đã gửi thông báo chuyển khoản thành công! Chờ chủ trọ xác nhận.')
  }

  return (
    <main className="page">
      <PageHeader title={`Hóa đơn ${invoice.code}`} />
      <div className="split">
        <Card className="document">
          <h2>HÓA ĐƠN TIỀN NHÀ</h2>
          <p>Mã: #{invoice.code}</p>
          <p>Người thuê: {invoice.tenant} - Phòng {invoice.room}</p>
          <DataTable 
            headers={['STT', 'Khoản', 'Đơn giá', 'SL', 'Thành tiền']} 
            rows={[
              [1, 'Tiền thuê phòng', formatVND(invoice.rent), 1, formatVND(invoice.rent)], 
              [2, 'Tiền điện', '3.800đ', 120, formatVND(invoice.electricity)], 
              [3, 'Tiền nước', '18.000đ', 7, formatVND(invoice.water)], 
              [4, 'Dịch vụ', formatVND(invoice.service), 1, formatVND(invoice.service)]
            ]} 
          />
          <strong className="money">Tổng cộng: {formatVND(total(invoice))}</strong>
          {isOwner && <div className="qr">QR</div>}
          <p>TK ngân hàng: 0123456789 - Tro88</p>
        </Card>
        <Card>
          <Badge variant={statusVariant(status)}>{status}</Badge>
          <Timeline items={['Tạo', 'Gửi', 'Đến hạn', 'Thanh toán']} />
          <div className="actions vertical">
            {isOwner ? (
              <>
                {status !== 'Paid' && (
                  <Button variant="primary" onClick={handleConfirmTransfer}>Xác nhận chuyển khoản</Button>
                )}
                <Button>Gửi email</Button>
                <Button variant="secondary">Đánh dấu đã TT</Button>
              </>
            ) : (
              <>
                {status === 'Unpaid' || status === 'Overdue' ? (
                  <Button variant="primary" onClick={handleNotifyTransfer}>Thông báo chuyển khoản</Button>
                ) : null}
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}

export function InvoiceCreatePage() {
  return <SimpleFormPage title="Tạo hóa đơn" fields={['Hợp đồng', 'Tháng', 'Tiền thuê', 'Tiền điện', 'Tiền nước', 'Dịch vụ', 'Hạn thanh toán', 'Ghi chú']} />
}

export function InvoiceBulkPage() {
  return (
    <main className="page">
      <PageHeader title="Tạo hóa đơn hàng loạt T05/2026" subtitle="Chọn nhà, nhập chỉ số mới, xem trước và tạo hóa đơn." />
      <Card><h2>Chỉ số điện nước</h2><UtilityTable /><div className="footer-actions"><span>3/3 phòng đã nhập</span><Button variant="outline">Xem trước</Button><Button>Tạo 3 hóa đơn</Button></div></Card>
    </main>
  )
}

export function MyInvoicesPage() {
  const { showSuccessNotify, showErrorNotify } = useNotification()

  const { data: invoicesData, isLoading, refetch } = useQuery(
    ['tenant-invoices'],
    () => fetchInvoices(),
    {
      keepPreviousData: true,
    }
  )

  const list = invoicesData?.items ?? []
  const invoice = list[0]

  const notifyMutation = useMutation(
    (id: string) => notifyInvoicePayment(id),
    {
      onSuccess: () => {
        showSuccessNotify('Đã gửi thông báo chuyển khoản thành công! Chờ chủ trọ xác nhận.')
        refetch()
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Có lỗi xảy ra khi thông báo chuyển khoản.')
      }
    }
  )

  if (isLoading) {
    return (
      <section className="tenant-page">
        <h1>Hóa đơn của tôi</h1>
        <Card className="tenant-room-card" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          Đang tải thông tin...
        </Card>
      </section>
    )
  }

  if (!invoice) {
    return (
      <section className="tenant-page">
        <h1>Hóa đơn của tôi</h1>
        <EmptyState title="Không có hóa đơn" description="Hiện tại bạn chưa có hóa đơn nào." />
      </section>
    )
  }

  const status = invoice.status

  const handleNotifyTransfer = () => {
    notifyMutation.mutate(invoice.id)
  }

  return (
    <section className="tenant-page">
      <h1>Hóa đơn của tôi</h1>
      <Card className="tenant-room-card">
        <Badge variant={statusVariant(status as any)}>{status}</Badge>
        <strong className="money danger">{formatVND(invoice.totalAmount)}</strong>
        <p>Hạn TT: {formatDate(invoice.dueDate)}</p>
        <details open>
          <summary>Chi tiết</summary>
          <p>Tiền thuê {formatVND(invoice.rentAmount)}</p>
          <p>Điện {formatVND(invoice.electricityAmount)}</p>
          <p>Nước {formatVND(invoice.waterAmount)}</p>
          <p>Dịch vụ {formatVND(invoice.serviceAmount)}</p>
        </details>
        {(status === 'Unpaid' || status === 'Overdue') ? (
          <Button full onClick={handleNotifyTransfer} loading={notifyMutation.isLoading}>
            Thông báo chuyển khoản
          </Button>
        ) : null}
      </Card>
      <Card>
        <h2>Lịch sử</h2>
        {list.map((item) => (
          <details key={item.id}>
            <summary>T{item.billingMonth}/{item.billingYear} • {formatVND(item.totalAmount)} • {item.status}</summary>
            <Link to={`/my/invoices/${item.id}`}>Xem chi tiết</Link>
          </details>
        ))}
      </Card>
    </section>
  )
}


