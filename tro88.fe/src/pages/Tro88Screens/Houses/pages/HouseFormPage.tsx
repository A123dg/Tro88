import { useState, useEffect } from 'react'
import { Form, Input, Select, Checkbox, Button, Upload, Flex, Card, Typography, Alert, InputNumber, message } from 'antd'
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useProvincesQuery, useWardsQuery, useHouseDetailQuery } from '../services/query'
import { useCreateHouseMutation, useUpdateHouseMutation } from '../services/mutation'
import { useServices } from '../../../../hooks/useManagement'
import { PageHeader } from '../../shared'
import { ImageManager } from '../../../../shared/components/ImageManager'

const { Title, Paragraph } = Typography

export function HouseFormPage() {
  const navigate = useNavigate()
  const params = useParams({ strict: false }) as { id?: string }
  const houseId = params.id || null
  const isEdit = Boolean(houseId)

  const [form] = Form.useForm()
  const [provinceValue, setProvinceValue] = useState<string | undefined>()
  const [wardValue, setWardValue] = useState<string | undefined>()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [submitError, setSubmitError] = useState('')
  const [existingMediaUrls, setExistingMediaUrls] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<Array<{ serviceId: string; amount: number }>>([])
  const servicesQuery = useServices({ page: 1, pageSize: 100, isActive: true })

  const provinces = useProvincesQuery()
  const wards = useWardsQuery(provinceValue)
  const houseDetail = useHouseDetailQuery(houseId, isEdit)

  const ownerId = localStorage.getItem('authUserId')
  const redirectPath = ownerId ? `/houses/${ownerId}` : '/houses'

  const createMutation = useCreateHouseMutation({
    onSuccess: () => navigate({ to: redirectPath }),
    onError: (error: any) => setSubmitError(error?.message || 'Không thể tạo nhà trọ')
  })

  const updateMutation = useUpdateHouseMutation({
    onSuccess: () => navigate({ to: redirectPath }),
    onError: (error: any) => setSubmitError(error?.message || 'Không thể cập nhật nhà trọ')
  })

  useEffect(() => {
    if (!houseDetail.data) return
    form.setFieldsValue({
      name: houseDetail.data.name,
      address: houseDetail.data.address,
      province: houseDetail.data.tinhThanhOption?.id ?? houseDetail.data.province ?? undefined,
      district: houseDetail.data.xaPhuongOption?.id ?? houseDetail.data.district ?? undefined,
      description: houseDetail.data.description ?? '',
    })
    setProvinceValue(houseDetail.data.tinhThanhOption?.id ?? houseDetail.data.province ?? undefined)
    setWardValue(houseDetail.data.xaPhuongOption?.id ?? houseDetail.data.district ?? undefined)
    if (houseDetail.data.mediaUrls) {
      setExistingMediaUrls(houseDetail.data.mediaUrls)
    }
  }, [houseDetail.data, form])

  const onFinish = async (values: any) => {
    setSubmitError('')
    const payload = {
      name: values.name,
      address: values.address,
      province: provinceValue,
      district: wardValue,
      description: values.description,
      files: selectedFiles,
      mediaUrls: existingMediaUrls,
      services: selectedServices,
    }

    if (isEdit && houseId) {
      updateMutation.mutate({ id: houseId, ...payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isLoading = createMutation.isLoading || updateMutation.isLoading || houseDetail.isLoading

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <PageHeader
        title={isEdit ? 'Sửa nhà trọ' : 'Thêm nhà trọ'}
        subtitle="Thông tin cơ bản, trạng thái duyệt và ảnh đại diện."
        // action={
        //   <Button icon={<ArrowLeftOutlined />} onClick={() => navigate({ to: redirectPath })}>
        //     Quay lại
        //   </Button>
        // }
      />

      <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ services: [] }}
        >
          <Form.Item
            label="Tên nhà trọ"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhà trọ' }]}
          >
            <Input placeholder="Nhập tên nhà trọ" size="large" />
          </Form.Item>

          <Form.Item
            label="Địa chỉ"
            name="address"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ chi tiết" rows={3} />
          </Form.Item>

          <Flex gap="16px">
            <Form.Item
              label="Tỉnh/Thành phố"
              name="province"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder={provinces.isLoading ? 'Đang tải tỉnh...' : 'Chọn tỉnh'}
                optionFilterProp="label"
                loading={provinces.isLoading}
                disabled={provinces.isLoading}
                onChange={(val) => {
                  setProvinceValue(val)
                  setWardValue(undefined)
                  form.setFieldValue('district', undefined)
                }}
                options={(provinces.data ?? [])
                  .filter((p) => {
                    const lower = p.label.trim().toLowerCase()
                    return lower.startsWith('tỉnh') || lower.startsWith('thành phố')
                  })
                  .map((p) => ({ value: p.value, label: p.label }))}
              />
            </Form.Item>

            <Form.Item
              label="Xã/Phường"
              name="district"
              style={{ flex: 1 }}
              rules={[{ required: true, message: 'Vui lòng chọn Xã/Phường' }]}
            >
              <Select
                showSearch
                allowClear
                placeholder={!provinceValue ? 'Chọn tỉnh trước' : wards.isLoading ? 'Đang tải xã/phường...' : 'Chọn xã/phường'}
                optionFilterProp="label"
                loading={wards.isLoading}
                disabled={!provinceValue || wards.isLoading}
                onChange={(val) => setWardValue(val)}
                options={(wards.data ?? [])
                  .filter((w) => {
                    const lower = w.label.trim().toLowerCase()
                    return lower.startsWith('xã') || lower.startsWith('phường') || lower.startsWith('quận')
                  })
                  .map((w) => ({ value: w.value, label: w.label }))}
              />
            </Form.Item>
          </Flex>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea placeholder="Mô tả thêm về nhà trọ" rows={4} />
          </Form.Item>

          {!isEdit && (
            <Paragraph style={{ color: '#8c8c8c', fontStyle: 'italic' }}>
              * Nhà trọ mới sẽ ở trạng thái Chờ duyệt. Ban quản trị duyệt xong mới chuyển sang Hoạt động.
            </Paragraph>
          )}

          {isEdit && (
            <ImageManager
              urls={existingMediaUrls}
              onRemove={(url) => setExistingMediaUrls(existingMediaUrls.filter((u) => u !== url))}
            />
          )}

          <Form.Item label="Hình ảnh nhà trọ">
            <Upload
              accept=".jpg,.jpeg,.png,.jfif"
              beforeUpload={(file) => {
                const ext = file.name.split('.').pop()?.toLowerCase();
                const isValid = ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'jfif';
                if (!isValid) {
                  message.error(`File ${file.name} không đúng định dạng. Chỉ hỗ trợ .jpg, .jpeg, .png, .jfif`);
                  return Upload.LIST_IGNORE;
                }
                setSelectedFiles((current) => [...current, file])
                return false
              }}
              multiple
              fileList={selectedFiles.map((file, idx) => ({
                uid: String(idx),
                name: file.name,
                status: 'done',
              }))}
              onRemove={(file) => {
                const index = Number(file.uid)
                setSelectedFiles((current) => current.filter((_, idx) => idx !== index))
              }}
            >
              <Button icon={<UploadOutlined />}>Upload ảnh nhà trọ</Button>
            </Upload>
          </Form.Item>

          {!isEdit && (
            <Form.Item label="Tiện ích dịch vụ & cấu hình giá mặc định (VNĐ)">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(servicesQuery.data?.items ?? []).map((service) => {
                  const isChecked = selectedServices.some(s => s.serviceId === service.id);
                  return (
                    <Card key={service.id} size="small" style={{ width: '100%', borderRadius: '8px' }}>
                      <Flex justify="space-between" align="center" wrap="wrap" gap="12px">
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServices([...selectedServices, { serviceId: service.id, amount: service.name === 'Điện' ? 3800 : service.name === 'Nước' ? 18000 : 0 }])
                            } else {
                              setSelectedServices(selectedServices.filter(s => s.serviceId !== service.id))
                            }
                          }}
                        >
                          <strong>{service.name}</strong> {service.unit ? `(${service.unit})` : ''}
                        </Checkbox>
                        <Flex align="center" gap="8px">
                          <span>Mức phí:</span>
                          <InputNumber
                            min={0}
                            disabled={!isChecked}
                            value={selectedServices.find(s => s.serviceId === service.id)?.amount ?? (service.name === 'Điện' ? 3800 : service.name === 'Nước' ? 18000 : 0)}
                            onChange={(val) => {
                              setSelectedServices(selectedServices.map(s => s.serviceId === service.id ? { ...s, amount: Number(val ?? 0) } : s))
                            }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
                            style={{ width: '150px' }}
                            addonAfter="đ"
                          />
                        </Flex>
                      </Flex>
                    </Card>
                  );
                })}
              </div>
            </Form.Item>
          )}

          {submitError && (
            <Alert message={submitError} type="error" showIcon style={{ marginBottom: '20px' }} />
          )}

          <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
            <Flex gap="12px" justify="end">
              <Button onClick={() => navigate({ to: redirectPath })}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<SaveOutlined />}
                style={{ background: '#f4845f', borderColor: '#f4845f' }}
              >
                Lưu lại
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
