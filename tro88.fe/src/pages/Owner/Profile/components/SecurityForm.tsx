interface SecurityFormProps {
  isGoogleLogin?: boolean
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function SecurityForm({ isGoogleLogin = false }: SecurityFormProps) {
  if (isGoogleLogin) {
    return (
      <div className="google-security-banner">
        <InfoIcon />
        <div className="banner-content">
          <p>Tài khoản của bạn đăng nhập qua Google. Vui lòng quản lý bảo mật tại myaccount.google.com.</p>
          <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="banner-link">
            Mở Google Account →
          </a>
        </div>
      </div>
    )
  }

  return (
    <section className="security-summary-card">
      <div className="security-summary-header">
        <span className="section-icon">
          <LockIcon />
        </span>
        <div>
          <h3 className="section-title section-title--compact">Bảo mật tài khoản</h3>
          <p className="section-subtitle">Màn hình này hiển thị trạng thái bảo mật hiện tại, không thao tác đổi mật khẩu.</p>
        </div>
      </div>

      <div className="security-summary-list">
        <div className="security-summary-row">
          <span>Phương thức đăng nhập</span>
          <strong>{isGoogleLogin ? 'Google' : 'Email / mật khẩu nội bộ'}</strong>
        </div>
        <div className="security-summary-row">
          <span>Trạng thái bảo vệ</span>
          <strong className="security-status-ok">Đang hoạt động</strong>
        </div>
        <div className="security-summary-row">
          <span>Hỗ trợ</span>
          <strong>Liên hệ quản trị viên nếu cần thay đổi xác thực</strong>
        </div>
      </div>
    </section>
  )
}