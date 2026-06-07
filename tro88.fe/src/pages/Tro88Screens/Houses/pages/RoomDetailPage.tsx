import { useState } from 'react'
import { Card, Button, Tabs, Descriptions, Image, Row, Col, Typography, Flex } from 'antd'
import { EditOutlined, ArrowLeftOutlined, ContactsOutlined, InfoCircleOutlined, HistoryOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQuery } from 'react-query'
import { PageHeader, Badge, statusVariant, formatVND, formatDate, read, rooms } from '../../shared'
import { AreaChartLite } from '../../shared'

const { Title, Paragraph, Text } = Typography

export function RoomDetailPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const roomId = params.id || null

  const isTenant = localStorage.getItem('authRole') === 'Tenant'
  const [activeTab, setActiveTab] = useState('info')

  const roomQuery = useQuery(['room-detail', roomId], () => read(`/Rooms/${roomId}`, rooms[0]))
  const room = roomQuery.data ?? rooms[0]

  const contractsQuery = useQuery(
    ['room-contracts', roomId],
    () => read(`/Contracts?roomId=${roomId}&status=Active`, { items: [] as any[] })
  )
  const activeContract = contractsQuery.data?.items?.[0]

  const tenantsQuery = useQuery(
    ['contract-tenants', activeContract?.id],
    () => activeContract ? read(`/Contracts/${activeContract?.id}/tenants`, [] as any[]) : Promise.resolve([] as any[]),
    { enabled: !!activeContract }
  )
  const occupants = tenantsQuery.data ?? []

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <InfoCircleOutlined /> Thông tin
        </span>
      ),
    },
    ...(!isTenant
      ? [
          {
            key: 'occupants',
            label: (
              <span>
                <ContactsOutlined /> Người đang ở ({activeContract ? occupants.length + 1 : 0})
              </span>
            ),
          },
        ]
      : []),
    {
      key: 'billing',
      label: (
        <span>
          <HistoryOutlined /> Lịch sử điện nước
        </span>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <PageHeader
        title={`Phòng ${room.roomNumber}`}
        subtitle={room.description || 'Chi tiết phòng trọ'}
        action={
          <Flex gap="12px">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: '/rooms' as any })}>
              Danh sách
            </Button>
            {!isTenant && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate({ to: `/rooms/${room.id}/edit` as any })}
                style={{ background: '#f4845f', borderColor: '#f4845f' }}
              >
                Sửa phòng
              </Button>
            )}
          </Flex>
        }
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: '24px' }} />

      {activeTab === 'info' && (
        <Row gutter={[24, 24]}>
          <Col xs={24} md={14}>
            <Card title="Thông tin phòng" style={{ borderRadius: '12px' }}>
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Tầng">{room.floor}</Descriptions.Item>
                <Descriptions.Item label="Diện tích">{room.area} m²</Descriptions.Item>
                <Descriptions.Item label="Giá thuê">{formatVND(Number(room.monthlyRent))}</Descriptions.Item>
                <Descriptions.Item label="Tiền cọc">{formatVND(Number(room.depositAmount))}</Descriptions.Item>
                <Descriptions.Item label="Đơn giá Điện / Nước">
                  {formatVND(Number(room.electricityUnitPrice))} / {formatVND(Number(room.waterUnitPrice))}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Badge variant={statusVariant(room.status as any)}>{room.status}</Badge>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={10}>
            <Card title="Ảnh phòng" style={{ borderRadius: '12px' }}>
              <Row gutter={[8, 8]}>
                {(room as any).imageUrls?.map((url: string) => (
                  <Col span={12} key={url}>
                    <Image
                      src={url}
                      alt="Room"
                      style={{ width: '100%', height: '120px', borderRadius: 8, objectFit: 'cover' }}
                    />
                  </Col>
                )) || (
                  <Col span={24}>
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                      Chưa có hình ảnh phòng.
                    </div>
                  </Col>
                )}
              </Row>
              {!isTenant && (
                <Button block type="dashed" style={{ marginTop: 16 }}>
                  Upload thêm ảnh
                </Button>
              )}
            </Card>
          </Col>
        </Row>
      )}

      {activeTab === 'occupants' && !isTenant && (
        <Card title="Người đang ở tại phòng" style={{ borderRadius: '12px' }}>
          {!activeContract ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
              Phòng trống, chưa có hợp đồng hoạt động.
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {/* Primary Tenant */}
              <Col xs={24} sm={12}>
                <Card
                  title={<Text strong style={{ color: '#f4845f' }}>Người ký hợp đồng (Chủ hộ)</Text>}
                  style={{ border: '1px solid #fdf0eb', background: '#fdf6f0', borderRadius: '8px' }}
                >
                  <Title level={4} style={{ marginTop: 0 }}>{activeContract.tenantName}</Title>
                  <Paragraph style={{ margin: '4px 0' }}>📞 {activeContract.tenantPhone || 'Chưa có SĐT'}</Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>✉️ {activeContract.tenantEmail || 'Chưa có Email'}</Paragraph>
                  <Paragraph style={{ margin: '4px 0' }}>🗓️ Ngày vào: {formatDate(activeContract.startDate)}</Paragraph>
                </Card>
              </Col>

              {/* Other Occupants */}
              {occupants
                .filter((occ: any) => occ.userId !== activeContract.tenantId)
                .map((occ: any) => (
                  <Col xs={24} sm={12} key={occ.id}>
                    <Card
                      title={<Text strong type="secondary">Thành viên phòng</Text>}
                      style={{ borderRadius: '8px' }}
                    >
                      <Title level={4} style={{ marginTop: 0 }}>{occ.fullName}</Title>
                      <Paragraph style={{ margin: '4px 0' }}>📞 {occ.phoneNumber || 'Chưa có SĐT'}</Paragraph>
                      <Paragraph style={{ margin: '4px 0' }}>✉️ {occ.email || 'Chưa có Email'}</Paragraph>
                      <Paragraph style={{ margin: '4px 0' }}>🗓️ Check-in: {formatDate(occ.checkIn)}</Paragraph>
                    </Card>
                  </Col>
                ))}
            </Row>
          )}
        </Card>
      )}

      {activeTab === 'billing' && (
        <Card title="Lịch sử điện nước" style={{ borderRadius: '12px' }}>
          <AreaChartLite />
        </Card>
      )}
    </div>
  )
}
