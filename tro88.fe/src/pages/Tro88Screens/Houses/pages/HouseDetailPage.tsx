import { Card, Button, Flex, Row, Col, Typography, Image } from 'antd'
import { EditOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useHouseDetailQuery } from '../services/query'
import { useDeleteHouseMutation } from '../services/mutation'
import { HouseRoomsTable } from '../components/HouseRoomsTable'
import { PageHeader, Badge, statusVariant, houseStatusLabel, normalizeHouse, houses } from '../../shared'
import { useNotification } from '../../../../hooks/useNotification'

const { Title, Paragraph, Text } = Typography

export function HouseDetailPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const houseId = params.id || null

  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  const fallbackHouse = normalizeHouse(houses.find((item) => item.id === houseId) ?? houses[0])

  const detail = useHouseDetailQuery(houseId, Boolean(houseId))
  const house = normalizeHouse(detail.data ?? fallbackHouse)

  const ownerId = localStorage.getItem('authUserId')
  const redirectPath = ownerId ? `/houses/${ownerId}` : '/houses'

  const { showSuccessNotify, showErrorNotify } = useNotification()

  const deleteMutation = useDeleteHouseMutation({
    onSuccess: () => {
      showSuccessNotify('Xóa nhà trọ thành công')
      navigate({ to: redirectPath })
    },
    onError: (error: any) => {
      showErrorNotify(error?.message || 'Không thể xóa nhà trọ')
    }
  })

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
              <Flex gap="12px">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate({ to: `/houses/detail/${houseId}/edit` as any })}
                  style={{ background: '#f4845f', borderColor: '#f4845f' }}
                >
                  Sửa thông tin
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleteMutation.isLoading}
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà trọ "${house.name}"?`)) {
                      deleteMutation.mutate(houseId!)
                    }
                  }}
                >
                  Xóa nhà trọ
                </Button>
              </Flex>
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

      {house.mediaUrls && house.mediaUrls.length > 0 && (
        <Card title="Hình ảnh nhà trọ" style={{ borderRadius: '12px', marginBottom: '24px' }}>
          <Image.PreviewGroup>
            <Flex gap="12px" wrap="wrap">
              {house.mediaUrls.map((url) => (
                <Image
                  key={url}
                  src={url}
                  alt="House image"
                  width={150}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                />
              ))}
            </Flex>
          </Image.PreviewGroup>
        </Card>
      )}

      {house.description && (
        <Card title="Mô tả nhà trọ" style={{ borderRadius: '12px', marginBottom: '24px' }}>
          <Paragraph style={{ margin: 0 }}>{house.description}</Paragraph>
        </Card>
      )}

      <HouseRoomsTable houseId={houseId!} />
    </div>
  )
}
