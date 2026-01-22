// src/components/LanguageOverlay.jsx
import React, { useState, useContext, useEffect } from 'react'
import {
  Modal,
  Box,
  Typography,
  Button,
  Paper,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { AppContext } from '../App'
import { availableLanguages, t, langToLocale } from '../utils/translations'
import LanguageSelector from './LanguageSelector'
import MobilePrompt from './MobilePrompt'

export default function LanguageOverlay({ open, onClose, onConfirm, target }) {
  const { setLanguage: setGlobalLanguage, setMobile: setGlobalMobile } = useContext(AppContext)
  const [lang, setLang] = useState(localStorage.getItem('agri_lang') || 'en')
  const [mobile, setMobile] = useState(localStorage.getItem('agri_mobile') || '')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState('select') // 'select' | 'mobile'

  useEffect(() => {
    // whenever modal opens, reset to current stored values
    if (open) {
      const storedLang = localStorage.getItem('agri_lang') || 'en'
      const storedMobile = localStorage.getItem('agri_mobile') || ''
      setLang(storedLang)
      setMobile(storedMobile)
    }
  }, [open])

  function speak(text, languageCode) {
    if (!text) return
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel()
      } catch (e) {}
      const u = new SpeechSynthesisUtterance(text)
      const locale = langToLocale[languageCode] || 'en-IN'

      // try to pick a best matching voice from available voices
      const voices = (window.speechSynthesis && window.speechSynthesis.getVoices && window.speechSynthesis.getVoices()) || []

      // helper keywords for languages where voice.lang might be absent or non-standard
      const NAME_KEYWORDS = {
        te: ['telugu', 'te'],
        ta: ['tamil', 'ta'],
        ml: ['malayalam', 'ml'],
        hi: ['hindi', 'hi'],
        en: ['english', 'en']
      }

      let best = null
      // exact locale match
      best = voices.find(v => (v.lang || '').toLowerCase() === locale.toLowerCase())
      // prefix match (language only)
      if (!best) {
        const prefix = (locale || '').split('-')[0].toLowerCase()
        best = voices.find(v => (v.lang || '').toLowerCase().startsWith(prefix))
      }
      // name-based heuristics (language name in voice name)
      if (!best) {
        const kw = NAME_KEYWORDS[languageCode] || []
        best = voices.find(v => kw.some(k => (v.name || '').toLowerCase().includes(k) || (v.lang || '').toLowerCase().includes(k)))
      }
      // fallback: prefer India-localized English or voices with India in the name
      if (!best) {
        best = voices.find(v => (v.lang || '').toLowerCase().includes('en-in') || (v.name || '').toLowerCase().includes('india'))
      }
      // last resort: first available
      if (!best) best = voices[0] || null

      if (best) u.voice = best
      u.lang = locale
      // gentle voice tuning
      u.rate = 0.95
      u.pitch = 1.0
      try { window.speechSynthesis.speak(u) } catch(e) {}
    }
  }

  const handleSelectLang = (l) => {
    setLang(l)
    if (target === 'admin') {
      setGlobalLanguage && setGlobalLanguage(l)
      try { localStorage.setItem('agri_lang', l) } catch (e) {}
      onConfirm && onConfirm(l, '')
      setStep('select')
      return
    }
    setStep('mobile')
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      setGlobalLanguage && setGlobalLanguage(lang)
      setGlobalMobile && setGlobalMobile(mobile)
      try { localStorage.setItem('agri_lang', lang) } catch (e) {}
      try { localStorage.setItem('agri_mobile', mobile) } catch (e) {}

      onConfirm && onConfirm(lang, mobile)
      setStep('select')
    } finally {
      setSubmitting(false)
    }
  }

  // speak when the mobile prompt opens (so user hears "enter your mobile number" in selected language)
  useEffect(() => {
    if (step === 'mobile') {
      speak(t(lang, 'enterMobilePrompt'), lang)
    }
  }, [step, lang])

  return (
    <Modal open={!!open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, rgba(43,166,114,0.18), rgba(27,67,50,0.18))',
          p: 2
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: '100%',
            maxWidth: 920,
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          {/* header of modal */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6">{t(lang, 'selectLanguage')}</Typography>
            <IconButton aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* content: step-based UI */}
          <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
            {step === 'select' && (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>{t(lang, 'selectLanguagePrompt')}</Typography>
                <LanguageSelector lang={lang} onSelect={handleSelectLang} t={t} availableLanguages={availableLanguages} />
              </>
            )}

            {step === 'mobile' && (
              <MobilePrompt lang={lang} mobile={mobile} onChangeMobile={setMobile} onSubmit={handleSubmit} t={t} target={target} submitting={submitting} />
            )}
          </Box>
        </Paper>
      </Box>
    </Modal>
  )
}