import { useState, useCallback } from 'react'
import { App } from 'antd'
import { useCreateHouse, useUpdateHouse, useUpdateHouseStatus, useDeleteHouse } from '../services/mutation'
import { IAddHouse, IEditHouse } from '../services/types'

interface UseActionProps {
  refetch: () => void
}

export const useAction = ({ refetch }: UseActionProps) => {
  const { notification } = App.useApp()
  const [openModal, setOpenModal] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [updateRecord, setUpdateRecord] = useState<any>(null)

  const createMutation = useCreateHouse()
  const updateMutation = useUpdateHouse()
  const updateStatusMutation = useUpdateHouseStatus()
  const deleteMutation = useDeleteHouse()

  const showSuccessNotify = (message: string) => {
    notification.success({ message, placement: 'topRight' })
  }

  const showErrorNotify = (message: string) => {
    notification.error({ message, placement: 'topRight' })
  }

  // Mở modal thêm mới
  const handleCreate = useCallback(() => {
    setUpdateRecord(null)
    setOpenModal(true)
  }, [])

  // Mở modal cập nhật
  const handleUpdate = useCallback((record: any) => {
    setUpdateRecord(record)
    setOpenModal(true)
  }, [])

  // Xử lý submit (thêm mới hoặc cập nhật)
  const handleSubmit = useCallback(
    (values: any) => {
      const payload: IAddHouse | IEditHouse = {
        name: values.name,
        address: values.address,
        province: values.province,
        district: values.district,
        description: values.description || '',
      }

      if (updateRecord) {
        // Cập nhật
        updateMutation.mutate(
          { id: updateRecord.id, ...payload } as IEditHouse,
          {
            onSuccess: () => {
              showSuccessNotify('Cập nhật nhà trọ thành công!')
              setOpenModal(false)
              refetch()
            },
            onError: (err: any) => {
              showErrorNotify(err?.message || 'Cập nhật thất bại!')
            },
          }
        )
      } else {
        // Thêm mới
        createMutation.mutate(payload as IAddHouse, {
          onSuccess: () => {
            showSuccessNotify('Thêm mới nhà trọ thành công!')
            setOpenModal(false)
            refetch()
          },
          onError: (err: any) => {
            showErrorNotify(err?.message || 'Thêm mới thất bại!')
          },
        })
      }
    },
    [updateRecord, createMutation, updateMutation, refetch]
  )

  // Cập nhật trạng thái
  const handleUpdateStatus = useCallback(
    (record: any) => {
      const newStatus = record.status === 'Active' ? 'Inactive' : 'Active'
      updateStatusMutation.mutate(
        { id: record.id, status: newStatus },
        {
          onSuccess: () => {
            showSuccessNotify(`Cập nhật trạng thái thành công!`)
            refetch()
          },
          onError: (err: any) => {
            showErrorNotify(err?.message || 'Cập nhật trạng thái thất bại!')
          },
        }
      )
    },
    [updateStatusMutation, refetch]
  )

  // Mở dialog xác nhận xóa
  const handleOpenConfirmDelete = useCallback((record: any) => {
    setUpdateRecord(record)
    setOpenConfirm(true)
  }, [])

  // Xác nhận xóa
  const handleConfirmDelete = useCallback(async () => {
    if (!updateRecord) return

    try {
      await deleteMutation.mutateAsync(updateRecord.id)
      showSuccessNotify('Xóa nhà trọ thành công!')
      setOpenConfirm(false)
      setUpdateRecord(null)
      refetch()
    } catch (error: any) {
      showErrorNotify(error.message || 'Xóa thất bại!')
    }
  }, [updateRecord, deleteMutation, refetch])

  // Đóng modal
  const handleCloseModal = useCallback(() => {
    setOpenModal(false)
    setUpdateRecord(null)
  }, [])

  return {
    handleCreate,
    handleUpdate,
    handleSubmit,
    handleUpdateStatus,
    handleOpenConfirmDelete,
    handleConfirmDelete,
    handleCloseModal,
    openModal,
    openConfirm,
    setOpenConfirm,
    updateRecord,
  }
}