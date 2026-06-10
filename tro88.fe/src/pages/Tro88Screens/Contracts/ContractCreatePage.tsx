import { useEffect, useState } from 'react'
import { CheckCircleOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons'
import { Input, Select, InputNumber, Alert, message, Button, Checkbox, Typography } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { queryClient } from '../../../queryClient'
import { fetchHouses } from '../../../services/houseService'
import { fetchRooms } from '../../../services/roomService'
import { fetchCurrentUser, checkEmailExists } from '../../../services/userService'
import { createContract } from '../../../services/managementService'
import dayjs from 'dayjs'
import { CustomDatePicker } from '../../../shared/components/custom-datepicker'
import { Card, PageHeader, navigateTo, formatVND, QK } from '../shared'

const { Title, Paragraph, Text } = Typography

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
                      <Button
                        type="default"
                        icon={verifyingEmail ? null : <SearchOutlined />}
                        loading={verifyingEmail}
                        onClick={verifyEmail}
                      >
                        Kiểm tra
                      </Button>
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
                      <Paragraph style={{ margin: '2px 0' }}>Họ tên: <Text strong>{verifiedTenant.fullName}</Text></Paragraph>
                      <Paragraph style={{ margin: '2px 0' }}>SĐT: <Text strong>{verifiedTenant.phoneNumber || 'Không có'}</Text></Paragraph>
                      <Paragraph style={{ margin: '2px 0' }}>CCCD/CMND: <Text strong>{verifiedTenant.nationalId || 'Chưa cập nhật'}</Text></Paragraph>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Ngày bắt đầu hợp đồng <span style={{ color: 'red' }}>*</span></label>
              <CustomDatePicker
                style={{ width: '100%' }}
                value={startDate ? dayjs(startDate) : null}
                onChange={(date) => setStartDate(date ? date.format('YYYY-MM-DD') : '')}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Giá thuê hàng tháng (VNĐ) <span style={{ color: 'red' }}>*</span></label>
              <InputNumber
                style={{ width: '100%', maxWidth: 'none' }}
                min={0}
                value={monthlyRent}
                onChange={(val: any) => setMonthlyRent(val || 0)}
                formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: any) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Ngày kết thúc hợp đồng <span style={{ color: 'red' }}>*</span></label>
              <CustomDatePicker
                style={{ width: '100%' }}
                value={endDate ? dayjs(endDate) : null}
                onChange={(date) => setEndDate(date ? date.format('YYYY-MM-DD') : '')}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Tiền đặt cọc (VNĐ) <span style={{ color: 'red' }}>*</span></label>
              <InputNumber
                style={{ width: '100%', maxWidth: 'none' }}
                min={0}
                value={depositAmount}
                onChange={(val: any) => setDepositAmount(val || 0)}
                formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: any) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
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
            <div>
              <label style={{ display: 'block', marginBottom: '4px' }}>Điều khoản đặc biệt (nếu có)</label>
              <Input.TextArea
                style={{ width: '100%' }}
                rows={4}
                placeholder="Nhập các điều khoản bổ sung khác..."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: '8px', padding: '20px', background: '#fafafa' }}>
              <Title level={4} style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '8px', color: '#1890ff' }}>Tóm tắt thông tin hợp đồng</Title>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <div>
                  <Paragraph style={{ margin: '4px 0' }}>Nhà trọ: <Text strong>{selectedHouseName}</Text></Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>Phòng: <Text strong>Phòng {selectedRoomNumber}</Text></Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>Chủ nhà: <Text strong>{owner?.fullName}</Text> ({owner?.phoneNumber || 'N/A'})</Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>Người thuê: <Text strong>{verifiedTenant?.fullName}</Text> ({verifiedTenant?.phoneNumber || 'N/A'})</Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>Email người thuê: <Text strong>{verifiedTenant?.email}</Text></Paragraph>
                </div>
                <div>
                  <Paragraph style={{ margin: '4px 0' }}>Thời hạn thuê: <Text strong>{dayjs(startDate).format('DD/MM/YYYY')}</Text> đến <Text strong>{dayjs(endDate).format('DD/MM/YYYY')}</Text></Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>Tiền thuê: <Text strong style={{ color: '#52c41a' }}>{formatVND(monthlyRent)} / tháng</Text></Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>Tiền đặt cọc: <Text strong style={{ color: '#1890ff' }}>{formatVND(depositAmount)}</Text></Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>Ngày thanh toán: <Text strong>Ngày {paymentDay} hàng tháng</Text></Paragraph>
                  {terms && <Paragraph style={{ margin: '4px 0' }}>Điều khoản bổ sung: <Text type="secondary" italic>{terms}</Text></Paragraph>}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '10px' }}>
              <Checkbox
                checked={confirmSubmit}
                onChange={(e) => setConfirmSubmit(e.target.checked)}
              >
                Tôi xác nhận các thông tin trên là chính xác và muốn tạo bản nháp hợp đồng này.
              </Checkbox>
            </div>
          </div>
        )}

        <div className="actions footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
          {step > 1 && (
            <Button onClick={() => setStep(step - 1)}>
              Quay lại
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="primary"
              onClick={handleNext}
              style={{ background: '#f4845f', borderColor: '#f4845f' }}
            >
              Tiếp tục
            </Button>
          ) : (
            <Button
              type="primary"
              disabled={!confirmSubmit}
              loading={save.isLoading}
              onClick={() => {
                if (confirmSubmit) save.mutate()
              }}
              style={{ background: '#1890ff', borderColor: '#1890ff' }}
            >
              Tạo hợp đồng
            </Button>
          )}
        </div>
      </Card>
    </main>
  )
}
