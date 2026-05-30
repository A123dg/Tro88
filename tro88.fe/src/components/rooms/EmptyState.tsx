import { EmptyRoomIllustration } from '../../illustrations/EmptyRoomIllustration'

export function EmptyState() {
  return (
    <section className="empty-state">
      <div className="empty-state__illustration">
        <EmptyRoomIllustration />
      </div>
      <h2>Chưa có phòng nào</h2>
      <p>Danh sách hiện chưa có phòng phù hợp với bộ lọc đang chọn.</p>
      <button type="button" className="button button--primary">Thêm phòng mới</button>
    </section>
  )
}
