import React, { useContext, useState } from 'react'
import { Box, Grid, Card, CardActionArea, CardMedia, CardContent, Typography, Divider } from '@mui/material'
import { AppContext } from '../App'
import LanguageOverlay from './LanguageOverlay'
import { t } from '../utils/translations'
import f2 from '../assests/f2.jpg';
import buyer from '../assests/buyer.jpg';
import admin from '../assests/admin.jpg';



// Updateing the  images for the home screen cards

const cards = [
  {key:'farmer', img: f2},
  {key:'buyer', img: buyer},
  {key:'admin', img: admin}
]

export default function Home() {
  const { setRoute, language, setLanguage } = useContext(AppContext)
  const [openLang, setOpenLang] = useState(false)
  const [target, setTarget] = useState(null)

  const onClickCard = (k) => {
    if (k === 'admin') {
      localStorage.setItem('agri_lang', 'en')
      setRoute('admin')
      return
    }
    setTarget(k)
    setOpenLang(true)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(to bottom right, #b7e4c7, #95d5b2)' // soft green farming background
      }}
    >

      {/* Spacing below header */}
      <Box sx={{ height: '80px' }} />

      {/* MAIN BODY */}
      <Box
        sx={{
          flex: 1,
          p: 3,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
          <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            backgroundColor: 'white',
            borderRadius: 4,
            p: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{ mb: 3, fontWeight: 'bold', color: '#2d6a4f' }}
          >
            Welcome to AgriTrade
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4} justifyContent="center">
            {cards.map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.key}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
                    transition: 'transform 0.25s, box-shadow 0.25s',
                    '&:hover': {
                      transform: 'scale(1.04)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                    <CardActionArea onClick={() => onClickCard(c.key)}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={c.img}
                      alt={c.key}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent>
                      <Typography
                        align="center"
                        variant="h6"
                        sx={{ fontWeight: 600 }}
                      >
                        {t(language, c.key)}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          p: 2,
          backgroundColor: '#1b4332', // dark farming green
          textAlign: 'center',
          color: 'white',
          fontSize: '14px'
        }}
      >
        © {new Date().getFullYear()} AgriTrade – Empowering Farmers & Buyers
      </Box>

      <LanguageOverlay
        open={openLang}
        onClose={() => setOpenLang(false)}
        onConfirm={(lang, mobile) => {
          if (target === 'admin') {
            setRoute('admin')
          } else {
            setRoute(target)
          }
          setOpenLang(false)
        }}
        target={target}
      />
    </Box>
  )
}
