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

export const QUERY_KEYS = {
  rooms: (houseId: string) => ['rooms', houseId] as const,
  roomDetail: (id: string) => ['room', id] as const,
}
