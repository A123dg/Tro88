import { useMemo, useState } from 'react'
import { RoomFilterBar } from '../../../components/rooms/RoomFilterBar'
import { RoomGrid } from '../../../components/rooms/RoomGrid'
import { RoomStatsSummary } from '../../../components/rooms/RoomStatsSummary'
import { useChangeRoomStatus, useRooms, useRoomStats } from './hooks'
import { RoomDto, RoomFilters, RoomStatus } from './service/types'

const pageSize = 10

function getHouseId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('houseId') ?? localStorage.getItem('selectedHouseId') ?? ''
}

function Pagination({
  page,
  totalPage,
  onPageChange,
  disabled,
}: {
  page: number
  totalPage: number
  onPageChange: (page: number) => void
  disabled: boolean
}) {
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1)
    .filter((item) => item === 1 || item === totalPage || Math.abs(item - page) <= 1)

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button type="button" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>
        ← Trước
      </button>
      {pages.map((item, index) => (
        <span key={item} className="pagination__item-wrap">
          {index > 0 && item - pages[index - 1] > 1 ? <span className="pagination__ellipsis">...</span> : null}
          <button
            type="button"
            className={item === page ? 'is-active' : ''}
            disabled={disabled}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        </span>
      ))}
      <button type="button" disabled={disabled || page >= totalPage} onClick={() => onPageChange(page + 1)}>
        Sau →
      </button>
    </nav>
  )
}

export function RoomsPage() {
  const houseId = useMemo(getHouseId, [])
  const [filters, setFilters] = useState<RoomFilters>({
    status: 'all',
    page: 1,
    pageSize,
    sort: 'roomNumberAsc',
  })
  const [changingRoomId, setChangingRoomId] = useState<string>()

  const roomsQuery = useRooms(houseId, filters)
  const rooms = roomsQuery.data?.rooms ?? []
  const meta = roomsQuery.data?.meta ?? { page: 1, pageSize, total: 0, totalPage: 1 }
  const stats = useRoomStats(rooms)
  const changeStatus = useChangeRoomStatus()

  const handleFiltersChange = (nextFilters: RoomFilters) => {
    setFilters(nextFilters)
  }

  const handlePageChange = (page: number) => {
    setFilters((current) => ({ ...current, page }))
  }

  const handleChangeStatus = (room: RoomDto, status: RoomStatus) => {
    setChangingRoomId(room.id)
    changeStatus.mutate(
      { id: room.id, status },
      {
        onSettled: () => setChangingRoomId(undefined),
      },
    )
  }

  return (
    <main className="rooms-page">
      <header className="rooms-page__header">
        <div>
          <nav className="breadcrumb" aria-label="Đường dẫn">
            Tro88 / Quản lý nhà trọ / Phòng trọ
          </nav>
          <h1>Danh sách phòng trọ</h1>
          <p>Theo dõi tình trạng sử dụng, giá thuê và sức chứa của từng phòng.</p>
        </div>
      </header>

      {!houseId ? (
        <section className="room-error">
          <strong>Chưa chọn nhà trọ</strong>
          <p>Vui lòng mở trang với tham số <code>?houseId=...</code> hoặc lưu <code>selectedHouseId</code> trong localStorage.</p>
        </section>
      ) : (
        <>
          <RoomStatsSummary stats={stats} />
          <RoomFilterBar filters={filters} stats={stats} onChange={handleFiltersChange} />
          <RoomGrid
            rooms={rooms}
            isLoading={roomsQuery.isLoading}
            isFetching={roomsQuery.isFetching}
            isError={roomsQuery.isError}
            error={roomsQuery.error}
            changingRoomId={changingRoomId}
            onRetry={() => roomsQuery.refetch()}
            onChangeStatus={handleChangeStatus}
          />
          <Pagination
            page={meta.page}
            totalPage={Math.max(meta.totalPage, 1)}
            disabled={roomsQuery.isFetching}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </main>
  )
}
