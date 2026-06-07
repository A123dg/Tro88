import { Form, Input, InputNumber, Checkbox, Button, Flex, Card, Row, Col } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useMutation } from 'react-query'
import { PageHeader, rooms, ok } from '../../shared'

export function RoomFormPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const roomId = params.id || null
  const isEdit = Boolean(roomId)

  const [form] = Form.useForm()
  const save = useMutation(() => ok({}), {
    onSuccess: () => navigate({ to: '/houses/detail/h1/rooms' as any })
  })

  const roomData = isEdit ? (rooms.find((r) => r.id === roomId) ?? rooms[0]) : null

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
              : {
                  floor: 1,
                  area: 24,
                  maxOccupants: 2,
                  monthlyRent: 3500000,
                  depositAmount: 3500000,
                  electricityUnitPrice: 3800,
                  waterUnitPrice: 18000,
                }
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
                rules={[{ required: true, message: 'Vui lòng nhập tầng' }]}
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
              <Form.Item label="Giá thuê/tháng" name="monthlyRent">
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Tiền cọc" name="depositAmount">
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

          <Form.Item label="Tiện nghi phòng" name="facilities">
            <Checkbox.Group>
              <Flex gap="16px" wrap="wrap">
                {['Điều hòa', 'Nóng lạnh', 'Tủ lạnh', 'Máy giặt riêng', 'Ban công', 'Gác lửng'].map((item) => (
                  <Checkbox key={item} value={item}>
                    {item}
                  </Checkbox>
                ))}
              </Flex>
            </Checkbox.Group>
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
            <Card style={{ textAlign: 'center', borderStyle: 'dashed', padding: '16px 0', cursor: 'pointer' }}>
              Upload ảnh, tối đa 5 ảnh
            </Card>
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
