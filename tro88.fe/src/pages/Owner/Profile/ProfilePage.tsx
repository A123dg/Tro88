import { useState } from 'react'
import { useProfile } from './hooks'
import { AvatarCard } from './components/AvatarCard'
import { ProfileTabs } from './components/ProfileTabs'
import { ProfileForm } from './components/ProfileForm'
import { SecurityForm } from './components/SecurityForm'

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')
  const profile = useProfile()

  // Check if user logged in via Google (email ends with @gmail.com or has google provider)
  const isGoogleLogin = profile.data?.email?.endsWith('@gmail.com') || false

  if (profile.isLoading) {
    return (
      <main className="area-page profile-page">
        <header className="area-header">
          <nav className="breadcrumb">Tro88 / Hồ sơ</nav>
          <h1>Hồ sơ cá nhân</h1>
          <p>Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
        </header>

        <div className="profile-layout">
          {/* Left Card Skeleton */}
          <section className="panel panel--card profile-left-card skeleton-card">
            <div className="avatar-skeleton" />
            <div className="text-skeleton" style={{ width: '60%' }} />
            <div className="text-skeleton" style={{ width: '80%' }} />
          </section>

          {/* Right Card Skeleton */}
          <section className="panel panel--card profile-right-card">
            <div className="tabs-skeleton">
              <div className="tab-skeleton" />
              <div className="tab-skeleton" />
            </div>
            <div className="form-skeleton">
              <div className="field-skeleton" />
              <div className="field-skeleton" />
              <div className="field-skeleton" />
              <div className="field-skeleton" />
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (profile.isError) {
    return (
      <main className="area-page">
        <header className="area-header">
          <nav className="breadcrumb">Tro88 / Hồ sơ</nav>
          <h1>Hồ sơ cá nhân</h1>
          <p>Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
        </header>
        <section className="room-error">
          <strong>Không thể tải hồ sơ</strong>
          <button type="button" className="button button--primary" onClick={() => profile.refetch()}>
            Thử lại
          </button>
        </section>
      </main>
    )
  }

  if (!profile.data) {
    return null
  }

  return (
    <main className="area-page profile-page">
      <header className="area-header">
        <nav className="breadcrumb">Tro88 / Hồ sơ</nav>
        <h1>Hồ sơ cá nhân</h1>
        <p>Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
      </header>

      <div className="profile-layout">
        {/* Left Card - Avatar & User Info */}
        <AvatarCard user={profile.data} />

        {/* Right Card - Form */}
        <section className="panel panel--card profile-right-card">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="tab-content">
            {activeTab === 'info' ? (
              <ProfileForm user={profile.data} isGoogleLogin={isGoogleLogin} />
            ) : (
              <SecurityForm isGoogleLogin={isGoogleLogin} />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}