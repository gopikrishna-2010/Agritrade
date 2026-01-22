import { langToLocale } from './translations'

function getVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  return window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : []
}

function chooseVoice(languageCode) {
  const locale = langToLocale[languageCode] || 'en-IN'
  const voices = getVoices()
  if (!voices.length) return null

  // try exact locale
  let best = voices.find(v => (v.lang || '').toLowerCase() === locale.toLowerCase())
  if (best) return best

  // prefix match
  const prefix = (locale || '').split('-')[0].toLowerCase()
  best = voices.find(v => (v.lang || '').toLowerCase().startsWith(prefix))
  if (best) return best

  // name-based heuristics
  const NAME_KEYWORDS = {
    te: ['telugu', 'te'],
    ta: ['tamil', 'ta'],
    ml: ['malayalam', 'ml'],
    hi: ['hindi', 'hi'],
    en: ['english', 'en']
  }
  const kw = NAME_KEYWORDS[languageCode] || []
  best = voices.find(v => kw.some(k => (v.name || '').toLowerCase().includes(k) || (v.lang || '').toLowerCase().includes(k)))
  if (best) return best

  // prefer en-IN or India voices
  best = voices.find(v => (v.lang || '').toLowerCase().includes('en-in') || (v.name || '').toLowerCase().includes('india'))
  if (best) return best

  return voices[0] || null
}

export function speak(text, languageCode) {
  // allow disabling TTS globally (Admin page sets this flag while mounted)
  try {
    if (typeof window !== 'undefined' && window.__agri_tts_enabled === false) return
  } catch (e) {}
  if (!text) return
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  try { window.speechSynthesis.cancel() } catch (e) {}

  const u = new SpeechSynthesisUtterance(text)
  const locale = langToLocale[languageCode] || 'en-IN'
  const voice = chooseVoice(languageCode)
  if (voice) u.voice = voice
  u.lang = locale
  u.rate = 0.95
  u.pitch = 1.0

  try { window.speechSynthesis.speak(u) } catch (e) {}
}

// ensure voices are loaded in some browsers by listening for the event
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { getVoices() }
}
