import { useRouterState, useParams } from '@tanstack/react-router'
import { UploadOutlined } from '@ant-design/icons'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
import { Form, Input, Select, Upload, Button as AntdButton } from 'antd'
import type { UploadFile } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { api } from '../../../services/apiClient'
import { queryClient } from '../../../queryClient'
import { createAiConversation, fetchAiConversation, fetchAiConversations, sendAiMessage } from '../../../services/aiAgentService'
import { createHouse, fetchHouseDetail, updateHouse } from '../../../services/houseService'
import { createMaintenanceRequest, CreateMaintenanceRequestPayload, fetchMaintenanceRequests, fetchMaintenanceById, updateMaintenanceStatus } from '../../../services/managementService'
import { useNotification } from '../../../hooks/useNotification'
import { useCurrentUser } from '../../../hooks/useDashboard'
import ModalForm from '../../../shared/components/modal-form/ModalForm'
import {
  AreaChartLite, Badge, Button, Card, DataTable, EmptyState, FormShell, Illustration, Link, navigateTo,
  MiniBarChart, NotificationList, PageHeader, SimpleFormPage, SimplePage, SkeletonGrid,
  Maintenance, Room, Status, Timeline, UtilityTable, contracts, fetchProvinceOptions, fetchWardOptions, formatDate, formatVND,
  houseStatusLabel, houses, invoices, maintenance, normalizeHouse, ok, pageId, read, rooms, statusVariant, total, QK,
} from '../shared'

const statusLabels: Record<string, string> = {
  New: 'Mới tạo',
  Open: 'Mới tạo',
  InProgress: 'Đang xử lý',
  Resolved: 'Đã hoàn thành',
  Done: 'Đã hoàn thành'
}

const priorityLabels: Record<string, string> = {
  Normal: 'Bình thường',
  Soon: 'Cần sớm',
  Urgent: 'Khẩn cấp'
}

export function MaintenancePage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isTenant = pathname.startsWith('/my')

  const { showSuccessNotify, showErrorNotify } = useNotification()
  const user = useCurrentUser()
  const dashboard = useQuery(QK.tenantDashboard, () => read('/Dashboard/tenant', {
    currentRoomId: null,
  }), { enabled: isTenant })
  const roomId = dashboard.data?.currentRoomId

  const { data: listData, isLoading: isListLoading, refetch: refetchList } = useQuery(
    ['tenant-maintenance-list', user.data?.id],
    () => fetchMaintenanceRequests({ requestedByUserId: user.data?.id }),
    { enabled: isTenant && !!user.data?.id }
  )

  const list = listData?.items ?? []

  const [category, setCategory] = useState('Điện')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const save = useMutation(
    (payload: CreateMaintenanceRequestPayload) => createMaintenanceRequest(payload),
    {
      onSuccess: () => {
        showSuccessNotify('Gửi yêu cầu bảo trì thành công!')
        setTitle('')
        setDescription('')
        setFileList([])
        refetchList()
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể gửi yêu cầu bảo trì.')
      }
    }
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!roomId) {
      showErrorNotify('Không tìm thấy phòng đang thuê của bạn.')
      return
    }
    save.mutate({
      roomId,
      title,
      description,
      category,
      priority,
      files: fileList.map((f) => f.originFileObj).filter(Boolean) as File[],
    })
  }

  if (!isTenant) {
    const columns: Array<{ status: Maintenance['status']; label: string }> = [{ status: 'New', label: 'Mới' }, { status: 'InProgress', label: 'Đang xử lý' }, { status: 'Done', label: 'Hoàn thành' }]
    return (
      <main className="page">
        <PageHeader title="Báo cáo bảo trì" subtitle="Kanban xử lý bảo trì, phân công và theo dõi tiến độ." />
        <div className="kanban">{columns.map((column) => <Card key={column.status} className={`kanban-col ${column.status}`}><h2>{column.label} ({maintenance.filter((item) => item.status === column.status).length})</h2>{maintenance.filter((item) => item.status === column.status).map((item) => <MaintenanceCard key={item.id} item={item} />)}</Card>)}</div>
      </main>
    )
  }

  return (
    <section className="tenant-page">
      <h1>Yêu cầu bảo trì</h1>
      
      {!roomId ? (
        <Card style={{ textAlign: 'center', padding: '20px 0' }}>
          Bạn chưa có phòng đang thuê để gửi yêu cầu bảo trì.
        </Card>
      ) : (
        <form className="form-grid card" onSubmit={handleSubmit}>
          <h2 style={{ gridColumn: '1 / -1', marginBottom: '12px' }}>Tạo yêu cầu bảo trì mới</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tiêu đề</label>
              <input
                placeholder="Tiêu đề yêu cầu (VD: Hỏng vòi nước phòng tắm)"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Đính kèm hình ảnh</label>
              <Upload
                listType="picture"
                fileList={fileList}
                onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                beforeUpload={() => false}
                multiple
                accept="image/*"
              >
                <AntdButton type="primary" icon={<UploadOutlined />}>
                  Chọn hình ảnh
                </AntdButton>
              </Upload>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mức độ ưu tiên</label>
              <div className="role-cards" style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    name="priority"
                    type="radio"
                    checked={priority === 'Normal'}
                    onChange={() => setPriority('Normal')}
                  />
                  Bình thường
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    name="priority"
                    type="radio"
                    checked={priority === 'Soon'}
                    onChange={() => setPriority('Soon')}
                  />
                  Cần sớm
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    name="priority"
                    type="radio"
                    checked={priority === 'Urgent'}
                    onChange={() => setPriority('Urgent')}
                  />
                  Khẩn cấp
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Danh mục bảo trì</label>
              <div className="category-grid">
                {['Điện', 'Nước', 'ĐH', 'Cửa', 'Wifi', 'Khác'].map((item) => (
                  <label key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '16px', cursor: 'pointer' }}>
                    <input
                      name="cat"
                      type="radio"
                      checked={category === item}
                      onChange={() => setCategory(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mô tả chi tiết</label>
              <textarea
                placeholder="Mô tả cụ thể tình trạng hỏng hóc..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ flex: 1, minHeight: '120px' }}
              />
            </div>
          </div>

          <div className="footer-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={save.isLoading}>Gửi yêu cầu</Button>
          </div>
        </form>
      )}

      <Card style={{ marginTop: '20px' }}>
        <h2>Lịch sử yêu cầu</h2>
        {isListLoading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Đang tải danh sách...</p>
        ) : list.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Chưa có yêu cầu bảo trì nào.</p>
        ) : (
          <div className="list" style={{ display: 'grid', gap: '12px' }}>
            {list.map((item) => {
              const mappedItem: Maintenance = {
                id: item.id,
                room: item.roomNumber,
                title: item.title,
                tenant: item.requestedByName,
                category: item.category,
                priority: item.priority as any,
                status: item.status as any,
                time: formatDate(item.createdAt),
              }
              return <MaintenanceCard key={item.id} item={mappedItem} />
            })}
          </div>
        )}
      </Card>
    </section>
  )
}

function MaintenanceCard({ item }: { item: Maintenance }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isTenant = pathname.startsWith('/my')

  return (
    <Card className="maintenance-card">
      <div className="card-heading">
        <Badge variant="info">Phòng {item.room}</Badge>
        <Badge variant={item.priority === 'Urgent' ? 'danger' : item.priority === 'Soon' ? 'warning' : 'success'}>
          {priorityLabels[item.priority] || item.priority}
        </Badge>
      </div>
      <h3>{item.title}</h3>
      <p>{item.tenant} • {item.time}</p>
      <Link to={isTenant ? `/my/maintenance/${item.id}` : `/maintenance/${item.id}`}>
        Xem chi tiết
      </Link>
    </Card>
  )
}

export function MaintenanceDetailPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const { showSuccessNotify, showErrorNotify } = useNotification()
  const routerState = useRouterState()
  const isTenant = routerState.location.pathname.startsWith('/my')

  const { data: item, isLoading, refetch } = useQuery(
    ['maintenance-detail', id],
    () => fetchMaintenanceById(id!),
    { enabled: !!id }
  )

  const [status, setStatus] = useState<string>('')
  const [resolutionNote, setResolutionNote] = useState<string>('')

  useEffect(() => {
    if (item) {
      setStatus(item.status)
      setResolutionNote(item.resolutionNote || '')
    }
  }, [item])

  const updateStatusMutation = useMutation(
    () => updateMaintenanceStatus(id!, status, resolutionNote),
    {
      onSuccess: () => {
        showSuccessNotify('Cập nhật trạng thái bảo trì thành công!')
        refetch()
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể cập nhật trạng thái.')
      }
    }
  )

  if (isLoading) {
    return (
      <main className="page">
        <Card style={{ textAlign: 'center', padding: '40px 0' }}>Đang tải chi tiết...</Card>
      </main>
    )
  }

  if (!item) {
    return (
      <main className="page">
        <Card style={{ textAlign: 'center', padding: '40px 0' }}>Không tìm thấy yêu cầu bảo trì.</Card>
      </main>
    )
  }

  const mappedStatus = item.status === 'Open' ? 'New' : item.status;

  return (
    <main className="page">
      <PageHeader title={item.title} subtitle={`Phòng ${item.roomNumber} • ${item.category}`} />
      <div className="split">
        <Card>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Badge variant={statusVariant(mappedStatus as any)}>{statusLabels[item.status] || item.status}</Badge>
            <Badge variant={item.priority === 'Urgent' ? 'danger' : item.priority === 'Soon' ? 'warning' : 'success'}>
              {priorityLabels[item.priority] || item.priority}
            </Badge>
          </div>
          <p><strong>Danh mục:</strong> {item.category}</p>
          <p><strong>Người gửi:</strong> {item.requestedByName}</p>
          <p><strong>Ngày gửi:</strong> {formatDate(item.createdAt)}</p>
          <p style={{ marginTop: '16px' }}>{item.description}</p>
          {item.imageUrls && item.imageUrls.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <strong>Hình ảnh đính kèm:</strong>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                {item.imageUrls.map((url, idx) => (
                  <a href={url} target="_blank" rel="noreferrer" key={idx}>
                    <img
                      src={url}
                      alt={`maintenance-${idx}`}
                      style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
          {/* <Timeline items={['Gửi', 'Nhận', 'Xử lý', 'Hoàn thành']} /> */}
        </Card>
        <Card>
          <h3>Thông tin xử lý</h3>
          <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
            <p style={{ margin: 0 }}><strong>Người xử lý:</strong> {item.assignedToName || 'Chưa phân công'}</p>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Trạng thái</label>
              {!isTenant ? (
                <Select
                  style={{ width: '100%' }}
                  value={status}
                  onChange={(val) => setStatus(val)}
                  options={[
                    { value: 'Open', label: 'Mới tạo' },
                    { value: 'InProgress', label: 'Đang xử lý' },
                    { value: 'Resolved', label: 'Đã hoàn thành' }
                  ]}
                />
              ) : (
                <div style={{ marginTop: '4px' }}>
                  <Badge variant={statusVariant(mappedStatus as any)}>{statusLabels[item.status] || item.status}</Badge>
                </div>
              )}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ghi chú xử lý</label>
              {!isTenant ? (
                <textarea
                  placeholder="Ghi chú xử lý..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  style={{ width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
                />
              ) : (
                <p style={{ margin: 0, padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                  {item.resolutionNote || 'Chưa có ghi chú xử lý.'}
                </p>
              )}
            </div>
            {!isTenant && (
              <Button onClick={() => updateStatusMutation.mutate()} loading={updateStatusMutation.isLoading}>
                Lưu trạng thái
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}

export function MaintenanceCreatePage() {
  const { showSuccessNotify, showErrorNotify } = useNotification()
  const dashboard = useQuery(QK.tenantDashboard, () => read('/Dashboard/tenant', {
    currentRoomId: null,
  }))
  const roomId = dashboard.data?.currentRoomId

  const [category, setCategory] = useState('Điện')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const save = useMutation(
    (payload: CreateMaintenanceRequestPayload) => createMaintenanceRequest(payload),
    {
      onSuccess: () => {
        showSuccessNotify('Gửi yêu cầu bảo trì thành công!')
        navigateTo('/my/maintenance')
      },
      onError: (error: any) => {
        showErrorNotify(error?.message || 'Không thể gửi yêu cầu bảo trì.')
      }
    }
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!roomId) {
      showErrorNotify('Không tìm thấy phòng đang thuê của bạn.')
      return
    }
    save.mutate({
      roomId,
      title,
      description,
      category,
      priority,
      files: fileList.map((f) => f.originFileObj).filter(Boolean) as File[],
    })
  }

  if (dashboard.isLoading) {
    return (
      <section className="tenant-page">
        <h1>Gửi yêu cầu bảo trì</h1>
        <Card style={{ textAlign: 'center', padding: '40px 0' }}>Đang tải thông tin...</Card>
      </section>
    )
  }

  if (!roomId) {
    return (
      <section className="tenant-page">
        <h1>Gửi yêu cầu bảo trì</h1>
        <Card style={{ textAlign: 'center', padding: '40px 0' }}>
          Bạn chưa có phòng đang thuê để gửi yêu cầu bảo trì.
        </Card>
      </section>
    )
  }

  return (
    <section className="tenant-page">
      <h1>Gửi yêu cầu bảo trì</h1>
      <form className="form-grid card" onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tiêu đề</label>
            <input
              placeholder="Tiêu đề yêu cầu (VD: Hỏng vòi nước phòng tắm)"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Đính kèm hình ảnh</label>
            <Upload
              listType="picture"
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              multiple
              accept="image/*"
            >
              <AntdButton type="primary" icon={<UploadOutlined />}>
                Chọn hình ảnh
              </AntdButton>
            </Upload>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mức độ ưu tiên</label>
            <div className="role-cards" style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  name="priority"
                  type="radio"
                  checked={priority === 'Normal'}
                  onChange={() => setPriority('Normal')}
                />
                Bình thường
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  name="priority"
                  type="radio"
                  checked={priority === 'Soon'}
                  onChange={() => setPriority('Soon')}
                />
                Cần sớm
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  name="priority"
                  type="radio"
                  checked={priority === 'Urgent'}
                  onChange={() => setPriority('Urgent')}
                />
                Khẩn cấp
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Danh mục bảo trì</label>
            <div className="category-grid">
              {['Điện', 'Nước', 'ĐH', 'Cửa', 'Wifi', 'Khác'].map((item) => (
                <label key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginRight: '16px', cursor: 'pointer' }}>
                  <input
                    name="cat"
                    type="radio"
                    checked={category === item}
                    onChange={() => setCategory(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mô tả chi tiết</label>
            <textarea
              placeholder="Mô tả cụ thể tình trạng hỏng hóc..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ flex: 1, minHeight: '120px' }}
            />
          </div>
        </div>

        <div className="footer-actions" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link className="app-button app-button--outline" to="/my/maintenance">Hủy</Link>
          <Button type="submit" loading={save.isLoading}>Lưu</Button>
        </div>
      </form>
    </section>
  )
}



