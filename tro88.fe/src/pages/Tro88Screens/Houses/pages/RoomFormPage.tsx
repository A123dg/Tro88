import { Form, Input, InputNumber, Checkbox, Button, Flex, Card, Row, Col, Upload } from 'antd'
import { ArrowLeftOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useMutation } from 'react-query'
import { PageHeader, rooms, ok } from '../../shared'
import { useState } from 'react'

export function RoomFormPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const roomId = params.id || null
  const isEdit = Boolean(roomId)
  const [selectedFiles, setSelectedFiles] = useState<any[]>([])

  const [form] = Form.useForm()
  const save = useMutation(() => ok({}), {
    onSuccess: () => navigate({ to: '/houses/detail/h1/rooms' as any })
  })

  const fallbackRoom = {
    id: '',
    houseId: '',
    roomNumber: '',
    floor: 1,
    area: 24,
    maxOccupants: 2,
    monthlyRent: 3500000,
    depositAmount: 3500000,
    description: '',
    electricityUnitPrice: 3800,
    waterUnitPrice: 18000,
    status: 'Available',
  }
  const roomData = isEdit ? (rooms.find((r) => r.id === roomId) ?? fallbackRoom as any) : null

  const onFinish = () => {
    save.mutate()
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader
        title={isEdit ? 'Sửa phòng' : 'Thêm phòng'}
        subtitle="Thông tin cơ bản, tiện nghi, đơn giá điện nước và ảnh."
        action={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: '/houses/detail/h1/rooms' as any })}>
            Quay lại
          </Button>
        }
      />

      <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={
            roomData
              ? {
                  roomNumber: roomData.roomNumber,
                  floor: roomData.floor,
                  area: roomData.area,
                  maxOccupants: roomData.maxOccupants,
                  monthlyRent: roomData.monthlyRent,
                  depositAmount: roomData.depositAmount,
                  description: roomData.description,
                  electricityUnitPrice: roomData.electricityUnitPrice,
                  waterUnitPrice: roomData.waterUnitPrice,
                }
              : fallbackRoom
          }
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số phòng"
                name="roomNumber"
                rules={[{ required: true, message: 'Vui lòng nhập số phòng' }]}
              >
                <Input placeholder="Ví dụ: 101, 102" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tầng"
                name="floor"
                rules={[{ required: true, message: 'Vui lòng nhập số tầng' }]}
              >
                <InputNumber min={1} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Diện tích (m²)" name="area">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Số người tối đa" name="maxOccupants">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Giá thuê (đ/tháng)"
                name="monthlyRent"
                rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tiền cọc (đ)"
                name="depositAmount"
                rules={[{ required: true, message: 'Vui lòng nhập tiền cọc' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về phòng" />
          </Form.Item>

          <Form.Item label="Tiện ích phòng có sẵn">
            <Row>
              <Col span={8}><Checkbox>Điều hòa</Checkbox></Col>
              <Col span={8}><Checkbox>Bình nóng lạnh</Checkbox></Col>
              <Col span={8}><Checkbox>Tủ quần áo</Checkbox></Col>
              <Col span={8}><Checkbox style={{ marginTop: '8px' }}>Giường</Checkbox></Col>
              <Col span={8}><Checkbox style={{ marginTop: '8px' }}>Khu bếp riêng</Checkbox></Col>
              <Col span={8}><Checkbox style={{ marginTop: '8px' }}>Ban công</Checkbox></Col>
            </Row>
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Đơn giá điện (đ/kWh)" name="electricityUnitPrice">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Đơn giá nước (đ/m³)" name="waterUnitPrice">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Hình ảnh phòng">
            <Upload
              beforeUpload={(file) => {
                setSelectedFiles((current) => [...current, file])
                return false
              }}
              multiple
              fileList={selectedFiles.map((file, idx) => ({
                uid: String(idx),
                name: file.name,
                status: 'done',
              }))}
              onRemove={(file) => {
                const index = Number(file.uid)
                setSelectedFiles((current) => current.filter((_, idx) => idx !== index))
              }}
              maxCount={5}
            >
              <Button icon={<UploadOutlined />}>Upload ảnh phòng (Tối đa 5 ảnh)</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Flex gap="12px" justify="end">
              <Button onClick={() => navigate({ to: '/houses/detail/h1/rooms' as any })}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={save.isLoading}
                icon={<SaveOutlined />}
                style={{ background: '#f4845f', borderColor: '#f4845f' }}
              >
                Lưu lại
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
