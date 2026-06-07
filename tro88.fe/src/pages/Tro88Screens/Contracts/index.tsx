import { useRouterState } from '@tanstack/react-router'
import { UploadOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select, InputNumber, Alert, Spin, message } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse, fetchHouses } from '../../../services/houseService'
import { fetchRooms } from '../../../services/roomService'
import { fetchCurrentUser, checkEmailExists } from '../../../services/userService'
import { createContract } from '../../../services/managementService'
import dayjs from 'dayjs'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import { CustomDatePicker } from '../../../shared/components/custom-datepicker'
import {
  AreaChartLite, Badge, Button, Card, DataTable, EmptyState, FormShell, Illustration, Link, navigateTo,
  MaintenanceCard, MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK, ApiResponse, ConfirmDialog,
} from '../shared'

export function ContractsPage() {
  const [status, setStatus] = useState('all')
  const activate = useMutation((id: string) => ok(id), { onSuccess: () => queryClient.invalidateQueries(QK.contracts) })
  const rows = contracts.filter((item) => status === 'all' || item.status === status)
  return (
    <main className="page">
      <PageHeader title="Hợp đồng" subtitle="Theo dõi hợp đồng nháp, hiệu lực, sắp hết hạn và đã kết thúc." action={<Link className="app-button app-button--primary" to="/contracts/create">Tạo hợp đồng</Link>} />
      <div className="tabs">{['all', 'Draft', 'Active', 'Expired', 'Terminated'].map((item) => <button key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item === 'all' ? 'Tất cả' : item}</button>)}</div>
      <DataTable headers={['Mã HĐ', 'Tenant', 'Phòng', 'Ngày BĐ', 'Ngày KT', 'Tiền thuê', 'Trạng thái', 'Hành động']} rows={rows.map((item) => [item.code, item.tenant, item.room, formatDate(item.startDate), formatDate(item.endDate), formatVND(item.rent), <Badge variant={statusVariant(item.status)}>{item.status}</Badge>, <div className="actions"><Link to={`/contracts/${item.id}`}>Xem</Link>{item.status === 'Draft' ? <Button variant="outline" loading={activate.isLoading} onClick={() => activate.mutate(item.id)}>Ký duyệt</Button> : null}<Button variant="ghost">Kết thúc</Button></div>])} />
    </main>
  )
}

export function ContractCreatePage() {
  const role = localStorage.getItem('authRole')
  
  if (role !== 'Owner') {
    return (
      <main className="page">
        <PageHeader title="Không có quyền truy cập" subtitle="Chỉ chủ trọ (Owner) mới có quyền tạo hợp đồng mới." />
        <Card>
          <p style={{ marginBottom: '20px' }}>Bạn không có quyền truy cập trang này. Vui lòng quay lại trang danh sách hợp đồng.</p>
          <Button onClick={() => navigateTo('/contracts')}>Quay lại</Button>
        </Card>
      </main>
    )
  }

  const [step, setStep] = useState(1)
  const [selectedHouseId, setSelectedHouseId] = useState<string>('')
  const [selectedRoomId, setSelectedRoomId] = useState<string>('')
  
  const [tenantEmail, setTenantEmail] = useState('')
  const [verifiedTenant, setVerifiedTenant] = useState<any>(null)
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [monthlyRent, setMonthlyRent] = useState<number>(0)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [paymentDay, setPaymentDay] = useState<number>(5)
  const [terms, setTerms] = useState<string>('')
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  const { data: housesResp, isLoading: loadingHouses } = useQuery('owner-houses', () => fetchHouses({ page: 1, pageSize: 100 }))
  const { data: currentUserResp } = useQuery('current-user', () => fetchCurrentUser())
  const { data: roomsResp, isLoading: loadingRooms } = useQuery(
    ['house-rooms', selectedHouseId],
    () => fetchRooms(selectedHouseId),
    { enabled: !!selectedHouseId }
  )

  const owner = currentUserResp?.data
  const housesList = housesResp?.items ?? []
  const roomsList = roomsResp?.data ?? []

  useEffect(() => {
    if (selectedRoomId && roomsList.length > 0) {
      const room = roomsList.find((r: any) => r.id === selectedRoomId)
      if (room) {
        setMonthlyRent(room.monthlyRent)
        setDepositAmount(room.depositAmount)
      }
    }
  }, [selectedRoomId, roomsList])

  const verifyEmail = async () => {
    if (!tenantEmail || !tenantEmail.trim()) {
      setVerificationError('Vui lòng nhập email để kiểm tra')
      return
    }
    setVerifyingEmail(true)
    setVerificationError('')
    setVerifiedTenant(null)
    try {
      const res = await checkEmailExists(tenantEmail.trim())
      if (res.success && res.data) {
        setVerifiedTenant(res.data)
        message.success('Tìm thấy tài khoản người thuê trong hệ thống!')
      } else {
        setVerificationError(res.message || 'Email này không tồn tại trong hệ thống. Không thể tạo hợp đồng.')
      }
    } catch (err: any) {
      setVerificationError(err?.response?.data?.message || 'Email này không tồn tại trong hệ thống. Không thể tạo hợp đồng.')
    } finally {
      setVerifyingEmail(false)
    }
  }

  const save = useMutation(
    () =>
      createContract({
        roomId: selectedRoomId,
        tenantId: verifiedTenant?.id,
        startDate: dayjs(startDate).toISOString(),
        endDate: dayjs(endDate).toISOString(),
        monthlyRent,
        depositAmount,
        paymentDay,
        terms: terms || null,
      }),
    {
      onSuccess: () => {
        message.success('Tạo hợp đồng thành công!')
        queryClient.invalidateQueries(QK.contracts)
        navigateTo('/contracts')
      },
      onError: (err: any) => {
        message.error(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo hợp đồng.')
      },
    }
  )

  const selectedHouseName = housesList.find((h: any) => h.id === selectedHouseId)?.name ?? ''
  const selectedRoomNumber = roomsList.find((r: any) => r.id === selectedRoomId)?.roomNumber ?? ''

  const handleNext = () => {
    if (step === 1) {
      if (!selectedHouseId) {
        message.warning('Vui lòng chọn nhà trọ')
        return
      }
      if (!selectedRoomId) {
        message.warning('Vui lòng chọn phòng')
        return
      }
      if (!verifiedTenant) {
        message.warning('Vui lòng kiểm tra email người thuê hợp lệ trước khi tiếp tục')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!startDate) {
        message.warning('Vui lòng chọn ngày bắt đầu')
        return
      }
      if (!endDate) {
        message.warning('Vui lòng chọn ngày kết thúc')
        return
      }
      if (dayjs(endDate).isBefore(dayjs(startDate))) {
        message.warning('Ngày kết thúc phải sau ngày bắt đầu')
        return
      }
      if (monthlyRent <= 0) {
        message.warning('Giá thuê phải lớn hơn 0')
        return
      }
      setStep(3)
    }
  }

  return (
    <main className="page">
      <PageHeader title="Tạo hợp đồng mới" subtitle="Nhập thông tin, kiểm tra email người thuê và thiết lập các điều khoản thuê phòng." />
      
      <div className="wizard" style={{ marginBottom: '24px' }}>
        <span style={{ width: `${step * 33.33}%`, transition: 'width 0.3s ease' }} />
      </div>

      <Card>
        <h2 style={{ marginBottom: '20px' }}>
          Bước {step}: {step === 1 ? 'Chọn phòng & Người thuê' : step === 2 ? 'Thiết lập điều khoản' : 'Xác nhận & Hoàn tất'}
        </h2>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px' }}>1. Thông tin Chủ phòng (Tự động điền)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#666' }}>Họ tên chủ nhà</label>
                  <Input value={owner?.fullName || 'Đang tải...'} disabled />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#666' }}>Số điện thoại</label>
                  <Input value={owner?.phoneNumber || 'Không có'} disabled />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#666' }}>Email</label>
                  <Input value={owner?.email || 'Không có'} disabled />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '12px' }}>2. Chọn phòng thuê</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Nhà trọ</label>
                    <Select
                      placeholder="Chọn nhà trọ"
                      style={{ width: '100%' }}
                      loading={loadingHouses}
                      value={selectedHouseId || undefined}
                      onChange={(val: string) => {
                        setSelectedHouseId(val)
                        setSelectedRoomId('')
                      }}
                      options={housesList.map((h: any) => ({ value: h.id, label: h.name }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Phòng</label>
                    <Select
                      placeholder={selectedHouseId ? 'Chọn phòng' : 'Vui lòng chọn nhà trọ trước'}
                      style={{ width: '100%' }}
                      disabled={!selectedHouseId}
                      loading={loadingRooms}
                      value={selectedRoomId || undefined}
                      onChange={(val: string) => setSelectedRoomId(val)}
                      options={roomsList.map((r: any) => ({
                        value: r.id,
                        label: `Phòng ${r.roomNumber} - ${r.status === 'Available' ? 'Trống' : r.status === 'Occupied' ? 'Đã thuê' : 'Bảo trì'} (${formatVND(r.monthlyRent)}/tháng)`,
                        disabled: r.status !== 'Available',
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ marginTop: 0, marginBottom: '12px' }}>3. Thông tin người thuê (Tenant)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px' }}>Email người thuê trong hệ thống <span style={{ color: 'red' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Input
                        placeholder="Nhập email người thuê"
                        value={tenantEmail}
                        onChange={(e) => {
                          setTenantEmail(e.target.value)
                          setVerifiedTenant(null)
                          setVerificationError('')
                        }}
                      />
                      <button
                        type="button"
                        className="button button--secondary"
                        style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px', height: '32px' }}
                        onClick={verifyEmail}
                        disabled={verifyingEmail}
                      >
                        {verifyingEmail ? <Spin size="small" /> : <SearchOutlined />} Kiểm tra
                      </button>
                    </div>
                  </div>

                  {verificationError && (
                    <Alert
                      message={verificationError}
                      type="error"
                      showIcon
                      icon={<ExclamationCircleOutlined />}
                    />
                  )}

                  {verifiedTenant && (
                    <div style={{ background: '#e6f7ff', padding: '12px', borderRadius: '6px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1890ff', fontWeight: 'bold', marginBottom: '6px' }}>
                        <CheckCircleOutlined /> Người dùng hợp lệ
                      </div>
                      <p style={{ margin: '2px 0' }}>Họ tên: <strong>{verifiedTenant.fullName}</strong></p>
                      <p style={{ margin: '2px 0' }}>SĐT: <strong>{verifiedTenant.phoneNumber || 'Không có'}</strong></p>
                      <p style={{ margin: '2px 0' }}>CCCD/CMND: <strong>{verifiedTenant.nationalId || 'Chưa cập nhật'}</strong></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Ngày bắt đầu hợp đồng <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="date"
                  className="antd-input"
                  style={{ width: '100%', padding: '6px 11px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Ngày kết thúc hợp đồng <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="date"
                  className="antd-input"
                  style={{ width: '100%', padding: '6px 11px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Ngày đóng tiền hàng tháng <span style={{ color: 'red' }}>*</span></label>
                <Select
                  style={{ width: '100%' }}
                  value={paymentDay}
                  onChange={(val: number) => setPaymentDay(val)}
                  options={Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `Ngày ${i + 1} hàng tháng` }))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Giá thuê hàng tháng (VNĐ) <span style={{ color: 'red' }}>*</span></label>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={monthlyRent}
                  onChange={(val: any) => setMonthlyRent(val || 0)}
                  formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Tiền đặt cọc (VNĐ) <span style={{ color: 'red' }}>*</span></label>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  value={depositAmount}
                  onChange={(val: any) => setDepositAmount(val || 0)}
                  formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: any) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Điều khoản đặc biệt (nếu có)</label>
                <Input.TextArea
                  rows={4}
                  placeholder="Nhập các điều khoản bổ sung khác..."
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: '8px', padding: '20px', background: '#fafafa' }}>
              <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px', color: '#1890ff' }}>Tóm tắt thông tin hợp đồng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <div>
                  <p style={{ margin: '4px 0' }}>Nhà trọ: <strong>{selectedHouseName}</strong></p>
                  <p style={{ margin: '4px 0' }}>Phòng: <strong>Phòng {selectedRoomNumber}</strong></p>
                  <p style={{ margin: '4px 0' }}>Chủ nhà: <strong>{owner?.fullName}</strong> ({owner?.phoneNumber || 'N/A'})</p>
                  <p style={{ margin: '4px 0' }}>Người thuê: <strong>{verifiedTenant?.fullName}</strong> ({verifiedTenant?.phoneNumber || 'N/A'})</p>
                  <p style={{ margin: '4px 0' }}>Email người thuê: <strong>{verifiedTenant?.email}</strong></p>
                </div>
                <div>
                  <p style={{ margin: '4px 0' }}>Thời hạn thuê: <strong>{dayjs(startDate).format('DD/MM/YYYY')}</strong> đến <strong>{dayjs(endDate).format('DD/MM/YYYY')}</strong></p>
                  <p style={{ margin: '4px 0' }}>Tiền thuê: <strong style={{ color: '#52c41a' }}>{formatVND(monthlyRent)} / tháng</strong></p>
                  <p style={{ margin: '4px 0' }}>Tiền đặt cọc: <strong style={{ color: '#1890ff' }}>{formatVND(depositAmount)}</strong></p>
                  <p style={{ margin: '4px 0' }}>Ngày thanh toán: <strong>Ngày {paymentDay} hàng tháng</strong></p>
                  {terms && <p style={{ margin: '4px 0' }}>Điều khoản bổ sung: <span style={{ color: '#666', fontStyle: 'italic' }}>{terms}</span></p>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <input
                type="checkbox"
                id="confirm-checkbox"
                checked={confirmSubmit}
                onChange={(e) => setConfirmSubmit(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="confirm-checkbox" style={{ cursor: 'pointer', fontWeight: '500' }}>
                Tôi xác nhận các thông tin trên là chính xác và muốn tạo bản nháp hợp đồng này.
              </label>
            </div>
          </div>
        )}

        <div className="actions footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Quay lại
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext}>
              Tiếp tục
            </Button>
          ) : (
            <button
              type="button"
              className="app-button app-button--primary"
              disabled={!confirmSubmit}
              onClick={() => {
                if (confirmSubmit) save.mutate()
              }}
              style={{
                opacity: confirmSubmit ? 1 : 0.6,
                cursor: confirmSubmit ? 'pointer' : 'not-allowed',
                border: 'none',
                padding: '0 20px',
                height: '38px',
                borderRadius: '6px',
                fontWeight: '500',
                color: '#fff',
                backgroundColor: '#1890ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
            >
              {save.isLoading ? 'Đang xử lý...' : 'Tạo hợp đồng'}
            </button>
          )}
        </div>
      </Card>
    </main>
  )
}

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

export function ContractTenantsPage() {
  return <SimplePage title="Người trong phòng" subtitle="Danh sách tenant, CCCD, số điện thoại và ngày vào phòng." />
}


