import { Form, Modal, Tabs } from 'antd'
import type { FormProps, ModalProps, TabsProps } from 'antd'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, PropsWithChildren } from 'react'
import React from 'react'

function joinClassName(...items: Array<string | undefined>) {
  return items.filter(Boolean).join(' ')
}

export function ModalHeader({ height, className, style, ...props }: HTMLAttributes<HTMLDivElement> & { height?: string | number }) {
  return React.createElement('div', {
    ...props,
    className: joinClassName('modal-form__header', className),
    style: { ...style, height },
  })
}

export function ModalTitleWrapper({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__title-wrapper', className) })
}

export function ModalTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return React.createElement('h6', { ...props, className: joinClassName('modal-form__title', className) })
}

export function ModalHeaderButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return React.createElement('button', { ...props, type: props.type ?? 'button', className: joinClassName('modal-form__header-button', className) })
}

export function PrintButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return React.createElement('button', { ...props, type: props.type ?? 'button', className: joinClassName('modal-form__print-button', className) })
}

export function ModalBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__body', className) })
}

export function FormButtonGroupWrapper({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__button-group', className) })
}

export function LayoutWrapper({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__layout', className) })
}

export function ContentWrapper({
  $sidebarCollapsed,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLElement> & { $sidebarCollapsed: boolean }) {
  return React.createElement('main', {
    ...props,
    className: joinClassName('modal-form__content', className),
    style: {
      ...style,
      '--modal-form-sidebar-margin': $sidebarCollapsed ? '6rem' : 'var(--sidebar-width)',
    } as CSSProperties,
  })
}

type StyledFormComponent = ((props: FormProps) => React.ReactElement) & {
  Item: typeof Form.Item
}

export const StyledForm = (({ className, ...props }: FormProps) => {
  return React.createElement(Form as any, { ...props, className: joinClassName('modal-form__form', className) })
}) as StyledFormComponent

StyledForm.Item = Form.Item

export function StyledModalDescription({ className, ...props }: ModalProps) {
  return React.createElement(Modal, { ...props, className: joinClassName('modal-form__description-modal', className) })
}

export function StyledDescriptionWrapper({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__description-wrapper', className) })
}

export function DetailContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__detail-content', className) })
}

export function DetailItem({ span, className, style, ...props }: HTMLAttributes<HTMLDivElement> & { span?: number }) {
  return React.createElement('div', {
    ...props,
    className: joinClassName('modal-form__detail-item', className),
    style: { ...style, gridColumn: `span ${span ?? 1}` },
  })
}

export function DetailLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__detail-label', className) })
}

export function DetailValue({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__detail-value', className) })
}

export function MessageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__message-content', className) })
}

export function StyledTabs({ className, ...props }: TabsProps) {
  return React.createElement(Tabs, { ...props, className: joinClassName('modal-form__tabs', className) })
}

export function StyledFilterContent({ className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return React.createElement('div', { ...props, className: joinClassName('modal-form__filter-content', className) })
}
