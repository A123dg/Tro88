import { useMemo } from 'react'
import { DataColumn, formatDate } from '../../../../shared/components/DataPage'
import { UtilityReadingDto } from '../service/types'

export function useColumn() {
  const columns = useMemo<Array<DataColumn<UtilityReadingDto>>>(
    () => [
      { key: 'room', title: 'Phòng', render: (item) => <strong>P.{item.roomNumber}</strong> },
      { key: 'period', title: 'Kỳ', render: (item) => `${item.month}/${item.year}` },
      { key: 'electricity', title: 'Điện', render: (item) => `${item.electricityOld} -> ${item.electricityNew} (${item.electricityUsage})` },
      { key: 'water', title: 'Nước', render: (item) => `${item.waterOld} -> ${item.waterNew} (${item.waterUsage})` },
      { key: 'notes', title: 'Ghi chú', render: (item) => item.notes ?? 'Không có' },
      { key: 'createdAt', title: 'Ngày ghi', render: (item) => formatDate(item.createdAt) },
    ],
    [],
  )

  return { columns }
}
