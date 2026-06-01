interface ProfileTabsProps {
  activeTab: 'info' | 'security'
  onTabChange: (tab: 'info' | 'security') => void
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div className="profile-tabs">
      <button
        type="button"
        className={`tab-item ${activeTab === 'info' ? 'active' : ''}`}
        onClick={() => onTabChange('info')}
      >
        <UserIcon />
        Thông tin
      </button>
      <button
        type="button"
        className={`tab-item ${activeTab === 'security' ? 'active' : ''}`}
        onClick={() => onTabChange('security')}
      >
        <ShieldIcon />
        Bảo mật
      </button>
    </div>
  )
}