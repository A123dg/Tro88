import { CloseOutlined } from "@ant-design/icons";
import type { ModalProps } from "antd";
import { Modal } from "antd";
import type { ReactNode } from "react";
import { ModalBody, ModalHeader, ModalHeaderButton, ModalTitle, ModalTitleWrapper } from "./styled";

export interface IBaseModalProps extends ModalProps {
  icon?: ReactNode;
  headerHeight?: string;
  fullScreen?: boolean;
  showHeader?: boolean;
  loading?: boolean;
  hideModal?: () => void;
}

function joinClassName(...items: Array<string | undefined>) {
  return items.filter(Boolean).join(" ");
}

const BaseModal = ({
  title,
  children,
  icon,
  loading,
  fullScreen,
  closeIcon,
  headerHeight = "64px",
  showHeader = true,
  className,
  rootClassName,
  okButtonProps,
  cancelButtonProps,
  ...props
}: IBaseModalProps) => {
  return (
    <Modal
      width="var(--modal-width-lg)"
      rootClassName={joinClassName("modal-form-root", rootClassName)}
      className={joinClassName("modal-form", fullScreen ? "fullScreen" : undefined, className)}
      centered
      closable={false}
      maskClosable
      styles={{
        body: {
          padding: 0,
          overflow: "hidden",
        },
      }}
      okButtonProps={{ size: "large", ...okButtonProps }}
      cancelButtonProps={{ size: "large", ...cancelButtonProps }}
      confirmLoading={loading}
      cancelText="Hủy"
      focusTriggerAfterClose
      {...props}
    >
      {showHeader ? (
        <ModalHeader height={headerHeight}>
          <ModalTitleWrapper>
            <span className="modal-form__icon" aria-hidden="true">{icon ?? "i"}</span>
            <div className="modal-form__title-group">
              <ModalTitle>{title}</ModalTitle>
            </div>
          </ModalTitleWrapper>

          {closeIcon ? (
            closeIcon
          ) : (
            <ModalHeaderButton onClick={props.hideModal ? props.hideModal : props.onCancel}>
              <CloseOutlined style={{ fontSize: 18 }} />
            </ModalHeaderButton>
          )}
        </ModalHeader>
      ) : null}

      <ModalBody className="modal-body">{children}</ModalBody>
    </Modal>
  );
};

export default BaseModal;
