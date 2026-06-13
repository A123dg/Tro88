export const ERROR_CODE_MSG: Record<string, string> = {
  // common / HTTP Status codes
  'COMMON_400': 'Yêu cầu không hợp lệ',
  'COMMON_401': 'Chưa xác thực, vui lòng đăng nhập lại',
  'COMMON_403': 'Bạn không có quyền thực hiện thao tác này',
  'COMMON_404': 'Không tìm thấy tài nguyên yêu cầu',
  'COMMON_409': 'Dữ liệu bị trùng lặp hoặc xung đột',
  'COMMON_422': 'Dữ liệu không hợp lệ',
  'COMMON_500': 'Lỗi máy chủ nội bộ (500)',

  'VALIDATION_ERROR': 'Dữ liệu xác thực không hợp lệ',

  // auth
  'INVALID_CREDENTIALS': 'Tài khoản hoặc mật khẩu không đúng',
  'INVALID_GOOGLE_TOKEN': 'Đăng nhập với Google thất bại',
  'EMAIL_ALREADY_REGISTERED': 'Email này đã được đăng ký trước đó',
  'REFRESH_TOKEN_EXPIRED': 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
  'ACCOUNT_DEACTIVATED': 'Tài khoản của bạn đã bị khóa',
  'ACCESS_DENIED': 'Truy cập bị từ chối',

  // user / house
  'USER_NOT_FOUND': 'Không tìm thấy thông tin người dùng',
  'HOUSE_NOT_FOUND': 'Không tìm thấy thông tin nhà trọ',
  'HOUSE_ACCESS_DENIED': 'Bạn không có quyền quản lý nhà trọ này',

  // room
  'ROOM_NOT_FOUND': 'Không tìm thấy phòng trọ',
  'ROOM_ALREADY_OCCUPIED': 'Phòng trọ này đã có người thuê',
  'INVALID_ROOM_STATUS_TRANSITION': 'Chuyển đổi trạng thái phòng không hợp lệ',
  'TENANT_ALREADY_IN_ROOM': 'Người thuê này đã ở trong phòng rồi',

  // contract
  'CONTRACT_NOT_FOUND': 'Không tìm thấy hợp đồng',
  'CONTRACT_ALREADY_ACTIVE': 'Hợp đồng này đã được kích hoạt trước đó',
  'CONTRACT_ALREADY_TERMINATED': 'Hợp đồng này đã bị chấm dứt trước đó',
  'CONTRACT_EXPIRED': 'Hợp đồng đã hết hạn',

  // invoice
  'INVOICE_NOT_FOUND': 'Không tìm thấy hóa đơn',
  'INVOICE_ALREADY_PAID': 'Hóa đơn này đã được thanh toán',
  'INVOICE_ALREADY_EXISTS': 'Hóa đơn cho phòng này trong tháng đã tồn tại',
  'OVERDUE_INVOICE': 'Hóa đơn đã quá hạn thanh toán',

  // maintenance
  'MAINTENANCE_REQUEST_NOT_FOUND': 'Không tìm thấy yêu cầu bảo trì',

  // utility
  'UTILITY_READING_NOT_FOUND': 'Không tìm thấy chỉ số điện nước',
  'UTILITY_READING_ALREADY_EXISTS': 'Chỉ số điện nước tháng này đã được nhập trước đó',

  // notifications / service fee / ai agent
  'SERVICE_FEE_NOT_FOUND': 'Không tìm thấy thông tin dịch vụ',
  'NOTIFICATION_NOT_FOUND': 'Không tìm thấy thông báo',
  'AI_CONVERSATION_NOT_FOUND': 'Không tìm thấy cuộc hội thoại AI',
  'AI_TASK_NOT_FOUND': 'Không tìm thấy tác vụ AI',
  'AI_SERVICE_ERROR': 'Dịch vụ AI gặp sự cố',

  // AI Tool
  'AI_TOOL_NOT_FOUND': 'Không tìm thấy công cụ hỗ trợ AI',
  'AI_TOOL_EXECUTION_FAILED': 'Thực thi công cụ AI thất bại',
  'AI_TOOL_INVALID_PARAMS': 'Tham số công cụ AI không hợp lệ',
  'AI_RATE_LIMIT_EXCEEDED': 'Vượt quá giới hạn lượt yêu cầu AI',
  'AI_PROMPT_INJECTION_DETECTED': 'Phát hiện câu lệnh không an toàn',
  'INVALID_FILE_TYPE': 'Định dạng file không hợp lệ',
  'FILE_TOO_LARGE': 'Kích thước file quá lớn',

  // Other legacy codes
  'COMMON_UNAUTHORIZED': 'Chưa xác thực',
  'COMMON_ACCESS_DENIED': 'Chưa có quyền',
  'COMMON_NOT_FOUND': 'Không tìm thấy',
  'COMMON_INTERNAL_SERVER_ERROR': 'Lỗi server, vui lòng thử lại',
  'COMMON_MISSING_PARAM': 'Thiếu tham số',
}

export const useServerErrorMsg = () => {
  return { ERROR_CODE_MSG }
}

export default useServerErrorMsg
