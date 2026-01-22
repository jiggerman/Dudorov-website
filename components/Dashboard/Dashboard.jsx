import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  Paper,
  Tooltip,
  Chip,
  Divider,
  TextareaAutosize,
  FormControlLabel,
  Switch,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MoreHoriz as MoreHorizIcon,
  DragIndicator as DragIndicatorIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack  as ArrowLeftIcon,
  ArrowForward  as ArrowRightIcon,
  Image as ImageIcon,
  BrokenImage as BrokenImageIcon,
  Sell as SellIcon,
  GridView as GridViewIcon,
  ShoppingBag as ShoppingBagIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const API_URL = 'http://localhost:5000/';

// Стилизованные компоненты
const SquareCard = styled(Card)(({ theme }) => ({
  width: '350px', 
  height: '480px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  },
  position: 'relative',
  overflow: 'hidden',
  flexShrink: 0
}));

const SquareImage = styled(Box)({
  width: '100%',
  height: '280px',
  backgroundColor: '#f5f5f5',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0
});

const UploadArea = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.grey[50],
  cursor: 'pointer',
  transition: 'border-color 0.3s',
  '&:hover': {
    borderColor: theme.palette.primary.main
  }
}));

const OrderControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  flexWrap: 'wrap',
  alignItems: 'center'
}));

const PopupColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%'
});

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  fontFamily: 'inherit',
  fontSize: 'inherit',
  resize: 'vertical',
  minHeight: '80px',
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    borderColor: theme.palette.primary.main
  }
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  
  const [paintings, setPaintings] = useState([]);
  const [allPaintings, setAllPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrderMode, setIsOrderMode] = useState(false);
  const [orderedPaintings, setOrderedPaintings] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imageErrors, setImageErrors] = useState({});
  const [viewMode, setViewMode] = useState('all');
  
  const [newPainting, setNewPainting] = useState({
    title: '',
    description: '',
    year: '',
    popup_view: 1,
    on_sale: false,
    mood: '',
    season: '',
    image: null,
    preview: null
  });

  const [editingPainting, setEditingPainting] = useState({
    id: null,
    title: '',
    description: '',
    year: '',
    popup_view: 1,
    on_sale: false,
    mood: '',
    season: '',
    image: null,
    preview: null
  });

  // Загрузка всех картин из API при первом рендере
  useEffect(() => {
    fetchAllPaintings();
  }, []);

  const fetchAllPaintings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/paintings`);
      console.log('All paintings data:', response.data);
      
      setAllPaintings(response.data);
      updateDisplayedPaintings(response.data, 'all');
      setImageErrors({});
    } catch (err) {
      console.error('Ошибка при загрузке картин:', err);
      setError('Не удалось загрузить картины');
      showSnackbar('Ошибка загрузки картин', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Обновляем отображаемые картины при смене режима просмотра
  useEffect(() => {
    if (allPaintings.length > 0) {
      updateDisplayedPaintings(allPaintings, viewMode);
    }
  }, [viewMode, allPaintings]);

  const updateDisplayedPaintings = (allPaintingsData, mode) => {
    let filteredAndSorted;
    
    if (mode === 'all') {
      filteredAndSorted = [...allPaintingsData]
        .filter(painting => painting)
        .sort((a, b) => a.base_position - b.base_position);
    } else {
      filteredAndSorted = allPaintingsData
        .filter(painting => painting && painting.on_sale)
        .sort((a, b) => a.sale_position - b.sale_position);
    }
    
    setPaintings(filteredAndSorted);
    setOrderedPaintings(filteredAndSorted);
    setVisibleCount(12);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  const handleEdit = (id) => {
    const painting = allPaintings.find(p => p.id === id);
    if (!painting) return;
    
    const imageUrl = painting.image_path 
      ? `${API_URL}/uploads/${painting.image_path}`
      : `${API_URL}${painting.image_url || ''}`;
    
    setEditingPainting({
      id: painting.id,
      title: painting.title,
      description: painting.description,
      year: painting.year,
      popup_view: painting.popup_view,
      on_sale: painting.on_sale,
      mood: painting.mood || '',
      season: painting.season || '',
      image: null,
      preview: imageUrl
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту картину?')) {
      try {
        await axios.delete(`${API_URL}/api/paintings/${id}`);
        
        const updatedAllPaintings = allPaintings.filter(p => p.id !== id);
        setAllPaintings(updatedAllPaintings);
        updateDisplayedPaintings(updatedAllPaintings, viewMode);
        
        showSnackbar('Картина успешно удалена', 'success');
      } catch (err) {
        console.error('Ошибка при удалении:', err);
        showSnackbar('Ошибка при удалении', 'error');
      }
    }
  };

  const handleAddNew = () => setIsModalOpen(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPainting({
          ...newPainting,
          image: file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingPainting({
          ...editingPainting,
          image: file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNew = async () => {
    if (!newPainting.title.trim() || !newPainting.image) {
      showSnackbar('Заполните название и загрузите изображение', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', newPainting.title);
    formData.append('description', newPainting.description);
    formData.append('year', newPainting.year);
    formData.append('popup_view', newPainting.popup_view);
    formData.append('on_sale', newPainting.on_sale);
    formData.append('mood', newPainting.mood);
    formData.append('season', newPainting.season);
    formData.append('image', newPainting.image);

    try {
      const response = await axios.post(`${API_URL}/api/paintings`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedAllPaintings = [...allPaintings, response.data];
      setAllPaintings(updatedAllPaintings);
      updateDisplayedPaintings(updatedAllPaintings, viewMode);
      
      resetForm();
      setIsModalOpen(false);
      showSnackbar('Картина успешно добавлена', 'success');
    } catch (err) {
      console.error('Ошибка при добавлении:', err);
      showSnackbar('Не удалось добавить картину', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPainting.title.trim()) {
      showSnackbar('Заполните название картины', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('title', editingPainting.title);
    formData.append('description', editingPainting.description);
    formData.append('year', editingPainting.year);
    formData.append('popup_view', editingPainting.popup_view);
    formData.append('on_sale', editingPainting.on_sale);
    formData.append('mood', editingPainting.mood);
    formData.append('season', editingPainting.season);
    
    if (editingPainting.image) {
      formData.append('image', editingPainting.image);
    }

    try {
      const response = await axios.patch(
        `${API_URL}/api/paintings/${editingPainting.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const updatedAllPaintings = allPaintings.map(p => 
        p.id === editingPainting.id ? response.data : p
      );
      setAllPaintings(updatedAllPaintings);
      updateDisplayedPaintings(updatedAllPaintings, viewMode);
      
      setEditingPainting({
        id: null,
        title: '',
        description: '',
        year: '',
        popup_view: 1,
        on_sale: false,
        mood: '',
        season: '',
        image: null,
        preview: null
      });
      setIsEditModalOpen(false);
      showSnackbar('Картина успешно обновлена', 'success');
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      showSnackbar('Не удалось обновить картину', 'error');
    }
  };

  const resetForm = () => {
    setNewPainting({
      title: '',
      description: '',
      year: '',
      popup_view: 1,
      on_sale: false,
      mood: '',
      season: '',
      image: null,
      preview: null
    });
  };

  // Функции для изменения порядка ТОЛЬКО СТРЕЛОЧКАМИ
  const toggleOrderMode = () => {
    setIsOrderMode(!isOrderMode);
    if (!isOrderMode) {
      setOrderedPaintings([...paintings]);
    }
  };

  const saveOrder = async () => {
    try {
      const paintingsIds = orderedPaintings.map(p => p.id);
      const newPositions = orderedPaintings.map((_, index) => index + 1);

      const orderType = viewMode === 'all' ? 'base' : 'sale';
      
      await axios.post(`${API_URL}/api/update-positions`, {
        type: orderType,
        paintings_ids: paintingsIds,
        new_positions: newPositions
      });

      const updatedAllPaintings = allPaintings.map(painting => {
        const index = paintingsIds.indexOf(painting.id);
        if (index !== -1) {
          if (orderType === 'base') {
            return { ...painting, base_position: newPositions[index] };
          } else {
            return { ...painting, sale_position: newPositions[index] };
          }
        }
        return painting;
      });

      setAllPaintings(updatedAllPaintings);
      updateDisplayedPaintings(updatedAllPaintings, viewMode);
      
      setIsOrderMode(false);
      showSnackbar('Порядок картин успешно сохранен', 'success');
    } catch (err) {
      console.error('Ошибка при сохранении порядка:', err);
      showSnackbar('Ошибка при сохранении порядка', 'error');
    }
  };

  const cancelOrder = () => {
    setIsOrderMode(false);
    setOrderedPaintings([...paintings]);
  };

  const movePaintingUp = (index) => {
    if (index === 0) return;
    const items = [...orderedPaintings];
    [items[index], items[index - 1]] = [items[index - 1], items[index]];
    setOrderedPaintings(items);
  };

  const movePaintingDown = (index) => {
    if (index === orderedPaintings.length - 1) return;
    const items = [...orderedPaintings];
    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    setOrderedPaintings(items);
  };

  // Обработка ошибок изображений
  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Получение URL изображения
  const getImageUrl = (painting) => {
    if (imageErrors[painting.id]) return null;
    
    if (painting.image_path) {
      return `${API_URL}/uploads/${painting.image_path}`;
    }
    if (painting.image_url) {
      return painting.image_url.startsWith('http') 
        ? painting.image_url 
        : `${API_URL}${painting.image_url}`;
    }
    return null;
  };

  // Фильтрация картин по поиску
  const filteredPaintings = paintings.filter(painting =>
    painting.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visiblePaintings = filteredPaintings.slice(0, visibleCount);

  // Обработчики смены режима просмотра
  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
          <Button onClick={fetchAllPaintings} sx={{ ml: 2 }}>
            Повторить
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" component="h1" gutterBottom color="primary.dark" sx={{ mb: 4 }}>
        ЛИЧНЫЙ КАБИНЕТ
      </Typography>
      
      {/* Панель управления */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{ bgcolor: '#00392a', '&:hover': { bgcolor: '#00261a' } }}
              >
                Добавить картину
              </Button>
              
              <Button
                variant={isOrderMode ? "contained" : "outlined"}
                startIcon={isOrderMode ? <SaveIcon /> : <DragIndicatorIcon />}
                onClick={toggleOrderMode}
                color={isOrderMode ? "success" : "primary"}
                disabled={orderedPaintings.length === 0}
              >
                {isOrderMode ? 'Сохранить порядок' : 'Изменить порядок'}
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Поиск по названию картины"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
            />
          </Grid>
        </Grid>

        {/* Контролы для изменения порядка */}
        {isOrderMode && (
          <Box mt={3}>
            <OrderControls>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {viewMode === 'all' 
                  ? 'Изменение порядка в основной галерее' 
                  : 'Изменение порядка в разделе продаж'}
              </Typography>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveOrder}
                color="success"
                size="small"
              >
                Сохранить порядок
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={cancelOrder}
                color="error"
                size="small"
              >
                Отмена
              </Button>
            </OrderControls>
          </Box>
        )}
      </Paper>

      {/* Переключатель режимов просмотра */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={viewMode}
          onChange={handleViewModeChange}
          variant="fullWidth"
          sx={{ 
            '& .MuiTab-root': { 
              py: 2,
              fontSize: '0.9rem'
            }
          }}
        >
          <Tab 
            value="all" 
            label="Все картины" 
            icon={<GridViewIcon />}
            iconPosition="start"
          />
          <Tab 
            value="sale" 
            label="На продажу" 
            icon={<ShoppingBagIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Статистика */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {viewMode === 'all' 
            ? `Всего картин: ${paintings.length}` 
            : `Картин на продажу: ${paintings.length} (${allPaintings.filter(p => p.on_sale).length} из ${allPaintings.length})`}
        </Typography>
        
        {isOrderMode && (
          <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
            Используйте стрелки ↑↓ для изменения порядка
          </Typography>
        )}
      </Box>

      {/* Галерея картин */}
      {isOrderMode ? (
        // Режим изменения порядка ТОЛЬКО СТРЕЛОЧКАМИ
        orderedPaintings.length > 0 ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {orderedPaintings.map((painting, index) => {
              const imageUrl = getImageUrl(painting);
              
              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={3}
                  key={painting.id}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  <SquareCard>
                    <SquareImage>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={painting.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={() => handleImageError(painting.id)}
                        />
                      ) : (
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                          <BrokenImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                          <Typography variant="caption" color="text.secondary">
                            Изображение не загружено
                          </Typography>
                        </Box>
                      )}
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          borderRadius: '50%',
                          width: 30,
                          height: 30,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {index + 1}
                      </Box>
                    </SquareImage>
                    
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography gutterBottom variant="subtitle1" component="h3" noWrap>
                        {painting.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {painting.year}
                      </Typography>
                      <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                        <Chip 
                          label={painting.popup_view === 1 ? 'Вертикальный' : 'Горизонтальный'}
                          size="small" 
                          variant="outlined"
                        />
                        {painting.on_sale && (
                          <Chip 
                            label="В продаже" 
                            size="small" 
                            color="success"
                            icon={<SellIcon />}
                          />
                        )}
                      </Box>
                      <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                        {painting.mood && (
                          <Chip label={`Настроение: ${painting.mood}`} size="small" variant="outlined" />
                        )}
                        {painting.season && (
                          <Chip label={`Сезон: ${painting.season}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Поднять">
                          <IconButton
                            size="small"
                            onClick={() => movePaintingUp(index)}
                            disabled={index === 0}
                            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                          >
                            <ArrowLeftIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Опустить">
                          <IconButton
                            size="small"
                            onClick={() => movePaintingDown(index)}
                            disabled={index === orderedPaintings.length - 1}
                            sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                          >
                            <ArrowRightIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      <Box display="flex" gap={1}>
                        <Tooltip title="Редактировать">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(painting.id)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Удалить">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(painting.id)} 
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardActions>
                  </SquareCard>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              border: '2px dashed #ccc',
              borderRadius: 2,
              mb: 4
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Нет картин для отображения
            </Typography>
          </Box>
        )
      ) : (
        // Обычный режим просмотра
        <Grid container spacing={3}>
          {visiblePaintings.map(painting => {
            const imageUrl = getImageUrl(painting);
            
            return (
              <Grid 
                item 
                xs={12}
                sm={6}
                md={3}
                key={painting.id}
                sx={{ display: 'flex', justifyContent: 'center' }}
              >
                <SquareCard>
                  <SquareImage>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={painting.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={() => handleImageError(painting.id)}
                      />
                    ) : (
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                        <BrokenImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />
                        <Typography variant="caption" color="text.secondary">
                          Изображение не загружено
                        </Typography>
                      </Box>
                    )}
                  </SquareImage>
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    <Typography gutterBottom variant="subtitle1" component="h3" noWrap>
                      {painting.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {painting.year}
                    </Typography>
                    <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                      <Chip 
                        label={painting.popup_view === 1 ? 'Вертикальный' : 'Горизонтальный'}
                        size="small" 
                        variant="outlined"
                      />
                      {painting.on_sale && (
                        <Chip 
                          label="В продаже" 
                          size="small" 
                          color="success"
                          icon={<SellIcon />}
                        />
                      )}
                    </Box>
                    <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                      {painting.mood && (
                        <Chip label={`Настроение: ${painting.mood}`} size="small" variant="outlined" />
                      )}
                      {painting.season && (
                        <Chip label={`Сезон: ${painting.season}`} size="small" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(painting.id)}
                      fullWidth
                      variant="outlined"
                      sx={{ mr: 1 }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(painting.id)}
                      color="error"
                      fullWidth
                      variant="outlined"
                    >
                      Удалить
                    </Button>
                  </CardActions>
                </SquareCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Кнопка "Загрузить ещё" */}
      {!isOrderMode && visibleCount < filteredPaintings.length && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Button
            variant="outlined"
            startIcon={<MoreHorizIcon />}
            onClick={loadMore}
            sx={{ 
              color: '#00392a', 
              borderColor: '#00392a', 
              px: 4, 
              py: 1.5,
              '&:hover': {
                borderColor: '#00261a',
                backgroundColor: 'rgba(0, 57, 42, 0.04)'
              }
            }}
          >
            Показать ещё
          </Button>
        </Box>
      )}

      {/* Если нет картин вообще */}
      {!isOrderMode && paintings.length === 0 && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            border: '2px dashed #ccc',
            borderRadius: 2,
            mb: 4
          }}
        >
          <ImageIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {viewMode === 'all' ? 'Нет картин' : 'Нет картин на продажу'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {viewMode === 'all' 
              ? 'Добавьте первую картину, используя кнопку "Добавить картину"' 
              : 'Выставьте картины на продажу в режиме редактирования'}
          </Typography>
          {viewMode === 'sale' && (
            <Button
              variant="outlined"
              startIcon={<GridViewIcon />}
              onClick={() => setViewMode('all')}
              sx={{ mt: 1 }}
            >
              Перейти ко всем картинам
            </Button>
          )}
        </Box>
      )}

      {/* Модальное окно редактирования */}
      <Dialog 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { maxWidth: '500px' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Редактировать картину</DialogTitle>
        <DialogContent dividers>
          <PopupColumn>
            {/* Изображение */}
            <Box>
              <InputLabel sx={{ mb: 1, fontWeight: 500 }}>Изображение</InputLabel>
              <UploadArea onClick={() => editFileInputRef.current.click()}>
                {editingPainting.preview ? (
                  <>
                    <img
                      src={editingPainting.preview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'contain',
                        marginBottom: '10px'
                      }}
                    />
                    {editingPainting.image ? (
                      <Typography variant="caption" color="primary" sx={{ display: 'block' }}>
                        Новое изображение: {editingPainting.image.name}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Текущее изображение
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <ImageIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                    <Typography variant="body1" color="text.secondary">
                      Нажмите для загрузки нового изображения
                    </Typography>
                  </Box>
                )}
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={handleEditFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </UploadArea>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Оставьте пустым, чтобы сохранить текущее изображение
              </Typography>
            </Box>

            <Divider />

            {/* Основные поля */}
            <TextField
              fullWidth
              label="Название картины *"
              value={editingPainting.title}
              onChange={(e) => setEditingPainting({...editingPainting, title: e.target.value})}
              required
              size="small"
            />

            <Box>
              <InputLabel sx={{ mb: 1, fontWeight: 500 }}>Описание</InputLabel>
              <StyledTextarea
                value={editingPainting.description}
                onChange={(e) => setEditingPainting({...editingPainting, description: e.target.value})}
                placeholder="Введите описание картины..."
                minRows={3}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Год создания"
                  value={editingPainting.year}
                  onChange={(e) => setEditingPainting({...editingPainting, year: e.target.value})}
                  type="number"
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Тип отображения</InputLabel>
                  <Select
                    value={editingPainting.popup_view}
                    onChange={(e) => setEditingPainting({...editingPainting, popup_view: parseInt(e.target.value)})}
                    label="Тип отображения"
                  >
                    <MenuItem value={1}>Вертикальный</MenuItem>
                    <MenuItem value={2}>Горизонтальный</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Дополнительные поля */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Настроение"
                  value={editingPainting.mood}
                  onChange={(e) => setEditingPainting({...editingPainting, mood: e.target.value})}
                  size="small"
                  placeholder="например: спокойное"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Сезон"
                  value={editingPainting.season}
                  onChange={(e) => setEditingPainting({...editingPainting, season: e.target.value})}
                  size="small"
                  placeholder="например: весна"
                />
              </Grid>
            </Grid>

            {/* Статус на продажу */}
            <Box sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editingPainting.on_sale}
                    onChange={(e) => setEditingPainting({...editingPainting, on_sale: e.target.checked})}
                    color="success"
                  />
                }
                label="Выставить на продажу"
              />
              {editingPainting.on_sale && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  Картина будет отображаться в разделе продаж и в основной галерее
                </Typography>
              )}
            </Box>
          </PopupColumn>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => {
            setIsEditModalOpen(false);
            setEditingPainting({
              id: null,
              title: '',
              description: '',
              year: '',
              popup_view: 1,
              on_sale: false,
              mood: '',
              season: '',
              image: null,
              preview: null
            });
          }}>
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={!editingPainting.title}
            sx={{ bgcolor: '#00392a', minWidth: '120px' }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>


      {/* Снекбар для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;