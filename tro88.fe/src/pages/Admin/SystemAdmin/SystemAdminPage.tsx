import { useAdminDashboard, useHouses } from './hooks'

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}

function SystemMetric({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: string
}) {
  return (
    <article className="admin-metric" style={{ borderLeftColor: color }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

export function SystemAdminPage() {
  const dashboard = useAdminDashboard()
  const houses = useHouses({ page: 1, pageSize: 8 })
  const data = dashboard.data

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
          <nav className="breadcrumb">Tro88 / Admin hệ thống</nav>
          <h1>Admin quản lý toàn bộ dữ liệu</h1>
          <p>Dành riêng cho role Admin, xem dữ liệu tổng hợp toàn hệ thống.</p>
        </div>
      </header>

      {dashboard.isLoading ? <section className="panel-state">Đang tải dữ liệu toàn hệ thống...</section> : null}
      {dashboard.isError ? (
        <section className="room-error">
          <strong>Không thể tải dữ liệu admin</strong>
          <p>Kiểm tra đăng nhập role Admin hoặc API <code>/Dashboard/admin</code>.</p>
          <button type="button" className="button button--primary" onClick={() => dashboard.refetch()}>Thử lại</button>
        </section>
      ) : null}

      {data ? (
        <section className="admin-section">
          <div className="section-heading">
            <div>
              <h2>Tổng quan toàn hệ thống</h2>
              <p>Không lọc theo chủ trọ, bao gồm toàn bộ dữ liệu chưa bị xóa mềm.</p>
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
            <SystemMetric label="Hợp đồng hiệu lực" value={data.activeContracts} color="#5B8DEF" />
            <SystemMetric label="Hóa đơn chờ thu" value={data.pendingInvoices} color="#FFB547" />
            <SystemMetric label="Doanh thu hệ thống" value={formatCurrency(data.totalRevenue)} color="#F4845F" />
            <SystemMetric label="Bảo trì chờ xử lý" value={data.pendingMaintenanceRequests} color="#FFB547" />
            <SystemMetric label="Nhật ký hệ thống" value={data.totalAuditLogs} color="#8C8C8C" />
          </div>
        </section>
      ) : null}

      <section className="admin-section system-data-section">
        <div className="section-heading">
          <div>
            <h2>Dữ liệu nhà trọ toàn hệ thống</h2>
            <p>Admin thấy toàn bộ nhà trọ qua API <code>/Houses</code>.</p>
          </div>
        </div>

        {houses.isLoading ? <div className="panel-state">Đang tải nhà trọ toàn hệ thống...</div> : null}
        {houses.isError ? (
          <section className="room-error">
            <strong>Không thể tải danh sách nhà trọ</strong>
            <button type="button" className="button button--primary" onClick={() => houses.refetch()}>Thử lại</button>
          </section>
        ) : null}
        {houses.data ? (
          <div className="system-table">
            <div className="system-table__head">
              <span>Nhà trọ</span>
              <span>Địa chỉ</span>
              <span>Phòng</span>
              <span>Đang thuê</span>
              <span>Trạng thái</span>
            </div>
            {houses.data.items.map((house) => (
              <div className="system-table__row" key={house.id}>
                <strong>{house.name}</strong>
                <span>{house.address}</span>
                <span>{house.totalRooms}</span>
                <span>{house.occupiedRooms}</span>
                <span>{house.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  )
}
