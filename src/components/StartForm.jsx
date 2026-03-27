import { useState } from 'react'
import { encodeAccessToken } from '../utils/accessTokenManager'
import './ValidationForm.css'
import './StartForm.css'

const STORAGE_KEY = 'session'

function StartForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!name.trim()) newErrors.name = ['This field is required.']
    if (!email.trim()) {
      newErrors.email = ['This field is required.']
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = ['Please enter a valid email address.']
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`

    const token = encodeAccessToken(email.trim(), name.trim(), date, time, '30m')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name: name.trim(), email: email.trim(), token }))

    const basePath = window.location.pathname.endsWith('/')
      ? window.location.pathname
      : `${window.location.pathname}/`
    window.location.href = `${basePath}?${token}`
  }

  return (
    <div className="start-form-wrapper">
      <form className="validation-form start-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>QA Home Assignment</legend>
          <div className="form-group">
            <label htmlFor="start-name">Name <span className="required-asterisk">*</span></label>
            <input
              id="start-name"
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: null })) }}
              placeholder="Your name"
            />
            {errors.name && (
              <div className="field-errors">
                {errors.name.map((error, idx) => (
                  <p key={idx} className="error-message">{error}</p>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="start-email">Email <span className="required-asterisk">*</span></label>
            <input
              id="start-email"
              type="text"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: null })) }}
              placeholder="your@email.com"
            />
            {errors.email && (
              <div className="field-errors">
                {errors.email.map((error, idx) => (
                  <p key={idx} className="error-message">{error}</p>
                ))}
              </div>
            )}
          </div>
        </fieldset>
        <div className="form-actions">
          <button type="submit" className="btn btn-success">Start</button>
        </div>
      </form>
    </div>
  )
}

export default StartForm
