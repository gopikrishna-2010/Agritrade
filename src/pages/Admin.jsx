import React, { useMemo, useEffect, useState } from 'react'
import { Box, Typography, Grid, Paper } from '@mui/material'
import mockData from '../data/mockData.json'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts'
import { t } from '../utils/translations'

export default function Admin(){
  const language = localStorage.getItem('agri_lang') || 'en'
  const [products, setProducts] = useState([])

  useEffect(() => {
    // disable global TTS while Admin page is open
    try {
      if (typeof window !== 'undefined') {
        const prev = window.__agri_tts_enabled
        window.__agri_tts_enabled = false
        return () => { window.__agri_tts_enabled = prev }
      }
    } catch (e) {}
  }, [])

  const loadProducts = () => {
    const base = (mockData.products || []).concat(JSON.parse(localStorage.getItem('agri_products') || '[]'))
    setProducts(base)
  }

  useEffect(()=> {
    loadProducts()

    const onUpdate = () => loadProducts()
    window.addEventListener('agri_products_updated', onUpdate)
    const onStorage = (ev) => {
      if(ev.key === 'agri_products_updated_ts') loadProducts()
    }
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('agri_products_updated', onUpdate)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const graph1 = useMemo(()=>{
    const map = {}
    products.forEach(p=>{
      if(!map[p.crop]) map[p.crop] = {crop:p.crop, quantity:0, farmers: new Set()}
      map[p.crop].quantity += Number(p.quantity || 0)
      map[p.crop].farmers.add(p.farmerMobile || p.farmerId)
    })
    // include translated label for X axis
    return Object.values(map).map(o=> ({ crop:o.crop, label: t(language, 'crop_'+String(o.crop).toLowerCase()), quantity:o.quantity, farmers: o.farmers.size }))
  },[products])

  const registeredCounts = useMemo(() => {
    const farmerSet = new Set((products || []).map(p => p.farmerMobile).filter(Boolean))
    const purchases = (mockData.purchases || []).concat(JSON.parse(localStorage.getItem('agri_purchases') || '[]'))
    const buyerSet = new Set((purchases || []).map(pu => pu.buyerMobile).filter(Boolean))
    return { farmers: farmerSet.size, buyers: buyerSet.size }
  }, [products])

  const graph2 = useMemo(()=>{
    const purchases = mockData.purchases || []
    const map = {}
    purchases.forEach(pu=>{
      const prod = products.find(pp=> pp.id === pu.productId)
      if(!prod) return
      if(!map[prod.crop]) map[prod.crop] = { crop: prod.crop, purchased:0 }
      map[prod.crop].purchased += Number(pu.quantity || 0)
    })
    return Object.values(map).map(o=> ({ crop:o.crop, label: t(language, 'crop_'+String(o.crop).toLowerCase()), purchased: o.purchased }))
  },[products])

  return (
    <Box sx={{ p:2 }}>
      <Typography variant="h5">{t(language,'dashboard')}</Typography>
      <Grid container spacing={2} sx={{ mt:2 }}>
        <Grid item xs={12}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={6}>
              <Paper sx={{ p:2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">{t(language,'registeredFarmers')}</Typography>
                <Typography variant="h4">{registeredCounts.farmers}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Paper sx={{ p:2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">{t(language,'registeredBuyers')}</Typography>
                <Typography variant="h4">{registeredCounts.buyers}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p:2 }}>
            <Typography>{t(language,'products')} - quantities & number of farmers</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graph1}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" />
                <Bar dataKey="farmers" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p:2 }}>
            <Typography>{t(language,'products')} - purchased quantities by crop</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={graph2}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="purchased" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
