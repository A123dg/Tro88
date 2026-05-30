export const COMMON_UNAUTHORIZED = 'COMMON_UNAUTHORIZED'
export const COMMON_ACCESS_DENIED = 'COMMON_ACCESS_DENIED'
export const COMMON_NOT_FOUND = 'COMMON_NOT_FOUND'
export const COMMON_INTERNAL_SERVER_ERROR = 'COMMON_INTERNAL_SERVER_ERROR'
export const COMMON_MISSING_PARAM = 'COMMON_MISSING_PARAM'

export const ERROR_CODE_MSG: Record<string, string> = {
  // common
  [COMMON_UNAUTHORIZED]: 'Chưa xác thực',
  [COMMON_ACCESS_DENIED]: 'Chưa có quyền',
  [COMMON_NOT_FOUND]: 'Không tìm thấy',
  [COMMON_INTERNAL_SERVER_ERROR]: 'Lỗi server',
  [COMMON_MISSING_PARAM]: 'Thiếu tham số',

      // Danh mục vùng kinh tế
  'ECONOMIC_ZONE_NOT_FOUND': 'Không tìm thấy vùng kinh tế',
}

export const useServerErrorMsg = () => {
  return { ERROR_CODE_MSG }
}

export default useServerErrorMsg
