interface ProfileTabsProps {
  activeTab: 'info' | 'security'
  onTabChange: (tab: 'info' | 'security') => void
}

import { UserOutlined, SafetyOutlined } from '@ant-design/icons'

const UserIcon = UserOutlined
const ShieldIcon = SafetyOutlined


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
