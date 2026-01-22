import React, { useContext,useState,useEffect } from 'react'
import { AppBar, Toolbar, Typography, Box, IconButton, useTheme, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, Button } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import HomeIcon from '@mui/icons-material/Home'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { speak } from '../utils/tts'
import { AppContext } from '../App'
import { t } from '../utils/translations'

export default function Header(){
  const { mode, setMode, language, setRoute, route } = useContext(AppContext)
  const theme = useTheme()
  const [ttsOpen, setTtsOpen] = useState(false)
  const [voices, setVoices] = useState([])

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const load = () => setVoices(window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [])
      load()
      window.speechSynthesis.onvoiceschanged = load
      return () => { try { window.speechSynthesis.onvoiceschanged = null } catch(e){} }
    }
  }, [])

  const goHome = () => setRoute('home')

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ display:'flex', justifyContent:'space-between', gap:1 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <IconButton aria-label="home" onClick={goHome} size="large" sx={{ color: theme.palette.primary.dark }}>
            <HomeIcon />
          </IconButton>

          <Typography variant="h6" onClick={goHome} sx={{ cursor: 'pointer', userSelect:'none', color: theme.palette.text.primary }}>
            AgriTrade UI
          </Typography>
        </Box>

        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>{t(language,'theme')}</Typography>
          <IconButton onClick={()=> setMode(prev => prev === 'light' ? 'dark' : 'light')} size="large" sx={{ color: theme.palette.primary.main }}>
            { mode === 'light' ? <Brightness7Icon/> : <Brightness4Icon/> }
          </IconButton>
          { route !== 'admin' && (
            <>
              <IconButton aria-label="tts-test" onClick={() => setTtsOpen(true)} size="large" sx={{ color: theme.palette.primary.main }}>
                <VolumeUpIcon />
              </IconButton>
              <Dialog open={ttsOpen} onClose={() => setTtsOpen(false)}>
                <DialogTitle>TTS Status</DialogTitle>
                <DialogContent>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    { typeof window === 'undefined' || !('speechSynthesis' in window) ? 'SpeechSynthesis not supported in this browser.' : `Voices available: ${voices.length}` }
                  </Typography>
                  <List dense sx={{ maxHeight: 240, overflow: 'auto' }}>
                    {voices.map((v, i) => (
                      <ListItem key={i}>
                        <ListItemText primary={`${v.name || 'unknown'} (${v.lang || 'n/a'})`} />
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={() => { try { speak(t(language,'enterMobilePrompt'), language) } catch(e){ console.error(e) } }}>Play Test</Button>
                    <Button onClick={() => setTtsOpen(false)}>Close</Button>
                  </Box>
                </DialogContent>
              </Dialog>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
