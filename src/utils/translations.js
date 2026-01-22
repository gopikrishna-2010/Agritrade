import translations from '../data/translations.json'
export const translationsMap = translations
export const availableLanguages = ['en','te','hi','ta','ml']
export const langToLocale = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  ml: 'ml-IN'
}
export const t = (lang, key) => {
  return (translations[lang] && translations[lang][key]) || translations['en'][key] || key
}
