import { useEffect, useState } from 'react'
import { fetchCurrentUser, updateCurrentUser } from '../../services/userService'
import { UserDto } from '../../types/app.types'
import dayjs from 'dayjs'
import { Form, Input, Button, Card, Typography, Spin, Alert } from 'antd'
import { CustomDatePicker } from '../../shared/components/custom-datepicker'

const { Title, Paragraph, Text } = Typography

function getDefaultRedirect(role?: string) {
  if (role === 'Tenant') return '/my/rooms'
  if (role === 'Admin') return '/admin'
  return '/dashboard'
}

function CompleteProfilePageInner() {
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form] = Form.useForm()

  useEffect(() => {
    fetchCurrentUser()
      .then((response) => {
        const current = response.data
        setUser(current)
        form.setFieldsValue({
          fullName: current.fullName ?? '',
          email: current.email ?? '',
          phoneNumber: current.phoneNumber ?? '',
          dateOfBirth: current.dateOfBirth ? dayjs(current.dateOfBirth) : null
        })
      })
      .catch(() => setError('Không thể tải thông tin tài khoản.'))
      .finally(() => setLoading(false))
  }, [form])

  const onFinish = (values: any) => {
    setError('')
    setSaving(true)

    const formattedDob = values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : ''

    updateCurrentUser({
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
      dateOfBirth: formattedDob || undefined
    })
      .then((response) => {
        localStorage.setItem('authFullName', response.data.fullName)
        window.location.href = getDefaultRedirect(response.data.role)
      })
      .catch(() => setError('Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại thông tin.'))
      .finally(() => setSaving(false))
  }

  return (
    <Card 
      className="complete-profile-card"
      style={{ width: '100%', maxWidth: '480px', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
    >
      <div className="login-panel__brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#f4845f' }}>88</span>
        <div>
          <Title level={4} style={{ margin: 0, color: '#f4845f' }}>Tro88</Title>
          <Text type="secondary"><small>Hoàn thiện hồ sơ</small></Text>
        </div>
      </div>
      <header style={{ marginBottom: '24px' }}>
        <Title level={3} style={{ marginTop: 0, marginBottom: '8px' }}>Thông tin cá nhân</Title>
        <Paragraph type="secondary">Cập nhật họ tên, số điện thoại và ngày sinh trước khi tiếp tục.</Paragraph>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spin size="large" tip="Đang tải hồ sơ..." />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark="optional"
        >
          <Form.Item
            label="Họ tên"
            name="fullName"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input size="large" placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
          >
            <Input size="large" disabled />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input size="large" placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            label="Ngày sinh"
            name="dateOfBirth"
          >
            <CustomDatePicker 
              style={{ width: '100%' }}
              size="large"
              placeholder="Chọn ngày sinh" 
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          {error && (
            <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} />
          )}

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving} 
              block 
              size="large"
              style={{ background: '#f4845f', borderColor: '#f4845f' }}
            >
              Tiếp tục
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  )
}

export function CompleteProfilePage() {
  return (
    <main className="auth-layout" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
      <CompleteProfilePageInner />
    </main>
  )
}

