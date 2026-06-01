import { useRef, useState, type ChangeEvent } from 'react'
import { useUploadAvatar } from '../hooks'
import type { UserProfile } from '../service/api'

interface AvatarCardProps {
  user: UserProfile
}

const roleConfig = {
  Admin: { bg: '#EEF2FF', color: '#5B8DEF', label: 'Quản trị' },
  Owner: { bg: '#FEF0EB', color: '#F4845F', label: 'Chủ trọ' },
  Tenant: { bg: '#E8F8F0', color: '#52C593', label: 'Người thuê' },
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.5 12.5 21 2l1 1-1.5 1.5L22 6l-1 1-1.5-1.5L18 8l-1-1-1.5 1.5" />
    </svg>
  )
}

export function AvatarCard({ user }: AvatarCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadAvatar = useUploadAvatar()
  const [isHovering, setIsHovering] = useState(false)

  const roleStyle = roleConfig[user.role as keyof typeof roleConfig] || roleConfig.Tenant

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadAvatar.mutate(file)
    }
  }

  const roleIcon = user.role === 'Admin' ? <ShieldIcon /> : user.role === 'Owner' ? <KeyIcon /> : <HomeIcon />

  return (
    <section className="profile-left-card profile-left-panel">
      <div className="profile-avatar-area">
        <button
          type="button"
          className="profile-avatar-button"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Đổi ảnh đại diện"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} className="profile-avatar-image" />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.fullName?.slice(0, 2).toUpperCase() || 'U'}
            </div>
          )}

          <span className="profile-avatar-status" />

          <span className={`profile-avatar-overlay ${isHovering ? 'is-visible' : ''}`}>
            <CameraIcon />
            <span>Đổi ảnh</span>
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="profile-avatar-input"
        />
      </div>

      <button
        type="button"
        className="btn-change-avatar"
        onClick={() => fileInputRef.current?.click()}
      >
        <CameraIcon />
        Đổi ảnh
      </button>

      <div className="profile-user-info">
        <h2 className="user-name">{user.fullName}</h2>
        <p className="user-email">{user.email}</p>

        <span className="role-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>
          <span className="role-dot" style={{ background: roleStyle.color }} />
          {roleIcon}
          <span>{roleStyle.label}</span>
        </span>
      </div>

      <div className="profile-divider" />

      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Ngày tham gia
          </span>
          <span className="stat-value">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Vai trò
          </span>
          <span className="stat-value">{user.role}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Trạng thái
          </span>
          <span className="stat-value">
            {user.isActive ? <span className="status-badge-active">Đang hoạt động</span> : <span className="status-badge-inactive">Tạm khóa</span>}
          </span>
        </div>
      </div>
    </section>
  )
}