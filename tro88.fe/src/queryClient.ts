import { QueryClient } from 'react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    },
  },
})

export const QK = {
  rooms: (houseId: string) => ['rooms', houseId] as const,
  roomDetail: (id: string) => ['room', id] as const,
  roomSearch: (filters?: object) => ['room-search', filters] as const,
  me: ['me'] as const,
  houses: ['houses'] as const,
  house: (id: string) => ['house', id] as const,
  contracts: (filters?: object) => ['contracts', filters] as const,
  contract: (id: string) => ['contract', id] as const,
  invoices: (filters?: object) => ['invoices', filters] as const,
  invoice: (id: string) => ['invoice', id] as const,
  maintenance: (filters?: object) => ['maintenance', filters] as const,
  notifications: ['notifications'] as const,
}

export const QUERY_KEYS = QK
