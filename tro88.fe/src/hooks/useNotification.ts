import { App } from 'antd'
import React, { type ReactNode } from 'react'

export const useNotification = () => {
  const { notification } = App.useApp()

  const showSuccessNotify = (msg: string) => {
    notification.success({ message: msg })
  }

  const showErrorNotify = (msg: string) => {
    let formattedMsg: ReactNode = msg
    if (typeof msg === 'string' && msg.includes('\n')) {
      formattedMsg = React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
        msg.split('\n').map((line, idx) => React.createElement('div', { key: idx }, line)),
      )
    }

    notification.error({ message: formattedMsg })
  }

  return {
    showSuccessNotify,
    showErrorNotify,
  }
}

export default useNotification
