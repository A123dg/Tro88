import { useCurrentUser } from './hooks'

export function ProfilePage() {
  const user = useCurrentUser()

  return (
    <main className="area-page">
      <header className="area-header">
        <div>
          <nav className="breadcrumb">Tro88 / Hồ sơ</nav>
          <h1>Hồ sơ tài khoản</h1>
          <p>Thông tin cá nhân và vai trò của tài khoản đang đăng nhập.</p>
        </div>
      </header>

      {user.isLoading ? <section className="panel-state">Đang tải hồ sơ...</section> : null}
      {user.isError ? (
        <section className="room-error">
          <strong>Không thể tải hồ sơ</strong>
          <button type="button" className="button button--primary" onClick={() => user.refetch()}>Thử lại</button>
        </section>
      ) : null}
      {user.data ? (
        <section className="profile-page-card">
          <div className="profile-avatar">
            {user.data.avatarUrl ? <img src={user.data.avatarUrl} alt={user.data.fullName} /> : <span>{user.data.fullName.slice(0, 1).toUpperCase()}</span>}
          </div>
          <dl>
            <div><dt>Họ tên</dt><dd>{user.data.fullName}</dd></div>
            <div><dt>Email</dt><dd>{user.data.email}</dd></div>
            <div><dt>Số điện thoại</dt><dd>{user.data.phoneNumber || 'Chưa cập nhật'}</dd></div>
            <div><dt>Vai trò</dt><dd>{user.data.role}</dd></div>
            <div><dt>Trạng thái</dt><dd>{user.data.isActive ? 'Đang hoạt động' : 'Tạm khóa'}</dd></div>
          </dl>
        </section>
      ) : null}
    </main>
  )
}
