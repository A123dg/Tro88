import { useEffect, useState } from 'react'
import { Form, Input, Select } from 'antd'
import ModalForm from '../../../../shared/components/modal-form/ModalForm'
import { useHouseByIdQuery, useProvincesQuery, useWardsQuery } from '../../services/query'

interface HouseModalProps {
  open: boolean
  onCancel: () => void
  onOk: (values: any) => void
  record?: any
}

const HouseModal: React.FC<HouseModalProps> = ({
  open,
  onCancel,
  onOk,
  record,
}) => {
  const [form] = Form.useForm()
  const isEdit = !!record

  const editingId = record?.id
  const {
    data: detail,
    isLoading: isLoadingDetail,
    refetch: refetchDetail,
  } = useHouseByIdQuery(editingId ?? null)

  const { data: provincesData, isLoading: isLoadingProvinces } = useProvincesQuery()
  const [provinceValue, setProvinceValue] = useState<string | undefined>()
  const [wardValue, setWardValue] = useState<string | undefined>()
  const { data: wardsData, isLoading: isLoadingWards } = useWardsQuery(provinceValue)

  // Reset form khi mở modal
  useEffect(() => {
    if (!open) return

    if (isEdit && editingId) {
      refetchDetail()
    } else {
      form.resetFields()
    }
  }, [open, isEdit, editingId, form])

  // Set giá trị từ detail khi load xong
  useEffect(() => {
    if (!open || !isEdit) return

    const source = detail || record
    if (!source) return

    // Set form values
    form.setFieldsValue({
      name: source.name,
      address: source.address,
      province: source.tinhThanhOption?.id ?? source.province,
      district: source.xaPhuongOption?.id ?? source.district,
      description: source.description || '',
    })

    // Set dropdown values
    setProvinceValue(source.tinhThanhOption?.id ?? source.province ?? undefined)
    setWardValue(source.xaPhuongOption?.id ?? source.district ?? undefined)
  }, [open, isEdit, detail, record, form])

  // Reset dropdown values khi đóng modal
  useEffect(() => {
    if (!open) {
      setProvinceValue(undefined)
      setWardValue(undefined)
    }
  }, [open])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()

      const payload = {
        name: values.name?.trim(),
        address: values.address?.trim(),
        province: provinceValue,
        district: wardValue,
        description: values.description?.trim() || '',
      }

      onOk(payload)
    } catch (err) {
      console.error('Validate failed:', err)
    }
  }

  // Build province options với fallback từ detail
  const provinceOptions = [
    ...(provincesData ?? []).map((p: ProvinceOption) => ({ value: p.value, label: p.label })),
    ...(provinceValue && detail?.tinhThanhOption && !(provincesData ?? []).find((p: ProvinceOption) => p.value === provinceValue)
      ? [{ value: provinceValue, label: detail.tinhThanhOption.name }]
      : []
    ),
  ]

  // Build ward options với fallback từ detail
  const wardOptions = [
    ...(wardsData ?? []).map((w: WardOption) => ({ value: w.value, label: w.label })),
    ...(wardValue && detail?.xaPhuongOption && !(wardsData ?? []).find((w: WardOption) => w.value === wardValue)
      ? [{ value: wardValue, label: detail.xaPhuongOption.name }]
      : []
    ),
  ]

  const formItems = [
    {
      label: 'Tên nhà trọ',
      name: 'name',
      rules: [{ required: true, message: 'Vui lòng nhập tên nhà trọ' }],
      component: <Input placeholder="Tên nhà trọ" />,
      span: 24,
    },
    {
      label: 'Địa chỉ',
      name: 'address',
      rules: [{ required: true, message: 'Vui lòng nhập địa chỉ' }],
      component: <Input.TextArea rows={3} placeholder="Địa chỉ" />,
      span: 24,
    },
    {
      label: 'Tỉnh/Thành phố',
      name: 'province',
      component: (
        <Select
          style={{ width: '100%' }}
          showSearch
          allowClear
          placeholder={isLoadingProvinces ? 'Đang tải tỉnh...' : 'Chọn tỉnh'}
          optionFilterProp="label"
          loading={isLoadingProvinces}
          disabled={isLoadingProvinces}
          value={provinceValue}
          onChange={(val) => {
            setProvinceValue(val)
            setWardValue(undefined)
          }}
          options={provinceOptions}
        />
      ),
      span: 12,
    },
    {
      label: 'Xã/Phường',
      name: 'district',
      component: (
        <Select
          style={{ width: '100%' }}
          showSearch
          allowClear
          placeholder={!provinceValue ? 'Chọn tỉnh trước' : isLoadingWards ? 'Đang tải xã/phường...' : 'Chọn xã/phường'}
          optionFilterProp="label"
          loading={isLoadingWards}
          disabled={!provinceValue || isLoadingWards}
          value={wardValue}
          onChange={(val) => setWardValue(val)}
          options={wardOptions}
        />
      ),
      span: 12,
    },
    {
      label: 'Mô tả',
      name: 'description',
      component: <Input.TextArea rows={4} placeholder="Mô tả" />,
      span: 24,
    },
  ]

  return (
    <ModalForm
      title={isEdit ? 'Cập nhật nhà trọ' : 'Thêm mới nhà trọ'}
      okText={isEdit ? 'Cập nhật' : 'Thêm mới'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      form={form}
      formItems={formItems}
      width={800}
      isLoadingGetDetail={isLoadingDetail}
      layout="vertical"
    />
  )
}

export default HouseModal