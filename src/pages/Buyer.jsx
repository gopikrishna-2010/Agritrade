import React, { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button } from '@mui/material'
import mockData from '../data/mockData.json'
import { t } from '../utils/translations'

export default function Buyer(){
  const language = localStorage.getItem('agri_lang') || 'en'
  const [products, setProducts] = useState([])
  const myMobile = localStorage.getItem('agri_mobile') || ''

  useEffect(()=> {
    const loadProducts = () => {
      const base = (mockData.products || []).concat(JSON.parse(localStorage.getItem('agri_products') || '[]'))
      const visible = base.filter(p=> p.farmerMobile !== myMobile)
      setProducts(visible)
    }

    // initial load
    loadProducts()

    // listen for updates
    const onUpdate = (e) => {
      loadProducts()
    }
    window.addEventListener('agri_products_updated', onUpdate)

    // fallback: listen for a timestamp update in localStorage (some environments)
    const onStorage = (ev) => {
      if(ev.key === 'agri_products_updated_ts') loadProducts()
    }
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('agri_products_updated', onUpdate)
      window.removeEventListener('storage', onStorage)
    }
  }, [myMobile])

  return (
    <Box sx={{ p:2 }}>
      <Typography variant="h5">{t(language,'buyer')}</Typography>
      <Typography variant="body2">{t(language,'mobileLabel')}: {myMobile}</Typography>
      <Grid container spacing={2} sx={{ mt:2 }}>
        {products.length ? products.map(p=>(
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card>
              <CardMedia component="img" height="140" image={p.image} />
              <CardContent>
                <Typography>{getTranslatedCrop(p.crop, language)}</Typography>
                <Typography>{t(language,'quantity')}: {p.quantity}</Typography>
                <Typography>{t(language,'rate')}: {p.rate}</Typography>
                <Typography>{p.farmerMobile}</Typography>
                <Typography>{p.date}</Typography>
                <Box sx={{ mt:1 }}>
                  <Button variant="contained" href={'tel:'+p.farmerMobile}>{t(language,'call')}</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )) : <Typography sx={{ m:2 }}>{t(language,'noProducts')}</Typography>}
      </Grid>
    </Box>
  )
}

function getTranslatedCrop(rawCrop, lang) {
  if (!rawCrop) return ''
  const cropList = [
    'wheat','rice','maize','sugarcane','cotton','groundnut','soybean','millet','barley','sorghum',
    'tomato','potato','onion','chili','coriander','peas','lentil','banana','mango','coconut'
  ]
  const key = String(rawCrop).toLowerCase()
  if (cropList.includes(key)) return t(lang, 'crop_'+key)
  const found = cropList.find(c => c.toLowerCase() === String(rawCrop).toLowerCase() || t(lang, 'crop_'+c).toLowerCase() === String(rawCrop).toLowerCase())
  if (found) return t(lang, 'crop_'+found)
  return rawCrop
}
