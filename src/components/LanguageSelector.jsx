import React from 'react'
import { Box, Grid, Paper, Typography, IconButton } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

export default function LanguageSelector({ lang, onSelect, t, availableLanguages }) {
  const LANG_META = {
    en: { labelKey: 'languageEnglish' },
    te: { labelKey: 'languageTelugu' },
    hi: { labelKey: 'languageHindi' },
    ta: { labelKey: 'languageTamil' },
    ml: { labelKey: 'languageMalayalam' }
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {availableLanguages.map((l) => {
          const meta = LANG_META[l] || {}
          const selected = l === lang
          return (
            <Grid item xs={12} sm={6} md={4} key={l}>
              <Paper
                onClick={() => onSelect(l)}
                elevation={selected ? 8 : 2}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  p: 3,
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                role="button"
                aria-pressed={selected}
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelect(l) }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: selected ? 'primary.dark' : 'text.primary' }}>{t(l, meta.labelKey || 'languageEnglish')}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}></Typography>
                </Box>

                <Box>
                  {selected ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckIcon sx={{ color: 'primary.dark' }} />
                    </Box>
                  ) : null}
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
