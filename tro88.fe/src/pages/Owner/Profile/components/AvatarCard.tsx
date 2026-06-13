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

import {
  CameraOutlined,
  SafetyOutlined,
  HomeOutlined,
  KeyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

const CameraIcon = CameraOutlined
const ShieldIcon = SafetyOutlined
const HomeIcon = HomeOutlined
const KeyIcon = KeyOutlined


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
            <ClockCircleOutlined />
            Ngày tham gia
          </span>
          <span className="stat-value">
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">
            <SafetyOutlined />
            Vai trò
          </span>
          <span className="stat-value">{user.role}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">
            <CheckCircleOutlined />
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
