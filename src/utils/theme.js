// src/utils/theme.js
import { createTheme } from '@mui/material/styles'

const baseColors = {
  primary: '#2d6a4f',     // deep agricultural green
  primaryLight: '#74c69d',// fresh green accent
  primaryDark: '#164e2e', // very dark green
  secondary: '#f4a261',   // warm accent (earth / soil)
  backgroundLight: '#e6f4ea',
  surface: '#ffffff',
  muted: '#7a8b7b'
}

export default function getAppTheme(mode = 'light') {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: baseColors.primary,
        light: baseColors.primaryLight,
        dark: baseColors.primaryDark,
        contrastText: '#ffffff'
      },
      secondary: {
        main: baseColors.secondary,
        contrastText: '#212121'
      },
      background: {
        default: isDark ? '#07221a' : baseColors.backgroundLight,
        paper: isDark ? '#0b2b20' : baseColors.surface
      },
      text: {
        primary: isDark ? '#e6f4ea' : '#1b4332',
        secondary: isDark ? '#bcd8c2' : '#3b5a40'
      },
      success: { main: '#2b9348' },
      info: { main: '#4cc9f0' },
      divider: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
    },

    shape: { borderRadius: 12 },

    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700, color: baseColors.primaryDark },
      h5: { fontWeight: 600 },
      body1: { color: isDark ? '#e6f4ea' : '#233423' }
    },

    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: 'transparent',
            boxShadow: 'none'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            textTransform: 'none'
          },
          containedPrimary: {
            boxShadow: '0 6px 18px rgba(46, 117, 82, 0.18)'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            overflow: 'hidden'
          }
        }
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 14
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 12
          }
        }
      }
    }
  })
}
