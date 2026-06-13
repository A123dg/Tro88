import { useMemo } from 'react'
import { DataColumn, formatDate } from '../../../../shared/components/DataPage'
import { AuditLogDto } from '../service/types'

export function useColumn() {
  const columns = useMemo<Array<DataColumn<AuditLogDto>>>(
    () => [
      { key: 'module', title: 'Module', render: (item) => <strong>{item.module}</strong> },
      { key: 'action', title: 'Hành động', render: (item) => item.action },
      { key: 'user', title: 'UserId', render: (item) => item.userId ?? 'Hệ thống' },
      { key: 'target', title: 'TargetId', render: (item) => item.targetId ?? 'Không có' },
      { key: 'ip', title: 'IP', render: (item) => item.ipAddress ?? 'Không có' },
      { key: 'createdAt', title: 'Thời gian', render: (item) => formatDate(item.createdAt) },
    ],
    [],
  )

  return { columns }
}
