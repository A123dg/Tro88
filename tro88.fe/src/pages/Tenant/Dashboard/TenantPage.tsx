import { useCurrentUser, useTenantDashboard } from './hooks'

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Chưa có lịch'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function TenantPage() {
  const user = useCurrentUser()
  const dashboard = useTenantDashboard()

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
          <nav className="breadcrumb">Tro88 / Người ở trọ</nav>
          <h1>Trang người ở trọ</h1>
          <p>Xem phòng đang thuê, hóa đơn cần thanh toán và yêu cầu bảo trì.</p>
        </div>
      </header>

      <section className="user-layout">
        <article className="profile-panel">
          <div className="profile-avatar">
            {user.data?.avatarUrl ? <img src={user.data.avatarUrl} alt={user.data.fullName} /> : <span>{user.data?.fullName.slice(0, 1).toUpperCase() ?? 'U'}</span>}
          </div>
          <h2>{user.data?.fullName ?? 'Người ở trọ'}</h2>
          <p>{user.data?.email ?? 'Chưa có email'}</p>
          <dl>
            <div>
              <dt>Số điện thoại</dt>
              <dd>{user.data?.phoneNumber ?? 'Chưa cập nhật'}</dd>
            </div>
            <div>
              <dt>Vai trò</dt>
              <dd>{user.data?.role ?? 'Tenant'}</dd>
            </div>
            <div>
              <dt>Trạng thái</dt>
              <dd>{user.data?.isActive ? 'Đang hoạt động' : 'Tạm khóa'}</dd>
            </div>
          </dl>
        </article>

        <section className="tenant-dashboard">
          {dashboard.isLoading ? <div className="panel-state">Đang tải dữ liệu người ở trọ...</div> : null}
          {dashboard.isError ? (
            <section className="room-error">
              <strong>Không thể tải dữ liệu người ở trọ</strong>
              <p>Kiểm tra đăng nhập role Tenant hoặc API <code>/Dashboard/tenant</code>.</p>
              <button type="button" className="button button--primary" onClick={() => dashboard.refetch()}>Thử lại</button>
            </section>
          ) : null}

          {dashboard.data ? (
            <>
              <article className="tenant-room-card">
                <span>Phòng hiện tại</span>
                <strong>{dashboard.data.currentRoomNumber ? `P.${dashboard.data.currentRoomNumber}` : 'Chưa thuê phòng'}</strong>
                <p>{dashboard.data.currentHouseName ?? 'Chưa có nhà trọ đang thuê'}</p>
              </article>

              <div className="admin-metric-grid tenant-metrics">
                <article className="admin-metric" style={{ borderLeftColor: '#F4845F' }}>
                  <span>Tiền thuê tháng</span>
                  <strong>{formatCurrency(dashboard.data.monthlyRent)}</strong>
                </article>
                <article className="admin-metric" style={{ borderLeftColor: '#FFB547' }}>
                  <span>Hóa đơn chưa thanh toán</span>
                  <strong>{dashboard.data.unpaidInvoices}</strong>
                </article>
                <article className="admin-metric" style={{ borderLeftColor: '#5B8DEF' }}>
                  <span>Tổng cần thanh toán</span>
                  <strong>{formatCurrency(dashboard.data.totalDue)}</strong>
                </article>
                <article className="admin-metric" style={{ borderLeftColor: '#52C593' }}>
                  <span>Ngày thanh toán tiếp theo</span>
                  <strong>{formatDate(dashboard.data.nextPaymentDue)}</strong>
                </article>
                <article className="admin-metric" style={{ borderLeftColor: '#FFB547' }}>
                  <span>Yêu cầu bảo trì đang xử lý</span>
                  <strong>{dashboard.data.activeMaintenanceRequests}</strong>
                </article>
              </div>
            </>
          ) : null}
        </section>
      </section>
    </main>
  )
}
