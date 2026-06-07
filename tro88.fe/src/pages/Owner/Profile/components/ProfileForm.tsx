import { useEffect, useState, type FormEvent } from 'react'
import { useUpdateProfile } from '../hooks'
import type { UserProfile } from '../service/api'
import dayjs from 'dayjs'
import { CustomDatePicker } from '../../../../shared/components/custom-datepicker'

interface ProfileFormProps {
  user: UserProfile
  isGoogleLogin?: boolean
}

interface ProfileFormData {
  fullName: string
  phoneNumber: string
  citizenId: string
  dateOfBirth: string
}

type ProfileFieldErrors = Partial<Record<keyof ProfileFormData, string>>

const phonePattern = /^(0|\+84)[0-9]{9}$/
const citizenPattern = /^[0-9]{9,12}$/

export function ProfileForm({ user, isGoogleLogin = false }: ProfileFormProps) {
  const updateProfile = useUpdateProfile()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errors, setErrors] = useState<ProfileFieldErrors>({})
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user.fullName || '',
    phoneNumber: user.phoneNumber || '',
    citizenId: user.citizenId || '',
    dateOfBirth: user.dateOfBirth || ''
  })

  useEffect(() => {
    setFormData({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      citizenId: user.citizenId || '',
      dateOfBirth: user.dateOfBirth || ''
    })
  }, [user])

  const validateField = (field: keyof ProfileFormData, value: string) => {
    switch (field) {
      case 'fullName':
        return value.trim().length < 2 ? 'Tối thiểu 2 ký tự' : ''
      case 'phoneNumber':
        return value.trim() && !phonePattern.test(value.trim()) ? 'Số điện thoại không hợp lệ' : ''
      case 'citizenId':
        return value.trim() && !citizenPattern.test(value.trim()) ? 'CCCD/CMND không hợp lệ' : ''
      default:
        return ''
    }
  }

  const handleFieldChange = (field: keyof ProfileFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({
      ...current,
      [field]: validateField(field, value) || undefined
    }))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextErrors: ProfileFieldErrors = {
      fullName: validateField('fullName', formData.fullName),
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      citizenId: validateField('citizenId', formData.citizenId)
    }

    setErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      return
    }

    const data = {
      fullName: formData.fullName.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      citizenId: formData.citizenId.trim(),
      dateOfBirth: formData.dateOfBirth
    }

    updateProfile.mutate(data, {
      onSuccess: () => {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    })
  }

  const isLoading = updateProfile.isLoading

  return (
    <form className="profile-form" onSubmit={onSubmit} noValidate>
      <section className="form-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          Thông tin cơ bản
        </h3>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Họ tên</label>
            <input
              type="text"
              className={`form-input ${errors.fullName ? 'error' : ''}`}
              placeholder="Nhập họ tên"
              value={formData.fullName}
              onChange={handleFieldChange('fullName')}
              aria-invalid={Boolean(errors.fullName)}
            />
            {errors.fullName && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.fullName}
              </span>
            )}
          </div>

          <div className="form-field">
            <label className="form-label">
              Email
              {isGoogleLogin && <span className="google-badge">Google</span>}
            </label>
            <input
              type="email"
              className="form-input disabled"
              value={user.email || ''}
              disabled={true}
            />
            {isGoogleLogin && (
              <span className="field-hint">Email không thể thay đổi khi đăng nhập Google</span>
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3 className="section-title">
          <span className="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <line x1="6" y1="10" x2="6" y2="14" />
              <line x1="10" y1="10" x2="10" y2="14" />
              <line x1="14" y1="10" x2="14" y2="14" />
            </svg>
          </span>
          Liên hệ & Định danh
        </h3>

        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Số điện thoại</label>
            <input
              type="tel"
              className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
              placeholder="Nhập số điện thoại"
              value={formData.phoneNumber}
              onChange={handleFieldChange('phoneNumber')}
              aria-invalid={Boolean(errors.phoneNumber)}
            />
            {errors.phoneNumber && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.phoneNumber}
              </span>
            )}
          </div>

          <div className="form-field">
            <label className="form-label">CCCD/CMND</label>
            <input
              type="text"
              className={`form-input ${errors.citizenId ? 'error' : ''}`}
              placeholder="Nhập số CCCD/CMND"
              value={formData.citizenId}
              onChange={handleFieldChange('citizenId')}
              aria-invalid={Boolean(errors.citizenId)}
            />
            {errors.citizenId && (
              <span className="form-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.citizenId}
              </span>
            )}
          </div>

          <div className="form-field full-width">
            <label className="form-label">Ngày sinh</label>
            <div className="date-input-wrapper">
              <CustomDatePicker
                className="form-input"
                value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
                onChange={(_date, dateString) => setFormData((current) => ({ ...current, dateOfBirth: dateString ? (typeof dateString === 'string' ? dateString : dateString[0]) : '' }))}
                placeholder="Chọn ngày sinh"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="form-footer">
        <div className="footer-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          * Thông tin sẽ được cập nhật ngay lập tức
        </div>

        <button
          type="submit"
          className={`btn-save ${saveSuccess ? 'success' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              Đang lưu...
            </>
          ) : saveSuccess ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Đã lưu!
            </>
          ) : (
            'Lưu thay đổi'
          )}
        </button>
      </div>
    </form>
  )
}