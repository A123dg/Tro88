import { RoomStatus } from '../../types/room.types'

const statusLabels: Record<RoomStatus, string> = {
  [RoomStatus.Available]: 'Trống',
  [RoomStatus.Occupied]: 'Đang thuê',
  [RoomStatus.Maintenance]: 'Bảo trì',
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <span className={`room-status-badge room-status-badge--${status.toLowerCase()}`}>
      <span className="room-status-badge__dot" />
      {statusLabels[status]}
    </span>
  )
}

export { statusLabels }
