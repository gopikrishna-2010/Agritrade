// src/App.jsx
import React, { useState, useMemo, createContext, useCallback, useEffect } from 'react'
import { ThemeProvider, Box } from '@mui/material'
import getAppTheme from './utils/theme'
import Header from './components/Header'
import Home from './components/Home'
import Farmer from './pages/Farmer'
import Buyer from './pages/Buyer'
import Admin from './pages/Admin'

export const AppContext = createContext()

export default function App(){
  const initialRoute = localStorage.getItem('agri_route') || 'home'
  const [mode, setMode] = useState(localStorage.getItem('agri_mode') || 'light')
  const [language, setLanguage] = useState(localStorage.getItem('agri_lang') || 'en')
  const [routeState, setRouteState] = useState(initialRoute)
  const [mobile, setMobile] = useState(localStorage.getItem('agri_mobile') || '')

  // create theme from factory
  const theme = useMemo(()=> getAppTheme(mode), [mode])

  const setRoute = useCallback((r) => {
    setRouteState(r)
    try { localStorage.setItem('agri_route', r) } catch(e){}
  }, [])

  useEffect(()=> {
    try { localStorage.setItem('agri_lang', language) } catch(e){}
  }, [language])

  useEffect(()=> {
    try { localStorage.setItem('agri_mode', mode) } catch(e){}
  }, [mode])

  useEffect(()=> {
    if(mobile) try { localStorage.setItem('agri_mobile', mobile) } catch(e){}
  }, [mobile])

  const value = { language, setLanguage, mode, setMode, route: routeState, setRoute, mobile, setMobile }

  return (
    <AppContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
          <Header />
          { routeState === 'home' && <Home /> }
          { routeState === 'farmer' && <Farmer /> }
          { routeState === 'buyer' && <Buyer /> }
          { routeState === 'admin' && <Admin /> }
        </Box>
      </ThemeProvider>
    </AppContext.Provider>
  )
}
