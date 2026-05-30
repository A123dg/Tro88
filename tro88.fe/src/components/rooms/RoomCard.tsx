import { EmptyRoomIllustration } from '../../illustrations/EmptyRoomIllustration'
import { MaintenanceIllustration } from '../../illustrations/MaintenanceIllustration'
import { TenantIllustration } from '../../illustrations/TenantIllustration'
import { RoomDto, RoomStatus } from '../../types/room.types'
import { RoomStatusBadge, statusLabels } from './RoomStatusBadge'

interface RoomCardProps {
  room: RoomDto
  isChangingStatus: boolean
  onChangeStatus: (room: RoomDto, status: RoomStatus) => void
}

const nextStatus: Record<RoomStatus, RoomStatus> = {
  [RoomStatus.Available]: RoomStatus.Occupied,
  [RoomStatus.Occupied]: RoomStatus.Maintenance,
  [RoomStatus.Maintenance]: RoomStatus.Available,
}

function RoomIllustration({ status }: { status: RoomStatus }) {
  if (status === RoomStatus.Occupied) {
    return <TenantIllustration />
  }
  if (status === RoomStatus.Maintenance) {
    return <MaintenanceIllustration />
  }
  return <EmptyRoomIllustration />
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}

export function RoomCard({ room, isChangingStatus, onChangeStatus }: RoomCardProps) {
  const targetStatus = nextStatus[room.status]

  const handleChangeStatus = () => {
    const confirmed = window.confirm(
      `Đổi trạng thái phòng ${room.roomNumber} sang "${statusLabels[targetStatus]}"?`,
    )
    if (confirmed) {
      onChangeStatus(room, targetStatus)
    }
  }

  return (
    <article className="room-card">
      <div className="room-card__illustration">
        <RoomIllustration status={room.status} />
      </div>

      <div className="room-card__header">
        <div>
          <h3>P.{room.roomNumber}</h3>
          <p>Tầng {room.floor} • {room.area}m²</p>
        </div>
        <RoomStatusBadge status={room.status} />
      </div>

      <div className="room-card__divider" />

      <dl className="room-card__details">
        <div>
          <dt>💰</dt>
          <dd>{formatCurrency(room.monthlyRent)}/tháng</dd>
        </div>
        <div>
          <dt>👥</dt>
          <dd>Tối đa {room.maxOccupants} người</dd>
        </div>
      </dl>

      <div className="room-card__divider" />

      <div className="room-card__actions">
        <button type="button" className="button button--ghost">Xem chi tiết</button>
        <button
          type="button"
          className="button button--primary"
          disabled={isChangingStatus}
          onClick={handleChangeStatus}
        >
          {isChangingStatus ? 'Đang đổi...' : 'Đổi TT'}
        </button>
      </div>
    </article>
  )
}
