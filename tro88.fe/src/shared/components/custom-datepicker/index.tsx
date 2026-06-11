import { DatePicker } from 'antd'
import type { DatePickerProps } from 'antd'
import viVN from 'antd/es/date-picker/locale/vi_VN'
import 'dayjs/locale/vi'

export function CustomDatePicker(props: DatePickerProps) {
  return (
    <DatePicker
      {...props}
      locale={props.locale ?? viVN}
      format={props.format ?? 'DD/MM/YYYY'}
      style={props.style}
      getPopupContainer={props.getPopupContainer ?? (() => document.body)}
    />
  )
}
