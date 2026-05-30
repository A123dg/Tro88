import { RoomDto, RoomStatus } from '../../types/room.types'
import { EmptyState } from './EmptyState'
import { RoomCard } from './RoomCard'

interface RoomGridProps {
  rooms: RoomDto[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error?: Error | null
  changingRoomId?: string
  onRetry: () => void
  onChangeStatus: (room: RoomDto, status: RoomStatus) => void
}

function SkeletonCard() {
  return (
    <article className="room-card room-card--skeleton" aria-label="Đang tải phòng">
      <div className="skeleton skeleton--illustration" />
      <div className="skeleton skeleton--title" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--line" />
      <div className="skeleton skeleton--actions" />
    </article>
  )
}

export function RoomGrid({
  rooms,
  isLoading,
  isFetching,
  isError,
  error,
  changingRoomId,
  onRetry,
  onChangeStatus,
}: RoomGridProps) {
  if (isLoading) {
    return (
      <section className="room-grid" aria-busy="true">
        {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)}
      </section>
    )
  }

  if (isError) {
    return (
      <section className="room-error">
        <strong>⚠ Không thể tải dữ liệu phòng</strong>
        <p>{error?.message ?? 'Vui lòng kiểm tra API và thử lại.'}</p>
        <button type="button" className="button button--primary" onClick={onRetry}>Thử lại</button>
      </section>
    )
  }

  if (rooms.length === 0) {
    return <EmptyState />
  }

  return (
    <section className={isFetching ? 'room-grid room-grid--fetching' : 'room-grid'} aria-busy={isFetching}>
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          isChangingStatus={changingRoomId === room.id}
          onChangeStatus={onChangeStatus}
        />
      ))}
    </section>
  )
}
