import { FormEvent, useEffect, useState } from 'react'
import { fetchCurrentUser, updateCurrentUser } from '../../services/userService'
import { UserDto } from '../../types/app.types'

function getDefaultRedirect(role?: string) {
  if (role === 'Tenant') return '/my/rooms'
  if (role === 'Admin') return '/admin'
  return '/dashboard'
}

export function CompleteProfilePage() {
  const [user, setUser] = useState<UserDto | null>(null)
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCurrentUser()
      .then((response) => {
        const current = response.data
        setUser(current)
        setFullName(current.fullName ?? '')
        setPhoneNumber(current.phoneNumber ?? '')
        setDateOfBirth(current.dateOfBirth ? current.dateOfBirth.slice(0, 10) : '')
      })
      .catch(() => setError('Không thể tải thông tin tài khoản.'))
      .finally(() => setLoading(false))
  }, [])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    updateCurrentUser({ fullName, phoneNumber, dateOfBirth })
      .then((response) => {
        localStorage.setItem('authFullName', response.data.fullName)
        window.location.href = getDefaultRedirect(response.data.role)
      })
      .catch(() => setError('Không thể cập nhật hồ sơ. Vui lòng kiểm tra lại thông tin.'))
      .finally(() => setSaving(false))
  }

  return (
    <main className="complete-profile-page">
      <section className="login-panel complete-profile-card">
        <div className="login-panel__brand">
          <span>88</span>
          <div>
            <strong>Tro88</strong>
            <small>Hoàn thiện hồ sơ</small>
          </div>
        </div>
        <header>
          <h1>Thông tin cá nhân</h1>
          <p>Cập nhật họ tên, số điện thoại và ngày sinh trước khi tiếp tục.</p>
        </header>

        {loading ? <p>Đang tải hồ sơ...</p> : (
          <form className="login-form" onSubmit={submit}>
            <label>
              Họ tên
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
            </label>
            <label>
              Email
              <input value={user?.email ?? ''} disabled />
            </label>
            <label>
              Số điện thoại
              <input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} required />
            </label>
            <label>
              Ngày sinh
              <input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} required />
            </label>
            {error ? <p className="login-error">{error}</p> : null}
            <button className="app-button app-button--primary app-button--full" type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Tiếp tục'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
