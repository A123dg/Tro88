#Project Rules
## UI Rules
Các datepicker sử dụng CustomDatePicker ở useDebounce, 
Có thể custom các thẻ để tái sử dụng


Đối với các api post, ở frontend khi sử dụng cần tuân theo request, response của backend, nếu thay đổi dto phải đưa ra thông báo 
các api post, put, delete khi thực hiện phải hiển thị toast qua hooks useNotification với showErrorNotify và showSuccessNotify 
các thao tác redirect thì sử dụng useRouter
Không dùng các thẻ thông thường mà dùng thẻ của antd