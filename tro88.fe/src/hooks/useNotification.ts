import { App } from 'antd'
import React, { type ReactNode } from 'react'

import { ERROR_CODE_MSG } from '../constant/serverErrorMsg'

export const useNotification = () => {
  const { notification } = App.useApp()

  const showSuccessNotify = (msg: string) => {
    notification.success({ message: msg })
  }

  const showErrorNotify = (msg: string) => {
    let translatedMsg = msg
    if (typeof msg === 'string') {
      const cleaned = msg.trim()
      if (ERROR_CODE_MSG[cleaned]) {
        translatedMsg = ERROR_CODE_MSG[cleaned]
      }
    }

    let formattedMsg: ReactNode = translatedMsg
    if (typeof translatedMsg === 'string' && translatedMsg.includes('\n')) {
      formattedMsg = React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
        translatedMsg.split('\n').map((line, idx) => React.createElement('div', { key: idx }, line)),
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
