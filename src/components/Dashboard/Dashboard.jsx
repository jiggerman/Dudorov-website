import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Dashboard.module.css';

const API_BASE_URL = 'https://chistyakov.tech/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [newPainting, setNewPainting] = useState({
    title: '',
    description: '',
    year: '',
    popup_view: 1,
    image: null,
    preview: null
  });

  const [editingPainting, setEditingPainting] = useState({
    id: null,
    title: '',
    description: '',
    year: '',
    popup_view: 1,
    image: null,
    preview: null
  });

  // Загрузка картин из API
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/paintings`);
        setPaintings(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке картин:', err);
        setError('Не удалось загрузить картины');
      } finally {
        setLoading(false);
      }
    };

    fetchPaintings();
  }, []);

  const loadMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  const handleEdit = (id) => {
    const painting = paintings.find(p => p.id === id);
    setEditingPainting({
      id: painting.id,
      title: painting.title,
      description: painting.description,
      year: painting.year,
      popup_view: painting.popup_view,
      image: null,
      preview: `${API_BASE_URL}${painting.image_url}`
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту картину?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/paintings/${id}`);
        setPaintings(paintings.filter(p => p.id !== id));
      } catch (err) {
        console.error('Ошибка при удалении:', err);
      }
    }
  };

  // Фильтрация картин
  const filteredPaintings = paintings.filter(painting =>
    painting.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visiblePaintings = filteredPaintings.slice(0, visibleCount);

  // Обработчики для добавления новой картины
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
    if (!newPainting.title.trim() || !newPainting.image) return;

    const formData = new FormData();
    formData.append('title', newPainting.title);
    formData.append('description', newPainting.description);
    formData.append('year', newPainting.year);
    formData.append('popup_view', newPainting.popup_view);
    formData.append('image', newPainting.image);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/paintings`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPaintings([...paintings, response.data]);
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Ошибка при добавлении:', err);
      alert('Не удалось добавить картину');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPainting.title.trim()) return;

    const formData = new FormData();
    formData.append('title', editingPainting.title);
    formData.append('description', editingPainting.description);
    formData.append('year', editingPainting.year);
    formData.append('popup_view', editingPainting.popup_view);
    
    if (editingPainting.image) {
      formData.append('image', editingPainting.image);
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/paintings/${editingPainting.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setPaintings(paintings.map(p => 
        p.id === editingPainting.id ? response.data : p
      ));
      
      setEditingPainting({
        id: null,
        title: '',
        description: '',
        year: '',
        popup_view: 1,
        image: null,
        preview: null
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Ошибка при обновлении:', err);
      alert('Не удалось обновить картину');
    }
  };

  const resetForm = () => {
    setNewPainting({
      title: '',
      description: '',
      year: '',
      popup_view: 1,
      image: null,
      preview: null
    });
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <h2 className={styles.title}>ЛИЧНЫЙ КАБИНЕТ</h2>
        
        <div className={styles.controls}>
          <button className={styles.addButton} onClick={handleAddNew}>
            Добавить картину
          </button>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
            placeholder="Поиск по названию картины"
          />
        </div>

        {/* Модальное окно добавления */}
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3>Добавить новую картину</h3>
              
              <div className={styles.formGroup}>
                <label>Название картины:</label>
                <input
                  type="text"
                  value={newPainting.title}
                  onChange={(e) => setNewPainting({...newPainting, title: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Описание:</label>
                <textarea
                  value={newPainting.description}
                  onChange={(e) => setNewPainting({...newPainting, description: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Год создания:</label>
                <input
                  type="text"
                  value={newPainting.year}
                  onChange={(e) => setNewPainting({...newPainting, year: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Тип отображения:</label>
                <select
                  value={newPainting.popup_view}
                  onChange={(e) => setNewPainting({...newPainting, popup_view: parseInt(e.target.value)})}
                >
                  <option value={2}>Горизонтальный</option>
                  <option value={1}>Вертикальный</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Изображение:</label>
                <div 
                  className={styles.uploadArea}
                  onClick={() => fileInputRef.current.click()}
                >
                  {newPainting.preview ? (
                    <img src={newPainting.preview} alt="Preview" className={styles.previewImage} />
                  ) : (
                    <span>Нажмите для загрузки изображения</span>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.modalButtons}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                >
                  Отмена
                </button>
                <button 
                  className={styles.saveButton}
                  onClick={handleSaveNew}
                  disabled={!newPainting.title || !newPainting.image}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно редактирования */}
        {isEditModalOpen && editingPainting && (
          <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h3>Редактировать картину</h3>
              
              <div className={styles.formGroup}>
                <label>Название картины:</label>
                <input
                  type="text"
                  value={editingPainting.title}
                  onChange={(e) => setEditingPainting({...editingPainting, title: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Описание:</label>
                <textarea
                  value={editingPainting.description}
                  onChange={(e) => setEditingPainting({...editingPainting, description: e.target.value})}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Год создания:</label>
                <input
                  type="text"
                  value={editingPainting.year}
                  onChange={(e) => setEditingPainting({...editingPainting, year: e.target.value})}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Тип отображения:</label>
                <select
                  value={editingPainting.popup_view}
                  onChange={(e) => setEditingPainting({...editingPainting, popup_view: parseInt(e.target.value)})}
                >
                  <option value={1}>Горизонтальный</option>
                  <option value={2}>Вертикальный</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Изображение:</label>
                <div 
                  className={styles.uploadArea}
                  onClick={() => editFileInputRef.current.click()}
                >
                  {editingPainting.preview ? (
                    <img src={editingPainting.preview} alt="Preview" className={styles.previewImage} />
                  ) : (
                    <span>Нажмите для загрузки изображения</span>
                  )}
                  <input
                    type="file"
                    ref={editFileInputRef}
                    onChange={handleEditFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              <div className={styles.modalButtons}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingPainting({
                      id: null,
                      title: '',
                      description: '',
                      year: '',
                      popup_view: 1,
                      image: null,
                      preview: null
                    });
                  }}
                >
                  Отмена
                </button>
                <button 
                  className={styles.saveButton}
                  onClick={handleSaveEdit}
                  disabled={!editingPainting.title}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Галерея картин */}
        <div className={styles.gallery}>
          {visiblePaintings.map(painting => (
            <div key={painting.id} className={styles.paintingCard}>
              <div className={styles.imageContainer}>
                <img 
                  src={`${API_BASE_URL}${painting.image_url}`} 
                  alt={painting.title} 
                  className={styles.paintingImage}
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              </div>
              <div className={styles.paintingInfo}>
                <h3 className={styles.paintingTitle}>{painting.title}</h3>
                <p className={styles.paintingYear}>{painting.year}</p>
                <div className={styles.buttons}>
                  <button className={styles.editButton} onClick={() => handleEdit(painting.id)}>
                    Редактировать
                  </button>
                  <button className={styles.deleteButton} onClick={() => handleDelete(painting.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filteredPaintings.length && (
          <div className={styles.loadMoreWrapper}>
            <button onClick={loadMore} className={styles.loadMoreButton}>
              Загрузить ещё
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;