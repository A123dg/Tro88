import { Row, Col, Card, Button, Typography, Flex } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { useNavigate } from '@tanstack/react-router'
import { useRoomsQuery } from '../services/query'
import { PageHeader, Badge, statusVariant, formatVND, SkeletonGrid, Room, houses } from '../../shared'
import { Illustration } from '../../shared'

const { Title, Text } = Typography

function RoomCard({ room }: { room: Room }) {
  const navigate = useNavigate()
  const isTenant = localStorage.getItem('authRole') === 'Tenant'

  return (
    <Card
      hoverable
      style={{ borderRadius: '12px', overflow: 'hidden' }}
      cover={
        <div style={{ background: '#fdf0eb', display: 'flex', justifyContent: 'center', padding: '16px' }}>
          <Illustration kind="room" />
        </div>
      }
      actions={[
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate({ to: `/rooms/${room.id}` as any })}
        >
          Xem
        </Button>,
        ...(!isTenant
          ? [
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate({ to: `/rooms/${room.id}/edit` as any })}
              >
                Sửa
              </Button>,
            ]
          : []),
      ]}
    >
      <Card.Meta
        title={
          <Flex justify="space-between" align="center">
            <Title level={4} style={{ margin: 0 }}>Phòng {room.roomNumber}</Title>
            <Badge variant={statusVariant(room.status)}>{room.status}</Badge>
          </Flex>
        }
        description={
          <Flex vertical gap="8px" style={{ marginTop: '12px' }}>
            <Text type="secondary">
              Tầng {room.floor} • {room.area}m² • Tối đa {room.maxOccupants} người
            </Text>
            <Text strong style={{ fontSize: '16px', color: '#f4845f' }}>
              {formatVND(room.monthlyRent)}/tháng
            </Text>
          </Flex>
        }
      />
    </Card>
  )
}

export function RoomsPage() {
  const navigate = useNavigate()
  const query = useRoomsQuery()
  const isTenant = localStorage.getItem('authRole') === 'Tenant'

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader
        title="Phòng"
        subtitle="Danh sách phòng, giá thuê, trạng thái và thao tác nhanh."
        action={
          !isTenant ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate({ to: '/rooms/create' as any })}
              style={{ background: '#f4845f', borderColor: '#f4845f' }}
            >
              Thêm phòng
            </Button>
          ) : undefined
        }
      />

      {query.isLoading ? (
        <SkeletonGrid />
      ) : (
        <Row gutter={[24, 24]}>
          {(query.data ?? []).map((room) => (
            <Col xs={24} sm={12} md={8} key={room.id}>
              <RoomCard room={room} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
