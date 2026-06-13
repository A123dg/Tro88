import { Input, InputNumber, Button, Modal, Table, Select, Row, Col, Card, Space, Spin } from 'antd'
import { useState, useEffect, useMemo } from 'react'
import { DataPage } from '../../../shared/components/DataPage'
import { useUrlListFilters } from '../../../hooks/useUrlListFilters'
import { useUtilityReadings } from './hooks'
import { useColumn } from './hooks/useColumn'
import { ListFilters, UtilityReadingDto } from './service/types'
import useDebounce from '../../../shared/hooks/useDebounce'
import { CustomDatePicker } from '../../../shared/components/custom-datepicker'
import { fetchUtilityReadingPreview, bulkRecordReadings } from '../../../services/managementService'
import { fetchHouses } from '../../../services/houseService'
import { useNotification } from '../../../hooks/useNotification'
import { useMutation, useQuery } from 'react-query'
import dayjs from 'dayjs'
import { ThunderboltOutlined, InfoCircleOutlined } from '@ant-design/icons'

export const UtilityReadingsPage = () => {
  const currentYear = new Date().getFullYear()
  const [filters, setFilters] = useUrlListFilters<ListFilters>({ page: 1, pageSize: 10, year: currentYear })

  const [selectedHouseId, setSelectedHouseId] = useState<string>(localStorage.getItem('selectedHouseId') || '')

  // Fetch list of houses for the owner
  const housesQuery = useQuery('owner-houses-list', () => fetchHouses({ page: 1, pageSize: 100 }))
  const housesList = housesQuery.data?.items ?? []

  // Auto-select first house if none is active
  useEffect(() => {
    if (!selectedHouseId && housesList.length > 0) {
      const firstHouseId = housesList[0].id
      setSelectedHouseId(firstHouseId)
      localStorage.setItem('selectedHouseId', firstHouseId)
    }
  }, [housesList, selectedHouseId])
  const queryFilters = useMemo(() => ({
    ...filters,
    houseId: selectedHouseId || undefined
  }), [filters, selectedHouseId])

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [localKeyword, setLocalKeyword] = useState(filters.keyword ?? '')

  const query = useUtilityReadings(queryFilters)
  const { columns } = useColumn()

  const debounce = useDebounce(500)
  const { showSuccessNotify, showErrorNotify } = useNotification()

  // Modal states
  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [pickerDate, setPickerDate] = useState<dayjs.Dayjs>(dayjs())
  const [previewLoading, setPreviewLoading] = useState(false)
  const [roomsData, setRoomsData] = useState<any[]>([])

  const filteredRoomsData = useMemo(() => {
    if (!activeRoomId) return []
    return roomsData.filter((r) => r.roomId === activeRoomId)
  }, [roomsData, activeRoomId])

  useEffect(() => {
    setLocalKeyword(filters.keyword ?? '')
  }, [filters.keyword])

  const handleKeywordChange = (val: string) => {
    setLocalKeyword(val)
    debounce(() => {
      setFilters((current) => ({ ...current, keyword: val || undefined, page: 1 }))
    })
  }

  // Load preview data for modal
  const loadPreviewData = async (dateVal: dayjs.Dayjs) => {
    if (!selectedHouseId) return
    setPreviewLoading(true)
    try {
      const month = dateVal.month() + 1
      const year = dateVal.year()
      const res = await fetchUtilityReadingPreview(selectedHouseId, month, year)
      const mapped = res.data.map((item) => ({
        ...item,
        electricityNew: item.electricityNew ?? item.electricityOld,
        waterNew: item.waterNew ?? item.waterOld,
        notes: item.notes ?? '',
      }))
      setRoomsData(mapped)
      if (mapped.length > 0) {
        if (!activeRoomId || !mapped.some(r => r.roomId === activeRoomId)) {
          setActiveRoomId(mapped[0].roomId)
        }
      } else {
        setActiveRoomId(null)
      }
    } catch (err: any) {
      showErrorNotify(err?.message || 'Không thể tải chỉ số dự kiến')
    } finally {
      setPreviewLoading(false)
    }
  }

  useEffect(() => {
    if (recordModalOpen) {
      loadPreviewData(pickerDate)
    }
  }, [recordModalOpen, pickerDate])

  const updateRoomField = (roomId: string, field: string, value: any) => {
    setRoomsData((prev) =>
      prev.map((item) => {
        if (item.roomId === roomId) {
          return { ...item, [field]: value }
        }
        return item
      })
    )
  }

  const saveMutation = useMutation(
    (payload: any) => bulkRecordReadings(payload),
    {
      onSuccess: () => {
        showSuccessNotify('Cập nhật chỉ số điện nước và sinh hóa đơn thành công')
        query.refetch()
        setRecordModalOpen(false)
        setActiveRoomId(null)
      },
      onError: (err: any) => {
        showErrorNotify(err?.message || 'Không thể lưu chỉ số điện nước')
      },
    }
  )

  const handleSave = () => {
    const readings = filteredRoomsData.map((item) => ({
      roomId: item.roomId,
      month: pickerDate.month() + 1,
      year: pickerDate.year(),
      electricityNew: item.electricityNew,
      waterNew: item.waterNew,
      notes: item.notes || null,
    }))

    // Validate that new readings are >= old readings
    for (const r of filteredRoomsData) {
      if (r.electricityNew < r.electricityOld) {
        showErrorNotify(`Phòng ${r.roomNumber}: Chỉ số điện mới phải lớn hơn hoặc bằng chỉ số cũ (${r.electricityOld})`)
        return
      }
      if (r.waterNew < r.waterOld) {
        showErrorNotify(`Phòng ${r.roomNumber}: Chỉ số nước mới phải lớn hơn hoặc bằng chỉ số cũ (${r.waterOld})`)
        return
      }
    }

    saveMutation.mutate({ readings })
  }

  const formatVND = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }

  const previewColumns = [
    {
      title: 'Phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text: string) => <strong>P.{text}</strong>,
    },
    {
      title: 'Điện',
      key: 'electricity',
      render: (record: any) => {
        const usage = record.electricityNew - record.electricityOld
        const amount = usage * record.electricityUnitPrice
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>Đầu kỳ: <strong>{record.electricityOld}</strong> kWh</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>Cuối kỳ:</span>
              <InputNumber
                min={record.electricityOld}
                value={record.electricityNew}
                onChange={(val) => updateRoomField(record.roomId, 'electricityNew', val ?? record.electricityOld)}
                style={{ width: '90px' }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Tiêu thụ: {usage} kWh ({formatVND(record.electricityUnitPrice)}/kWh)
            </div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#f4845f' }}>
              Thành tiền: {formatVND(amount)}
            </div>
          </div>
        )
      },
    },
    {
      title: 'Nước',
      key: 'water',
      render: (record: any) => {
        const usage = record.waterNew - record.waterOld
        const amount = usage * record.waterUnitPrice
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div>Đầu kỳ: <strong>{record.waterOld}</strong> m³</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span>Cuối kỳ:</span>
              <InputNumber
                min={record.waterOld}
                value={record.waterNew}
                onChange={(val) => updateRoomField(record.roomId, 'waterNew', val ?? record.waterOld)}
                style={{ width: '90px' }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Tiêu thụ: {usage} m³ ({formatVND(record.waterUnitPrice)}/m³)
            </div>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#f4845f' }}>
              Thành tiền: {formatVND(amount)}
            </div>
          </div>
        )
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (text: string, record: any) => (
        <Input
          value={text}
          onChange={(e) => updateRoomField(record.roomId, 'notes', e.target.value)}
          placeholder="Nhập ghi chú"
        />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (record: any) => (
        <span style={{ color: record.hasContract ? '#52c41a' : '#ff4d4f', fontWeight: '500' }}>
          {record.hasContract ? 'Có hợp đồng' : 'Không hợp đồng'}
        </span>
      ),
    },
  ]

  return (
    <>
      <DataPage<UtilityReadingDto>
        title="Chỉ số điện nước"
        subtitle="Theo dõi chỉ số cũ, chỉ số mới và mức sử dụng theo tháng."
        breadcrumb="Tro88 / Điện nước"
        items={query.data?.items ?? []}
        meta={query.data?.meta}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        onPageChange={(page, pageSize) => setFilters((current) => ({ ...current, page, pageSize: pageSize ?? current.pageSize }))}
        actions={
          <>
            <Select
              placeholder="Chọn nhà trọ"
              value={selectedHouseId || undefined}
              onChange={(value) => {
                setSelectedHouseId(value)
                localStorage.setItem('selectedHouseId', value)
              }}
              options={housesList.map((h) => ({ value: h.id, label: h.name }))}
              style={{ width: 180 }}
            />
            <Input.Search placeholder="Nhập tên phòng" value={localKeyword} onChange={(event) => handleKeywordChange(event.target.value)} enterButton style={{ width: 160 }} />
            <InputNumber min={1} max={12} value={filters.month} onChange={(value: number | null) => setFilters({ ...filters, month: value ?? undefined, page: 1 })} placeholder="Tháng" />
            <InputNumber min={2000} max={9999} value={filters.year} onChange={(value: number | null) => setFilters({ ...filters, year: value ?? undefined, page: 1 })} placeholder="Năm" />
            {selectedHouseId && (
              <Button type="primary" onClick={() => setRecordModalOpen(true)} style={{ background: '#f4845f', borderColor: '#f4845f' }}>
                Cập nhật điện nước
              </Button>
            )}
          </>
        }
        columns={columns}
      />

      <Modal
        title="Cập nhật chỉ số điện nước"
        open={recordModalOpen}
        onCancel={() => {
          setRecordModalOpen(false)
          setActiveRoomId(null)
        }}
        onOk={handleSave}
        okText="Lưu và sinh hóa đơn"
        cancelText="Hủy"
        width={900}
        confirmLoading={saveMutation.isLoading}
      >
        <div style={{ minHeight: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!filteredRoomsData[0] ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <Spin size="large" tip="Đang tải thông tin dịch vụ phòng..." />
            </div>
          ) : (() => {
            const currentRoom = filteredRoomsData[0]
            const elecDiff = (currentRoom.electricityNew ?? currentRoom.electricityOld) - currentRoom.electricityOld
            const waterDiff = (currentRoom.waterNew ?? currentRoom.waterOld) - currentRoom.waterOld
            const elecCost = elecDiff * currentRoom.electricityUnitPrice
            const waterCost = waterDiff * currentRoom.waterUnitPrice
            const totalCost = elecCost + waterCost

            return (
              <>
                <Row gutter={16} align="middle" justify="space-between">
                  <Col span={8}>
                    <Space size="middle">
                      <span><strong>Kỳ thanh toán:</strong></span>
                      <CustomDatePicker
                        picker="month"
                        value={pickerDate}
                        onChange={(date) => {
                          if (date && !Array.isArray(date)) {
                            setPickerDate(date)
                          }
                        }}
                        format="MM/YYYY"
                        allowClear={false}
                      />
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space size="middle">
                      <span><strong>Chọn phòng:</strong></span>
                      <Select
                        placeholder="Chọn phòng"
                        value={activeRoomId || undefined}
                        onChange={(val) => setActiveRoomId(val)}
                        options={roomsData.map((r) => ({ value: r.roomId, label: `Phòng P.${r.roomNumber}` }))}
                        style={{ width: 160 }}
                      />
                    </Space>
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <span>
                      Hợp đồng: {' '}
                      <span style={{ color: currentRoom.hasContract ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
                        {currentRoom.hasContract ? 'Có hiệu lực' : 'Không có'}
                      </span>
                    </span>
                  </Col>
                </Row>

                <Row gutter={20}>
                  {/* Electricity section */}
                  <Col span={12}>
                    <Card
                      title={<span style={{ color: '#1890ff', fontWeight: 'bold' }}><ThunderboltOutlined style={{ marginRight: '6px' }} />Số điện (kWh)</span>}
                      bordered
                      style={{ borderRadius: '8px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Row gutter={12}>
                          <Col span={12}>
                            <div style={{ marginBottom: '6px', color: '#666', fontSize: '13px' }}>Điện tháng trước</div>
                            <InputNumber
                              value={currentRoom.electricityOld}
                              disabled
                              style={{ width: '100%', backgroundColor: '#fafafa', color: '#000', fontWeight: '500' }}
                            />
                          </Col>
                          <Col span={12}>
                            <div style={{ marginBottom: '6px', color: '#333', fontSize: '13px', fontWeight: '500' }}>Điện tháng này</div>
                            <InputNumber
                              min={currentRoom.electricityOld}
                              value={currentRoom.electricityNew}
                              onChange={(val) => updateRoomField(currentRoom.roomId, 'electricityNew', val ?? currentRoom.electricityOld)}
                              style={{ width: '100%' }}
                            />
                          </Col>
                        </Row>

                        <div style={{ padding: '8px 12px', background: '#e6f7ff', borderRadius: '6px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span>Tiêu thụ (Hiệu số):</span>
                            <strong>{elecDiff} kWh</strong>
                          </div>
                          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span>Đơn giá:</span>
                            <span>{formatVND(currentRoom.electricityUnitPrice)}</span>
                          </div>
                          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginTop: '6px', fontWeight: 'bold', color: '#1890ff' }}>
                            <span>Thành tiền:</span>
                            <span>{formatVND(elecCost)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>

                  {/* Water section */}
                  <Col span={12}>
                    <Card
                      title={<span style={{ color: '#52c41a', fontWeight: 'bold' }}><InfoCircleOutlined style={{ marginRight: '6px' }} />Số nước (m³)</span>}
                      bordered
                      style={{ borderRadius: '8px' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Row gutter={12}>
                          <Col span={12}>
                            <div style={{ marginBottom: '6px', color: '#666', fontSize: '13px' }}>Nước tháng trước</div>
                            <InputNumber
                              value={currentRoom.waterOld}
                              disabled
                              style={{ width: '100%', backgroundColor: '#fafafa', color: '#000', fontWeight: '500' }}
                            />
                          </Col>
                          <Col span={12}>
                            <div style={{ marginBottom: '6px', color: '#333', fontSize: '13px', fontWeight: '500' }}>Nước tháng này</div>
                            <InputNumber
                              min={currentRoom.waterOld}
                              value={currentRoom.waterNew}
                              onChange={(val) => updateRoomField(currentRoom.roomId, 'waterNew', val ?? currentRoom.waterOld)}
                              style={{ width: '100%' }}
                            />
                          </Col>
                        </Row>

                        <div style={{ padding: '8px 12px', background: '#f6ffed', borderRadius: '6px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span>Tiêu thụ (Hiệu số):</span>
                            <strong>{waterDiff} m³</strong>
                          </div>
                          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span>Đơn giá:</span>
                            <span>{formatVND(currentRoom.waterUnitPrice)}</span>
                          </div>
                          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', marginTop: '6px', fontWeight: 'bold', color: '#52c41a' }}>
                            <span>Thành tiền:</span>
                            <span>{formatVND(waterCost)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>

                <div>
                  <div style={{ marginBottom: '6px', fontWeight: '500' }}>Ghi chú:</div>
                  <Input.TextArea
                    rows={2}
                    value={currentRoom.notes}
                    onChange={(e) => updateRoomField(currentRoom.roomId, 'notes', e.target.value)}
                    placeholder="Nhập ghi chú thêm cho tháng này (nếu có)"
                  />
                </div>

                <div style={{
                  padding: '12px 20px',
                  background: '#fff7e6',
                  border: '1px solid #ffd591',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', color: '#d46b08', fontWeight: 'bold' }}>TỔNG CỘNG TIỀN ĐIỆN NƯỚC:</span>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#d46b08' }}>
                    {formatVND(totalCost)}
                  </span>
                </div>
              </>
            )
          })()}
        </div>
      </Modal>
    </>
  )
}
