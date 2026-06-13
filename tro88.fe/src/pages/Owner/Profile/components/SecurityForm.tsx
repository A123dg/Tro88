interface SecurityFormProps {
  isGoogleLogin?: boolean
}

import { InfoCircleOutlined, LockOutlined } from '@ant-design/icons'

const InfoIcon = InfoCircleOutlined
const LockIcon = LockOutlined


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
