import type { ModalProps } from "antd";
import { Col, Row, Spin, Form } from "antd";
import React from "react";
import BaseModal from "./index";
import { StyledForm } from "./styled";
// import { StyledForm } from "./styled";

interface IFormItem {
  label?: React.ReactNode;
  name?: string | string[];
  component: React.ReactNode;
  rules?: any[];
  span?: number;
  valuePropName?: string;
  getValueFromEvent?: (e: any) => any;
  validateTrigger?: string | string[];
  //thêm validate chuẩn hóa không bị tràn ra khỏi validate max length
  normalize?: (value: any, prevValue: any, prevValues: any) => any;
  raw?: boolean;
  required?: boolean;
  extra?: React.ReactNode;
}

interface ModalFormProps extends ModalProps {
  loading?: boolean;
  open?: boolean; // make open optional or keep it as boolean
  isLoadingGetDetail?: boolean;
  title?: React.ReactNode;
  onCancel: () => void;
  onOk: () => void;
  formItems: IFormItem[];
  form?: any;
  okText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  onFinish?: (values: any) => void;
  width?: number;
  labelCol?: object;
  layout?: "horizontal" | "vertical" | "inline";
  formClassName?: string;
  disableSubmitOnError?: boolean;
}

export const ModalForm: React.FC<ModalFormProps> = ({
  open,
  title,
  loading,
  isLoadingGetDetail,
  onCancel,
  onOk,
  formItems,
  children,
  form,
  onFinish,
  okText = "Thêm mới",
  cancelText = "Hủy",
  width = 900,
  labelCol,
  layout = "horizontal",
  formClassName,
  disableSubmitOnError,
  ...props
}) => {
  const isQuanLyBaiViet = typeof window !== 'undefined' && window.location.pathname.includes('/quan-ly-bai-viet');
  const shouldDisableSubmit = disableSubmitOnError ?? isQuanLyBaiViet;

  const [submittable, setSubmittable] = React.useState(true);
  const values = Form.useWatch([], form);

  const [localLoading, setLocalLoading] = React.useState(false);
  const handleOkClick = async () => {
    if (isQuanLyBaiViet) {
      setLocalLoading(true);
      try {
        await onOk();
      } finally {
        setLocalLoading(false);
      }
    } else {
      onOk();
    }
  };

  React.useEffect(() => {
    if (shouldDisableSubmit && form && open) {
      form
        .validateFields({ validateOnly: true })
        .then(() => setSubmittable(true))
        .catch(() => setSubmittable(false));
    } else {
      setSubmittable(true);
    }
  }, [form, values, open, shouldDisableSubmit]);

  const isLoading = loading || (isQuanLyBaiViet && localLoading);

  return (
    <BaseModal
      open={open}
      title={title}
      hideModal={onCancel}
      onOk={handleOkClick}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      width={width}
      showHeader={true}
      loading={isLoading}
      destroyOnClose
      okButtonProps={{
        disabled: (shouldDisableSubmit ? !submittable : undefined) || isLoading,
      }}
      {...props}
    >
      {isLoadingGetDetail ? (
        <Spin size="small" style={{ display: "block", margin: "32px auto" }} />
      ) : (
        <StyledForm className={formClassName} onFinish={onFinish} form={form} layout={layout} requiredMark>
          <Row gutter={[24, 10]}>
            {formItems.map((item, index) =>
              item.raw ? (
                <React.Fragment key={index}>{item.component}</React.Fragment>
              ) : (
                <Col key={index} span={item.span ? item.span : 12}>
                  <StyledForm.Item
                    label={item.label}
                    {...(item.name ? { name: item.name } : {})}
                    rules={item.rules}
                    required={item.required}
                    valuePropName={item.valuePropName}
                    getValueFromEvent={item.getValueFromEvent}
                    validateTrigger={item.validateTrigger}
                    //thêm validate chuẩn hóa không bị tràn ra khỏi validate max length
                    normalize={item.normalize}
                    extra={item.extra}
                    labelCol={
                      layout === "vertical"
                        ? undefined
                        : typeof labelCol === "object"
                          ? labelCol
                          : { flex: "0 0 160px" }
                    }
                    wrapperCol={layout === "vertical" ? undefined : { flex: "1" }}
                  >
                    {item.component}
                  </StyledForm.Item>
                </Col>
              )
            )}
          </Row>
          {children}
        </StyledForm>
      )}
    </BaseModal>
  );
};

export default ModalForm;
