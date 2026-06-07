import { useState, useEffect } from 'react'
import { Form, Input, Card, Button, Flex, Row, Col, Typography } from 'antd'
import { EditOutlined, ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useHouseDetailQuery } from '../services/query'
import { useUpdateHouseMutation } from '../services/mutation'
import { HouseRoomsTable } from '../components/HouseRoomsTable'
import { PageHeader, Badge, statusVariant, houseStatusLabel, normalizeHouse, houses } from '../../shared'
import ModalForm from '../../../../shared/components/modal-form/ModalForm'

const { Title, Paragraph, Text } = Typography

export function HouseDetailPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const houseId = params.id || null

  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  const fallbackHouse = normalizeHouse(houses.find((item) => item.id === houseId) ?? houses[0])

  const [editOpen, setEditOpen] = useState(false)
  const [editForm] = Form.useForm()

  const detail = useHouseDetailQuery(houseId, Boolean(houseId))
  const house = normalizeHouse(detail.data ?? fallbackHouse)

  const saveEdit = useUpdateHouseMutation({
    onSuccess: () => {
      setEditOpen(false)
      editForm.resetFields()
    },
  })

  useEffect(() => {
    if (!detail.data) return
    editForm.setFieldsValue({
      name: detail.data.name,
      address: detail.data.address,
      province: detail.data.province ?? undefined,
      district: detail.data.district ?? undefined,
      description: detail.data.description ?? '',
    })
  }, [detail.data, editForm])

  const submitEditModal = async () => {
    const values = await editForm.validateFields()
    saveEdit.mutate({
      id: houseId!,
      name: String(values.name ?? ''),
      address: String(values.address ?? ''),
      province: values.province,
      district: values.district,
      description: values.description,
    })
  }

  const ownerId = localStorage.getItem('authUserId')
  const redirectPath = ownerId ? `/houses/${ownerId}` : '/houses'

  return (
    <div className="page">
      <PageHeader
        title={house.name}
        subtitle={house.address}
        action={
          <Flex gap="12px">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: redirectPath })}>
              Danh sách
            </Button>
            {!isTenant && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditOpen(true)}
                style={{ background: '#f4845f', borderColor: '#f4845f' }}
              >
                Sửa thông tin
              </Button>
            )}
          </Flex>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Tổng số phòng</Text>
            <Title level={2} style={{ margin: 0 }}>{house.totalRooms}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Đang thuê</Text>
            <Title level={2} style={{ margin: 0, color: '#52c41a' }}>{house.occupiedRooms}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Còn trống</Text>
            <Title level={2} style={{ margin: 0, color: '#f4845f' }}>{house.totalRooms - house.occupiedRooms}</Title>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Trạng thái duyệt</Text>
            <div style={{ marginTop: '4px' }}>
              <Badge variant={statusVariant(house.status as any)}>
                {houseStatusLabel(house.status, house.isActive)}
              </Badge>
            </div>
          </Card>
        </Col>
      </Row>

      {house.description && (
        <Card title="Mô tả nhà trọ" style={{ borderRadius: '12px', marginBottom: '24px' }}>
          <Paragraph style={{ margin: 0 }}>{house.description}</Paragraph>
        </Card>
      )}

      <Card title="Danh sách phòng" style={{ borderRadius: '12px' }}>
        <HouseRoomsTable houseId={houseId!} />
      </Card>

      <ModalForm
        open={editOpen}
        title="Sửa nhà trọ"
        form={editForm}
        formItems={[
          { label: 'Tên nhà trọ', name: 'name', component: <Input placeholder="Tên nhà trọ" />, rules: [{ required: true, message: 'Vui lòng nhập tên nhà trọ' }], span: 24 },
          { label: 'Địa chỉ', name: 'address', component: <Input.TextArea rows={3} placeholder="Địa chỉ" />, rules: [{ required: true, message: 'Vui lòng nhập địa chỉ' }], span: 24 },
          { label: 'Tỉnh', name: 'province', component: <Input placeholder="Tỉnh" />, span: 12 },
          { label: 'Xã/phường', name: 'district', component: <Input placeholder="Xã/phường" />, span: 12 },
          { label: 'Mô tả', name: 'description', component: <Input.TextArea rows={4} placeholder="Mô tả" />, span: 24 },
        ]}
        isLoadingGetDetail={detail.isLoading}
        loading={saveEdit.isLoading}
        onCancel={() => {
          setEditOpen(false)
          editForm.resetFields()
        }}
        onOk={submitEditModal}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        layout="vertical"
      />
    </div>
  )
}
