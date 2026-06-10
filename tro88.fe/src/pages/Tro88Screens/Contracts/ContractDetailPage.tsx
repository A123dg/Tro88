import { useState } from 'react'
import { Button } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import {
  Card, PageHeader, Link, Badge, Timeline, ConfirmDialog,
  formatDate, formatVND, statusVariant, QK, ApiResponse
} from '../shared'

export function ContractDetailPage() {
  const id = window.location.pathname.split('/').pop()
  const role = localStorage.getItem('authRole')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { data: contractResp, isLoading, refetch } = useQuery(['contract', id], () =>
    api.get<unknown, ApiResponse<any>>(`/Contracts/${id}`)
  )
  const activate = useMutation(() => api.patch(`/Contracts/${id}/activate`), {
    onSuccess: () => {
      refetch()
      queryClient.invalidateQueries(QK.contracts)
      setConfirmOpen(false)
    },
  })

  if (isLoading || !contractResp?.data) {
    return <main className="page"><PageHeader title="Đang tải..." /></main>
  }

  const contract = contractResp.data
  const showSignButton =
    contract.status === 'Draft' &&
    ((role === 'Owner' && !contract.isOwnerSigned) ||
      (role === 'Tenant' && !contract.isTenantSigned) ||
      role === 'Admin')

  return (
    <main className="page">
      <PageHeader title={`Hợp đồng ${contract.contractCode}`} />
      <div className="split">
        <Card className="document">
          <h2>HỢP ĐỒNG THUÊ PHÒNG</h2>
          <p>Mã: #{contract.contractCode}</p>
          <h3>Thông tin hai bên</h3>
          <p>Bên thuê: <strong>{contract.tenantName}</strong> ({contract.tenantPhone} - {contract.tenantEmail})</p>
          <p>Phòng: <strong>P.{contract.roomNumber}</strong></p>
          <h3>Điều khoản</h3>
          <p>Thời hạn: {formatDate(contract.startDate)} - {formatDate(contract.endDate)}</p>
          <p>Giá thuê: {formatVND(contract.monthlyRent)}/tháng</p>
          <p>Tiền cọc: {formatVND(contract.depositAmount)}</p>
          <p>Thanh toán ngày {contract.paymentDayOfMonth} hàng tháng.</p>
          <div className="signatures" style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <strong>Chủ trọ</strong>
              <p style={{ color: contract.isOwnerSigned ? 'green' : 'gray', fontWeight: 'bold' }}>
                {contract.isOwnerSigned ? '✓ Đã xác nhận ký' : '○ Chờ ký'}
              </p>
            </div>
            <div>
              <strong>Người thuê</strong>
              <p style={{ color: contract.isTenantSigned ? 'green' : 'gray', fontWeight: 'bold' }}>
                {contract.isTenantSigned ? '✓ Đã xác nhận ký' : '○ Chờ ký'}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <Badge variant={statusVariant(contract.status)}>{contract.status}</Badge>
          <Timeline items={['Tạo hợp đồng nháp', 'Chờ hai bên ký', 'Kích hoạt', 'Kết thúc']} />
          <div className="actions vertical" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {showSignButton && (
              <Button loading={activate.isLoading} onClick={() => setConfirmOpen(true)}>
                Xác nhận ký
              </Button>
            )}
            <Link className="app-button app-button--outline" to={role === 'Tenant' ? '/my/rooms' : `/rooms/${contract.roomId}`}>Xem phòng</Link>
            {role !== 'Tenant' && (
              <Link className="app-button app-button--outline" to="/invoices">Xem hóa đơn</Link>
            )}
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận ký hợp đồng"
        content="Bạn có chắc chắn muốn xác nhận ký hợp đồng này không? Thao tác này sẽ ghi nhận chữ ký điện tử của bạn trên hệ thống."
        onConfirm={() => activate.mutate()}
        onCancel={() => setConfirmOpen(false)}
        confirmLoading={activate.isLoading}
      />
    </main>
  )
}
