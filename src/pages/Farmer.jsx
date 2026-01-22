import React, { useState, useEffect, useContext } from 'react'
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem, Snackbar } from '@mui/material'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import { t } from '../utils/translations'
import { speak } from '../utils/tts'
import { AppContext } from '../App'

const cropList = [
  'wheat','rice','maize','sugarcane','cotton','groundnut','soybean','millet',
  'tomato','potato','onion','chili','coriander','banana','mango','coconut'
]

// ---------------------------------------------------------
// 1. DEFINE YOUR API URL HERE
// ---------------------------------------------------------
const API_URL = 'http://localhost:8000/products';

export default function Farmer(){
  const { language } = useContext(AppContext)
  const userMobile = localStorage.getItem('agri_mobile') || ''
  const [products, setProducts] = useState([])
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form State
  const [form, setForm] = useState({
    crop:'wheat', 
    image:'https://source.unsplash.com/featured/?wheat', 
    images: [], 
    quantity:0, 
    rate:0
  })
  
  const [snack, setSnack] = useState({ open: false, msg: '' })

  // ---------------------------------------------------------
  // 2. READ (Fetch Data from API)
  // ---------------------------------------------------------
  const fetchProducts = async () => {
    try {
      // We assume the backend can filter by mobile, or we fetch all and filter here.
      // Example: http://localhost:5000/products?farmerMobile=9999999999
      const response = await fetch(`${API_URL}?farmerMobile=${userMobile}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Optional: setSnack({ open: true, msg: "Error loading products" });
    }
  };

  // Load data when component mounts or userMobile changes
  useEffect(()=> {
    if(userMobile) {
      fetchProducts();
    }
  }, [userMobile]);


  // ---------------------------------------------------------
  // 3. CREATE & UPDATE (Handle Submit)
  // ---------------------------------------------------------
  const handleAdd = async () => {
    // Normalize crop name
    const rawCrop = form.crop || ''
    const cropKey = String(rawCrop).toLowerCase()
    const normalizedCrop = cropList.includes(cropKey) ? cropKey : cropKey.replace(/\s+/g, '')

    // Common data object
    const productData = {
      ...form, 
      crop: normalizedCrop, 
      farmerMobile: userMobile, 
      date: new Date().toISOString().slice(0,10)
    };

    try {
      if (editingId) {
        // === UPDATE (PUT) ===
        const response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT', // Or 'PATCH' depending on your backend
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          const updatedProduct = await response.json();
          
          // Update local state (UI) immediately
          setProducts(prev => prev.map(p => p.id === editingId ? updatedProduct : p));
          
          const msg = t(language, 'addedProductSuccess'); // Reusing success message for edit
          setSnack({ open: true, msg });
          try { speak(msg, language) } catch (e) {}
        }
      } else {
        // === CREATE (POST) ===
        // Note: remove ID if your database generates it automatically. 
        // If using mock-server, we might need to generate it or let the server do it.
        const newProductData = { ...productData, id: String(Date.now()) };

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProductData)
        });

        if (response.ok) {
          const createdProduct = await response.json();
          setProducts(prev => [createdProduct, ...prev]);
          
          const msg = t(language, 'addedProductSuccess');
          setSnack({ open: true, msg });
          try { speak(msg, language) } catch (e) {}
        }
      }

      // Cleanup after success
      setEditingId(null);
      setOpen(false);

    } catch (error) {
      console.error("Error saving product:", error);
      setSnack({ open: true, msg: "Error saving data" });
    }
  }

  // ---------------------------------------------------------
  // 4. DELETE (Remove Data)
  // ---------------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm(t(language, 'confirmDelete') || 'Are you sure you want to delete?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setSnack({ open: true, msg: t(language, 'deletedProductSuccess') });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error("Error deleting:", error);
      setSnack({ open: true, msg: "Error deleting product" });
    }
  }

  // Helper for translations (Unchanged)
  function getTranslatedCrop(rawCrop) {
    const lang = language || 'en'
    if (!rawCrop) return ''
    const key = String(rawCrop).toLowerCase()
    if (cropList.includes(key)) return t(lang, 'crop_'+key)
    const found = cropList.find(c => c.toLowerCase() === String(rawCrop).toLowerCase() || t(lang, 'crop_'+c).toLowerCase() === String(rawCrop).toLowerCase())
    if (found) return t(lang, 'crop_'+found)
    return rawCrop
  }

  return (
    <Box sx={{ p:2 }}>
      <Typography variant="h5">{t(language,'farmer')}</Typography>
      <Typography variant="body2">{t(language,'mobileLabel')}: {userMobile}</Typography>
      <Box sx={{ mt:2 }}>
        <Button variant="contained" onClick={()=> { 
          setForm({crop:'wheat', image:'https://source.unsplash.com/featured/?wheat', images: [], quantity:0, rate:0}); 
          setEditingId(null); 
          setOpen(true)
        }}>{t(language,'addProduct')}</Button>
      </Box>

      <Grid container spacing={2} sx={{ mt:2 }}>
        {products.length ? products.map(p=>(
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card>
              <CardMedia component="img" height="140" image={p.image} />
                <CardContent>
                <Typography>{getTranslatedCrop(p.crop, language)}</Typography>
                <Typography>{t(language,'quantity')}: {p.quantity}</Typography>
                <Typography>{t(language,'rate')}: {p.rate}</Typography>
                <Typography>{t(language,'mobileLabel')}: {p.farmerMobile}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                  <Button size="small" onClick={() => {
                    // open dialog for editing
                    setForm({ ...p, images: p.images || [] })
                    setEditingId(p.id)
                    setOpen(true)
                  }}>{t(language,'edit') || 'Edit'}</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(p.id)}>{t(language,'delete') || 'Delete'}</Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )) : <Typography sx={{ m:2 }}>{t(language,'noProducts')}</Typography>}
      </Grid>

      <Dialog open={open} onClose={()=> setOpen(false)} fullWidth>
        <DialogTitle>{t(language,'addProduct')}</DialogTitle>
        <DialogContent>
          <TextField select label={t(language,'selectCrop')} fullWidth value={form.crop} onChange={(e)=> setForm({...form, crop:e.target.value, image:'https://source.unsplash.com/featured/?'+e.target.value})} sx={{ mt:1 }}>
            {cropList.map(c=> <MenuItem value={c} key={c}>{t(language, 'crop_'+c)}</MenuItem>)}
          </TextField>
          <TextField label={t(language,'quantity')} type="number" fullWidth sx={{ mt:1 }} value={form.quantity} onChange={(e)=> setForm({...form, quantity: Number(e.target.value)})}/>
          <TextField label={t(language,'rate')} type="number" fullWidth sx={{ mt:1 }} value={form.rate} onChange={(e)=> setForm({...form, rate: Number(e.target.value)})}/>

          {/* Image upload logic preserved */}
          <Box sx={{ mt:2 }}>
            <input
              accept="image/*"
              id="crop-images-input"
              multiple
              type="file"
              capture="environment"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const files = Array.from(e.target.files || [])
                if (!files.length) return
                const promises = files.map(f => new Promise((res) => {
                  const reader = new FileReader()
                  reader.onload = () => res(String(reader.result))
                  reader.onerror = () => res(null)
                  reader.readAsDataURL(f)
                }))
                const results = await Promise.all(promises)
                const imgs = results.filter(Boolean)
                if (imgs.length) {
                  const prevImgs = form.images || []
                  const newImgs = imgs.filter(s => !prevImgs.includes(s))
                  if (newImgs.length) {
                    const combined = [...prevImgs, ...newImgs]
                    setForm(prev => ({ ...prev, images: combined, image: combined[0] || prev.image }))
                  } else {
                    const msg = t(language, 'duplicateImage')
                    try { speak(msg, language) } catch (e) {}
                  }
                }
              }}
            />
            <label htmlFor="crop-images-input">
              <Button component="span" startIcon={<PhotoCamera/>} variant="outlined">{t(language,'upload')}</Button>
            </label>

            {form.images && form.images.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {form.images.map((src, idx) => (
                  <Box key={idx} sx={{ width: 88, height: 88, borderRadius: 1, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <img src={src} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mt:2, display:'flex', justifyContent:'flex-end' }}>
            <Button variant="contained" onClick={handleAdd}>{t(language,'submit')}</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={()=> setSnack({ open: false, msg: '' })} message={snack.msg} />
    </Box>
  )
}