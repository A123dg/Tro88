import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Bell, CreditCard, FileText, Wrench } from '../../icons'
import { NotificationDto } from '../../types/management.types'
import { NotificationFilter, useNotificationCenter } from '../../hooks/useNotificationCenter'

const tabs: Array<{ key: NotificationFilter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
  { key: 'invoice', label: 'Hóa đơn' },
  { key: 'maintenance', label: 'Bảo trì' },
  { key: 'contract', label: 'Hợp đồng' },
]

function formatUnreadCount(value: number) {
  return value > 99 ? '99+' : String(value)
}

function formatTime(value: string) {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(Math.floor(diff / 60000), 0)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function getTypeIcon(type: string) {
  const normalizedType = type.toLowerCase()

  if (normalizedType === 'invoice') return CreditCard
  if (normalizedType === 'maintenance') return Wrench
  if (normalizedType === 'contract') return FileText
  return Bell
}

function NotificationIcon({ type }: { type: string }) {
  const Icon = getTypeIcon(type)
  return (
    <span className={`notification-dropdown__type notification-dropdown__type--${type.toLowerCase()}`}>
      <Icon />
    </span>
  )
}

function NotificationItem({
  item,
  onRead,
  onClose,
}: {
  item: NotificationDto
  onRead: (id: string) => void
  onClose?: () => void
}) {
  const unread = item.status === 'Unread'
  const navigate = useNavigate()

  const handleClick = () => {
    if (unread) {
      onRead(item.id)
    }
    if (onClose) {
      onClose()
    }

    const role = localStorage.getItem('authRole')
    const refId = item.referenceId
    const type = (item.type ?? '').toLowerCase()

    if (role === 'Tenant') {
      if (type === 'contract' && refId) {
        navigate({ to: `/my/contracts/${refId}` as any })
      } else if (type === 'invoice' && refId) {
        navigate({ to: `/my/invoices/${refId}` as any })
      } else if (type === 'maintenance' && refId) {
        navigate({ to: `/my/maintenance/${refId}` as any })
      } else {
        navigate({ to: '/my/rooms' as any })
      }
    } else {
      // Owner or Admin
      if (type === 'contract' && refId) {
        navigate({ to: `/contracts/${refId}` as any })
      } else if (type === 'invoice' && refId) {
        navigate({ to: `/invoices/${refId}` as any })
      } else if (type === 'maintenance' && refId) {
        navigate({ to: `/maintenance/${refId}` as any })
      } else {
        navigate({ to: '/dashboard' as any })
      }
    }
  }

  return (
    <button
      type="button"
      className={`notification-dropdown__item ${unread ? 'is-unread' : ''}`}
      onClick={handleClick}
    >
      <NotificationIcon type={item.type} />
      <span className="notification-dropdown__content">
        <strong>{item.title}</strong>
        <span>{item.body}</span>
        <small>
          {formatTime(item.createdAt)}
          {unread ? <em>Mới</em> : null}
        </small>
      </span>
      {unread ? <span className="notification-dropdown__unread-dot" /> : null}
    </button>
  )
}

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const {
    filter,
    setFilter,
    notifications,
    unreadCount,
    hasNewNotification,
    isLoading,
    markRead,
    markAllRead,
  } = useNotificationCenter()

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <div className="notification-dropdown" ref={rootRef}>
      <button
        type="button"
        className={`notification-dropdown__trigger ${open ? 'is-open' : ''} ${hasNewNotification ? 'has-new' : ''}`}
        onClick={() => setOpen((current) => !current)}
        aria-label="Thông báo"
      >
        <Bell />
        {unreadCount > 0 ? <span className="notification-dropdown__badge">{formatUnreadCount(unreadCount)}</span> : null}
      </button>

      {open ? (
        <section className="notification-dropdown__panel" aria-label="Thông báo">
          <header className="notification-dropdown__header">
            <div className="notification-dropdown__title-row">
              <div>
                <strong>Thông báo</strong>
                {unreadCount > 0 ? <span>{unreadCount} mới</span> : null}
              </div>
              {unreadCount > 0 ? (
                <button type="button" onClick={() => markAllRead()}>
                  Đánh dấu tất cả đã đọc
                </button>
              ) : null}
            </div>
            <nav className="notification-dropdown__tabs" aria-label="Lọc thông báo">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={filter === tab.key ? 'is-active' : ''}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </header>

          <div className="notification-dropdown__list">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div className="notification-dropdown__skeleton" key={index}>
                  <span />
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ))
            ) : null}

            {!isLoading && notifications.length === 0 ? (
              <div className="notification-dropdown__empty">
                <Bell />
                <strong>Không có thông báo</strong>
                <span>Bạn đã xem hết thông báo rồi.</span>
              </div>
            ) : null}

            {!isLoading
              ? notifications.map((item) => (
                  <NotificationItem key={item.id} item={item} onRead={markRead} onClose={() => setOpen(false)} />
                ))
              : null}
          </div>

          <footer className="notification-dropdown__footer">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                window.location.href = '/notifications'
              }}
            >
              Xem tất cả thông báo
            </button>
          </footer>
        </section>
      ) : null}
    </div>
  )
}
