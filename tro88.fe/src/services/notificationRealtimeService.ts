import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { NotificationDto } from '../types/management.types'
import { api } from './apiClient'

type NotificationHandler = (notification: NotificationDto) => void

const apiBaseUrl = api.defaults.baseURL ?? 'http://localhost:5073/api/v1'
const hubBaseUrl = apiBaseUrl.replace(/\/api\/v\d+\/?$/i, '')

export function createNotificationConnection(onNotification: NotificationHandler) {
  const connection = new HubConnectionBuilder()
    .withUrl(`${hubBaseUrl}/hubs/notifications`, {
      accessTokenFactory: () => localStorage.getItem('accessToken') ?? '',
      withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()

  connection.on('ReceiveNotification', onNotification)

  return {
    async start() {
      if (!localStorage.getItem('accessToken') || connection.state !== HubConnectionState.Disconnected) {
        return
      }

      await connection.start()
    },
    async stop() {
      connection.off('ReceiveNotification', onNotification)
      if (connection.state !== HubConnectionState.Disconnected) {
        await connection.stop()
      }
    },
  }
}
