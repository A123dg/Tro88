import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../services/managementService'
import { createNotificationConnection } from '../services/notificationRealtimeService'
import { NotificationDto } from '../types/management.types'

const previewFilters = { page: 1, pageSize: 10 }
const unreadFilters = { page: 1, pageSize: 1, status: 'Unread' }

export type NotificationFilter = 'all' | 'unread' | 'invoice' | 'maintenance' | 'contract'

function mergeNotification(items: NotificationDto[], incoming: NotificationDto) {
  if (items.some((item) => item.id === incoming.id)) {
    return items
  }

  return [incoming, ...items].slice(0, 10)
}

export function useNotificationCenter() {
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const queryClient = useQueryClient()

  const previewQuery = useQuery(['notifications-preview', previewFilters], () => fetchNotifications(previewFilters), {
    keepPreviousData: true,
  })
  const unreadQuery = useQuery(['notifications-unread-count', unreadFilters], () => fetchNotifications(unreadFilters), {
    keepPreviousData: true,
  })

  useEffect(() => {
    const realtime = createNotificationConnection((notification) => {
      setHasNewNotification(true)
      window.setTimeout(() => setHasNewNotification(false), 1400)

      queryClient.setQueryData<Awaited<ReturnType<typeof fetchNotifications>> | undefined>(
        ['notifications-preview', previewFilters],
        (current) => {
          if (!current) {
            return current
          }

          return {
            ...current,
            items: mergeNotification(current.items, notification),
            meta: {
              ...current.meta,
              total: current.meta.total + 1,
            },
          }
        },
      )

      queryClient.invalidateQueries('notifications')
      queryClient.invalidateQueries(['notifications-unread-count'])
    })

    realtime.start().catch(() => undefined)

    return () => {
      realtime.stop().catch(() => undefined)
    }
  }, [queryClient])

  const notifications = previewQuery.data?.items ?? []
  const unreadCount = unreadQuery.data?.meta.total ?? notifications.filter((item) => item.status === 'Unread').length

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') {
      return notifications
    }

    if (filter === 'unread') {
      return notifications.filter((item) => item.status === 'Unread')
    }

    return notifications.filter((item) => item.type.toLowerCase() === filter)
  }, [filter, notifications])

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    await Promise.all([
      queryClient.invalidateQueries('notifications'),
      queryClient.invalidateQueries(['notifications-preview']),
      queryClient.invalidateQueries(['notifications-unread-count']),
    ])
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    await Promise.all([
      queryClient.invalidateQueries('notifications'),
      queryClient.invalidateQueries(['notifications-preview']),
      queryClient.invalidateQueries(['notifications-unread-count']),
    ])
  }

  return {
    filter,
    setFilter,
    notifications: filteredNotifications,
    unreadCount,
    hasNewNotification,
    isLoading: previewQuery.isLoading || unreadQuery.isLoading,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
  }
}
