import { useEffect, useState } from 'react'
import { RoomStats } from '../../types/room.types'

interface StatCardProps {
  color: string
  icon: string
  label: string
  value: number
  helper?: string
  progress?: number
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    const start = displayValue
    const difference = value - start
    const duration = 350
    const startedAt = performance.now()

    const frame = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      setDisplayValue(Math.round(start + difference * progress))
      if (progress < 1) {
        requestAnimationFrame(frame)
      }
    }

    const animationId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animationId)
  }, [value])

  return <>{displayValue}</>
}

function StatCard({ color, icon, label, value, helper, progress }: StatCardProps) {
  return (
    <article className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card__top">
        <span className="stat-card__icon" style={{ backgroundColor: `${color}1A`, color }}>
          {icon}
        </span>
        <span className="stat-card__label">{label}</span>
      </div>
      <strong className="stat-card__value">
        <AnimatedNumber value={value} />
      </strong>
      {typeof progress === 'number' ? (
        <div className="stat-card__progress" aria-label={`Tỷ lệ lấp đầy ${progress}%`}>
          <span style={{ width: `${progress}%`, backgroundColor: color }} />
        </div>
      ) : null}
      {helper ? <span className="stat-card__helper">{helper}</span> : null}
    </article>
  )
}

export function RoomStatsSummary({ stats }: { stats: RoomStats }) {
  return (
    <section className="room-stats-summary" aria-label="Thống kê phòng trọ">
      <StatCard color="#5B8DEF" icon="🏢" label="Tổng phòng" value={stats.total} />
      <StatCard
        color="#F4845F"
        icon="👥"
        label="Đang thuê"
        value={stats.occupied}
        helper={`${stats.occupancyRate}% đã sử dụng`}
        progress={stats.occupancyRate}
      />
      <StatCard color="#52C593" icon="🚪" label="Phòng trống" value={stats.available} helper="cần tìm khách" />
      <StatCard color="#FFB547" icon="🛠" label="Bảo trì" value={stats.maintenance} helper="cần xử lý" />
    </section>
  )
}
