import React, { useState, useEffect, useRef } from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'
import { speak } from '../utils/tts'

export default function MobilePrompt({ lang, mobile, onChangeMobile, onSubmit, t, target, submitting }) {
  const [helper, setHelper] = useState('')
  const [localValue, setLocalValue] = useState(mobile || '')
  const timerRef = useRef(null)
  const lastSpokenRef = useRef(null)

  useEffect(() => {
    setLocalValue(mobile || '')
  }, [mobile])

  function validate(value) {
    if (!value) return { ok: false, msg: '' }
    // allow only digits; valid lengths: 10 or 11
    const digits = String(value).replace(/\D/g, '')
    if (digits.length === 10 ) return { ok: true, msg: '' }
    return { ok: false, msg: t(lang, 'mobileInvalid') }
  }

  const handleChange = (v) => {
    // filter to digits only
    const digits = String(v).replace(/\D/g, '')
    setLocalValue(digits)
    onChangeMobile(digits)
    const res = validate(digits)
    setHelper(res.ok ? '' : res.msg)

    // Debounce spoken feedback to avoid repeating while typing.
    if (timerRef.current) clearTimeout(timerRef.current)
    // speak immediately if user exceeds max allowed (fast feedback)
    if (digits.length > 11) {
      if (lastSpokenRef.current !== 'too-long') {
        try { speak(t(lang, 'mobileInvalid'), lang) } catch (e) {}
        lastSpokenRef.current = 'too-long'
      }
      return
    }

    timerRef.current = setTimeout(() => {
      if (digits.length > 0 && digits.length < 10) {
        if (lastSpokenRef.current !== 'too-short-' + digits.length) {
          try { speak(t(lang, 'mobileInvalid'), lang) } catch (e) {}
          lastSpokenRef.current = 'too-short-' + digits.length
        }
      } else {
        // reset last spoken marker when valid
        lastSpokenRef.current = null
      }
    }, 700)
  }

  const handleSubmitLocal = () => {
    const res = validate(localValue)
    if (!res.ok) {
      // speak the error instead of showing red
      try { speak(t(lang, 'mobileInvalid'), lang) } catch (e) {}
      return
    }
    setHelper('')
    onSubmit()
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>{t(lang, 'enterMobilePrompt')}</Typography>
      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
        <TextField
          label={t(lang, 'enterMobile')}
          fullWidth
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          inputProps={{ inputMode: 'tel', pattern: '[0-9]*', maxLength: 15 }}
        />

        <Button variant="contained" onClick={handleSubmitLocal} disabled={submitting || !localValue} sx={{ minWidth: 160, height: 56 }}>{t(lang, 'submit')}</Button>
      </Box>
    </Box>
  )
}
