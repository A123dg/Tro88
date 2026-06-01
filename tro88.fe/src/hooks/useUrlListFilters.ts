import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { ListFilters } from '../types/management.types'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

function getPositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function getInitialFilters<T extends ListFilters>(defaults: T): T {
  const search = window.location.search.startsWith('?')
    ? window.location.search.slice(1).replace(/\?/g, '&')
    : window.location.search
  const params = new URLSearchParams(search)

  return {
    ...defaults,
    page: getPositiveNumber(params.get('page'), defaults.page ?? DEFAULT_PAGE),
    pageSize: getPositiveNumber(params.get('pageSize'), defaults.pageSize ?? DEFAULT_PAGE_SIZE),
  }
}

export function useUrlListFilters<T extends ListFilters>(
  defaults: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [filters, setFilters] = useState<T>(() => getInitialFilters(defaults))

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', String(filters.page ?? DEFAULT_PAGE))
    params.set('pageSize', String(filters.pageSize ?? DEFAULT_PAGE_SIZE))

    const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
    window.history.replaceState(null, '', nextUrl)
  }, [filters.page, filters.pageSize])

  return [filters, setFilters]
}
