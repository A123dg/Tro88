import { useRouterState } from '@tanstack/react-router'
import { UploadOutlined, HomeOutlined, PayCircleOutlined, ToolOutlined, FileTextOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select, Card, Row, Col, Statistic, Progress, Badge, Button, Space, Typography, List, Tooltip } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse } from '../../../services/houseService'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import { fetchInvoices, fetchMaintenanceRequests } from '../../../services/managementService'
import {
  AreaChartLite, EmptyState, Illustration, Link, navigateTo,
  MaintenanceCard, MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'

import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography

export const OwnerDashboardPage = () => {
  const dashboard = useQuery(QK.ownerDashboard, () => read('/Dashboard/owner', { 
    totalHouses: 0, 
    totalRooms: 0, 
    occupiedRooms: 0, 
    availableRooms: 0, 
    activeContracts: 0,
    pendingInvoices: 0, 
    totalRevenue: 0, 
    pendingMaintenanceRequests: 0 
  }))
  const remind = useMutation((id: string) => ok(id))

  // Fetch live unpaid invoices for the owner
  const invoicesQuery = useQuery(['owner-invoices-dashboard'], () => fetchInvoices({ page: 1, pageSize: 5, status: 'Unpaid' }), {
    keepPreviousData: true,
  })
  const unpaidInvoices = invoicesQuery.data?.items ?? []

  // Fetch live maintenance requests
  const maintenanceQuery = useQuery(['owner-maintenance-dashboard'], () => fetchMaintenanceRequests({ page: 1, pageSize: 6, status: 'Open' }), {
    keepPreviousData: true,
  })
  const activeMaintenance = maintenanceQuery.data?.items ?? []

  if (dashboard.isLoading) return <main className="page"><SkeletonGrid /></main>
  if (dashboard.isError) return <main className="page"><EmptyState title="Không tải được tổng quan" description="Bấm thử lại để tải lại dữ liệu dashboard." /></main>
  const data = dashboard.data ?? { totalHouses: 0, totalRooms: 0, occupiedRooms: 0, availableRooms: 0, activeContracts: 0, totalRevenue: 0, pendingInvoices: 0, pendingMaintenanceRequests: 0 }

  const occupancyRate = data.totalRooms > 0 ? Math.round((data.occupiedRooms / data.totalRooms) * 100) : 0

  return (
    <main className="page" style={{ padding: '24px' }}>
      <PageHeader title="Tổng quan" subtitle="Theo dõi doanh thu, công nợ và việc cần xử lý." />
      
      {/* Primary Financial & Operational Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #FFF5F0 0%, #FFEBE0 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#8c8c8c', fontWeight: 500 }}>Doanh thu thực tế</span>}
              value={data.totalRevenue} 
              formatter={(val) => formatVND(val as number)} 
              valueStyle={{ color: '#F4845F', fontWeight: 'bold', fontSize: '26px' }} 
            />
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>Từ hóa đơn đã thanh toán</div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Statistic 
                title={<span style={{ color: '#8c8c8c', fontWeight: 500 }}>Tỷ lệ lấp đầy</span>}
                value={occupancyRate} 
                suffix="%" 
                valueStyle={{ color: '#1f1f1f', fontWeight: 'bold', fontSize: '26px' }} 
              />
              <Progress type="circle" percent={occupancyRate} width={50} strokeColor="#52C593" />
            </div>
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>{data.occupiedRooms}/{data.totalRooms} phòng đang thuê</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#8c8c8c', fontWeight: 500 }}>Hóa đơn chưa thu</span>}
              value={data.pendingInvoices} 
              suffix=" hóa đơn"
              valueStyle={{ color: '#FAAD14', fontWeight: 'bold', fontSize: '26px' }} 
            />
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>Hóa đơn chờ thanh toán</div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#8c8c8c', fontWeight: 500 }}>Bảo trì cần xử lý</span>}
              value={data.pendingMaintenanceRequests} 
              suffix=" yêu cầu"
              valueStyle={{ color: '#FF4D4F', fontWeight: 'bold', fontSize: '26px' }} 
            />
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>Yêu cầu bảo trì mới nhận</div>
          </Card>
        </Col>
      </Row>

      {/* Resource Overview Cards */}
      <div style={{ marginBottom: '24px' }}>
        {/* <Title level={4} style={{ marginBottom: '16px', fontWeight: 600 }}>Tài nguyên hệ thống</Title> */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card size="small" bordered={false} style={{ background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
              <Statistic 
                title={<span style={{ fontSize: '12px' }}><HomeOutlined /> Nhà trọ</span>}
                value={data.totalHouses} 
                valueStyle={{ fontSize: '20px', fontWeight: 600 }} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered={false} style={{ background: '#f5f5f5', borderRadius: '8px', textAlign: 'center' }}>
              <Statistic 
                title={<span style={{ fontSize: '12px' }}><FileTextOutlined /> Tổng số phòng</span>}
                value={data.totalRooms} 
                valueStyle={{ fontSize: '20px', fontWeight: 600 }} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered={false} style={{ background: '#E6F7FF', borderRadius: '8px', textAlign: 'center' }}>
              <Statistic 
                title={<span style={{ fontSize: '12px', color: '#1890FF' }}><PayCircleOutlined /> Phòng trống</span>}
                value={data.availableRooms} 
                valueStyle={{ fontSize: '20px', fontWeight: 600, color: '#1890FF' }} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered={false} style={{ background: '#F6FFED', borderRadius: '8px', textAlign: 'center' }}>
              <Statistic 
                title={<span style={{ fontSize: '12px', color: '#52C41A' }}><ToolOutlined /> Hợp đồng hiệu lực</span>}
                value={data.activeContracts} 
                valueStyle={{ fontSize: '20px', fontWeight: 600, color: '#52C41A' }} 
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={14}>
          <Card bordered={false} style={{ borderRadius: '12px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Title level={4} style={{ margin: 0, marginBottom: '16px' }}>Trạng thái phòng trọ</Title>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '20px', padding: '10px 0' }}>
              <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f5f5f5" strokeWidth="10" />
                  {data.totalRooms > 0 && (
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#52C593" 
                      strokeWidth="10" 
                      strokeDasharray={`${(data.occupiedRooms / data.totalRooms) * 251.2} 251.2`} 
                      strokeDashoffset="0" 
                      transform="rotate(-90 50 50)" 
                    />
                  )}
                  {data.totalRooms > 0 && (
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#1890FF" 
                      strokeWidth="10" 
                      strokeDasharray={`${(data.availableRooms / data.totalRooms) * 251.2} 251.2`} 
                      strokeDashoffset={`-${(data.occupiedRooms / data.totalRooms) * 251.2}`} 
                      transform="rotate(-90 50 50)" 
                    />
                  )}
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f1f1f' }}>{data.totalRooms}</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tổng số phòng</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#52C593' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Đã thuê</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{data.occupiedRooms} phòng ({data.totalRooms > 0 ? Math.round((data.occupiedRooms / data.totalRooms) * 100) : 0}%)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1890FF' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>Phòng trống</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{data.availableRooms} phòng ({data.totalRooms > 0 ? Math.round((data.availableRooms / data.totalRooms) * 100) : 0}%)</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={10}>
          <Card bordered={false} style={{ borderRadius: '12px', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={4} style={{ margin: 0 }}>Hóa đơn chưa thanh toán</Title>
              <Badge count={unpaidInvoices.length} overflowCount={99} style={{ backgroundColor: '#FAAD14' }} />
            </div>
            
            <List
              dataSource={unpaidInvoices}
              renderItem={(item) => (
                <List.Item 
                  key={item.id}
                  actions={[
                    <Button type="default" size="small" loading={remind.isLoading} onClick={() => remind.mutate(item.id)}>Nhắc</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Badge status="warning" style={{ marginTop: '12px' }} />}
                    title={<strong>{item.invoiceCode}</strong>}
                    description={`Kỳ: ${item.billingMonth}/${item.billingYear}`}
                  />
                  <div style={{ fontWeight: 'bold', color: '#FF4D4F' }}>{formatVND(item.totalAmount)}</div>
                </List.Item>
              )}
              locale={{
                emptyText: <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>Không có hóa đơn chưa thanh toán</div>
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Title level={4} style={{ margin: 0, marginBottom: '16px' }}>Yêu cầu bảo trì cần xử lý</Title>
        <Row gutter={[16, 16]}>
          {activeMaintenance.map((item) => {
            const mappedItem: Maintenance = {
              id: item.id,
              room: item.roomNumber,
              title: item.title,
              tenant: item.requestedByName,
              category: item.category,
              priority: item.priority as any,
              status: item.status as any,
              time: formatDate(item.createdAt)
            }
            return (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <MaintenanceCard item={mappedItem} />
              </Col>
            )
          })}
          {activeMaintenance.length === 0 && (
            <Col span={24}>
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                Không có yêu cầu bảo trì cần xử lý
              </div>
            </Col>
          )}
        </Row>
      </Card>
    </main>
  )
}

export const TenantDashboardPage = () => {
  const dashboard = useQuery(QK.tenantDashboard, () => read('/Dashboard/tenant', {
    currentRoomId: null,
    currentRoomNumber: null,
    currentHouseName: null,
    monthlyRent: 0,
    unpaidInvoices: 0,
    totalDue: 0,
    nextPaymentDue: null,
    activeMaintenanceRequests: 0,
  }))
  const data = dashboard.data

  // Fetch live unpaid invoices for the tenant
  const invoicesQuery = useQuery(['tenant-invoices-dashboard'], () => fetchInvoices({ page: 1, pageSize: 5, status: 'Unpaid' }), {
    keepPreviousData: true,
  })
  const unpaidInvoices = invoicesQuery.data?.items ?? []
  const firstUnpaid = unpaidInvoices[0]

  return (
    <section className="tenant-page" style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Nhà trọ của tôi</Title>
      
      <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Row align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={6} md={4} style={{ textAlign: 'center' }}>
            <Illustration kind="room" />
          </Col>
          <Col xs={24} sm={12} md={14}>
            <Space direction="vertical" size={4}>
              <Badge status={data?.currentRoomNumber ? "success" : "default"} text={data?.currentRoomNumber ? "Đang thuê" : "Trống"} />
              <Title level={3} style={{ margin: 0 }}>{data?.currentHouseName ?? 'Chưa có nhà trọ đang thuê'}</Title>
              <Text type="secondary">{data?.currentRoomNumber ? `Phòng ${data.currentRoomNumber}` : 'Chưa có phòng đang thuê'}</Text>
            </Space>
          </Col>
          <Col xs={24} sm={6} md={6} style={{ textAlign: 'right' }}>
            <Title level={4} style={{ margin: 0, color: '#F4845F' }}>{formatVND(data?.monthlyRent ?? 0)}/tháng</Title>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#8c8c8c' }}>Hóa đơn chưa thanh toán</span>} 
              value={data?.totalDue ?? 0} 
              formatter={(v) => formatVND(v as number)} 
              valueStyle={{ color: '#FF4D4F', fontWeight: 'bold' }} 
            />
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>{data?.unpaidInvoices ?? 0} hóa đơn đang chờ</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#8c8c8c' }}>Ngày thanh toán tới</span>} 
              value={data?.nextPaymentDue ? formatDate(data.nextPaymentDue) : 'Chưa có lịch'} 
              valueStyle={{ fontSize: '20px', fontWeight: 600 }} 
            />
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>Nhắc thanh toán hóa đơn</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Statistic 
              title={<span style={{ color: '#8c8c8c' }}>Bảo trì đang xử lý</span>} 
              value={data?.activeMaintenanceRequests ?? 0} 
              valueStyle={{ fontWeight: 'bold' }} 
            />
            <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: '12px' }}>Theo dõi yêu cầu đã gửi</div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={4} style={{ margin: 0 }}>Hóa đơn tháng này</Title>
              <Badge status={firstUnpaid ? "warning" : "success"} text={firstUnpaid ? "Chưa TT" : "Đã TT"} />
            </div>
            
            <Statistic 
              value={firstUnpaid ? firstUnpaid.totalAmount : 0} 
              formatter={(v) => formatVND(v as number)} 
              valueStyle={{ color: firstUnpaid ? '#FF4D4F' : '#52C593', fontWeight: 'bold', fontSize: '28px', marginBottom: '12px' }} 
            />
            
            <p style={{ color: '#8c8c8c', fontSize: '12px', marginBottom: '16px' }}>
              Hạn thanh toán: {firstUnpaid ? formatDate(firstUnpaid.dueDate) : 'Không có'}
            </p>
            
            <Progress percent={firstUnpaid ? 35 : 100} showInfo={false} strokeColor={firstUnpaid ? '#FF4D4F' : '#52C593'} style={{ marginBottom: '24px' }} />
            
            <Space size="middle">
              <Link className="app-button app-button--outline" to="/my/invoices">Xem chi tiết</Link>
              <Button type="primary" disabled={!firstUnpaid}>Thanh toán</Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <Title level={4} style={{ margin: 0, marginBottom: '16px' }}>Thông báo gần đây</Title>
            <NotificationList limit={3} />
          </Card>
        </Col>
      </Row>

      <div className="quick-grid" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <Link to="/my/invoices" className="app-button app-button--outline">Hóa đơn</Link>
        <Link to="/my/maintenance/create" className="app-button app-button--outline">Báo hỏng</Link>
        <Link to="/ai-agent" className="app-button app-button--outline">Chat AI</Link>
      </div>
    </section>
  )
}

