import { useMemo, useState } from 'react'
import { Input } from 'antd'
import type { TableProps } from 'antd'
import { useMutation } from 'react-query'
import { queryClient } from '../../../queryClient'
import TableWithPagination from '../../../shared/components/table-pagination'
import { changeHouseStatus } from '../../../services/houseService'
import { HouseDto } from '../../../types/app.types'
import { useAdminDashboard, useHouses } from './hooks'

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}

function SystemMetric({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <article className="admin-metric" style={{ borderLeftColor: color }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function houseStatusLabel(status?: string, isActive?: boolean) {
  if (status === 'PendingApproval') return 'Chờ duyệt'
  if (status === 'Active') return 'Đang hoạt động'
  if (status === 'Inactive') return 'Không hoạt động'
  return isActive ? 'Đang hoạt động' : 'Không hoạt động'
}

export function SystemAdminPage() {
  const [housePage, setHousePage] = useState(1)
  const [housePageSize, setHousePageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const dashboard = useAdminDashboard()
  const houses = useHouses({ page: housePage, pageSize: housePageSize, keyword })
  const approveHouse = useMutation((id: string) => changeHouseStatus(id, 'Active'), {
    onSuccess: () => {
      queryClient.invalidateQueries(['houses'])
      queryClient.invalidateQueries(['dashboard', 'admin'])
    },
  })
  const rejectHouse = useMutation((id: string) => changeHouseStatus(id, 'Inactive'), {
    onSuccess: () => {
      queryClient.invalidateQueries(['houses'])
      queryClient.invalidateQueries(['dashboard', 'admin'])
    },
  })
  const data = dashboard.data

  const houseColumns = useMemo<TableProps<HouseDto>['columns']>(
    () => [
      { key: 'name', title: 'Nhà trọ', render: (_, house) => <strong>{house.name}</strong> },
      { key: 'address', title: 'Địa chỉ', render: (_, house) => house.address },
      { key: 'totalRooms', title: 'Phòng', render: (_, house) => house.totalRooms },
      { key: 'occupiedRooms', title: 'Đang thuê', render: (_, house) => house.occupiedRooms },
      { key: 'status', title: 'Trạng thái', render: (_, house) => houseStatusLabel(house.status, house.isActive) },
      {
        key: 'actions',
        title: 'Thao tác',
        className: 'action-column',
        render: (_, house) => (
          <div className="row-actions">
            {house.status === 'PendingApproval' ? (
              <>
                <button
                  type="button"
                  className="button button--primary"
                  disabled={approveHouse.isLoading}
                  onClick={() => approveHouse.mutate(house.id)}
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  className="button button--danger"
                  disabled={rejectHouse.isLoading}
                  onClick={() => rejectHouse.mutate(house.id)}
                >
                  Từ chối
                </button>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [approveHouse, rejectHouse],
  )

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
          <nav className="breadcrumb">Quản lý phòng trọ</nav>
         
        </div>
      </header>

      {dashboard.isLoading ? <section className="panel-state">Đang tải dữ liệu toàn hệ thống...</section> : null}
      {dashboard.isError ? (
        <section className="room-error">
          <strong>Không thể tải dữ liệu </strong>
          {/* <p>Kiểm tra đăng nhập role Admin hoặc API <code>/Dashboard/admin</code>.</p> */}
          <button type="button" className="button button--primary" onClick={() => dashboard.refetch()}>Thử lại</button>
        </section>
      ) : null}

      {/* {data ? (
        <section className="admin-section">
          <div className="section-heading">
            <div>
              <h2>Tổng quan toàn hệ thống</h2>
              <p>Dữ liệu tổng hợp toàn hệ thống, không lọc theo chủ trọ.</p>
            </div>
          </div>
          <div className="admin-metric-grid">
            <SystemMetric label="Tổng người dùng" value={data.totalUsers} color="#5B8DEF" />
            <SystemMetric label="Chủ trọ" value={data.totalOwners} color="#52C593" />
            <SystemMetric label="Người ở trọ" value={data.totalTenants} color="#F4845F" />
            <SystemMetric label="Nhà trọ" value={data.totalHouses} color="#5B8DEF" />
            <SystemMetric label="Tổng phòng" value={data.totalRooms} color="#52C593" />
            <SystemMetric label="Phòng đang thuê" value={data.occupiedRooms} color="#F4845F" />
            <SystemMetric label="Phòng trống" value={data.availableRooms} color="#52C593" />
            <SystemMetric label="Hóa đơn chờ thu" value={data.pendingInvoices} color="#FFB547" />
            <SystemMetric label="Doanh thu hệ thống" value={formatCurrency(data.totalRevenue)} color="#F4845F" />
            <SystemMetric label="Bảo trì chờ xử lý" value={data.pendingMaintenanceRequests} color="#FFB547" />
            <SystemMetric label="Nhật ký hệ thống" value={data.totalAuditLogs} color="#8C8C8C" />
          </div>
        </section>
      ) : null} */}

      <section className="admin-section system-data-section">
        {/* <div className="section-heading">
          <div>
            <h2>Nhà trọ toàn hệ thống</h2>
          </div>
        </div> */}

        {houses.isError ? (
          <section className="room-error">
            <strong>Không thể tải danh sách nhà trọ</strong>
            <button type="button" className="button button--primary" onClick={() => houses.refetch()}>Thử lại</button>
          </section>
        ) : null}
        {!houses.isError ? (
          <div className="data-table data-table--antd">
            <div className="table-toolbar">
              <Input
                value={keyword}
                placeholder="Tìm kiếm theo tên, địa chỉ"
                onChange={(event) => {
                  setKeyword(event.target.value)
                  setHousePage(1)
                }}
              />
            </div>
            <TableWithPagination
              columns={houseColumns}
              dataSource={houses.data?.items ?? []}
              loading={houses.isLoading}
              rowKey="id"
              scroll={{ x: true }}
              pagination={{
                current: houses.data?.meta.page ?? housePage,
                pageSize: houses.data?.meta.pageSize ?? housePageSize,
                total: houses.data?.meta.total ?? 0,
                onChange: (page, pageSize) => {
                  setHousePage(page)
                  setHousePageSize(pageSize)
                },
              }}
              locale={{ emptyText: 'Không có nhà trọ phù hợp.' }}
            />
          </div>
        ) : null}
      </section>
    </main>
  )
}
