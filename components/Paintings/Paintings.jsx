import React, { useState, useEffect } from 'react';
import styles from './Paintings.module.css';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000';

const Paintings = ({ id }) => {
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedPainting, setSelectedPainting] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' или 'sale'

  // Загрузка картин из API
  useEffect(() => {
    const fetchPaintings = async () => {
      setLoading(true);
      setError(null);
      try {
        // Определяем параметр запроса в зависимости от активной вкладки
        const isOnSale = activeTab === 'sale';
        const response = await axios.get(`${API_BASE_URL}/api/paintings`, {
          params: { on_sale: isOnSale }
        });
        
        console.log('Получены картины:', response.data); // Для отладки
        
        // Добавляем правильные URL изображений
        const paintingsWithUrls = response.data.map(painting => ({
          ...painting,
          imageUrl: painting.image_path 
            ? `${API_BASE_URL}/uploads/${painting.image_path}`
            : painting.image_url 
              ? (painting.image_url.startsWith('http') 
                ? painting.image_url 
                : `${API_BASE_URL}${painting.image_url}`)
              : null
        }));
        
        setPaintings(paintingsWithUrls);
        // Сбрасываем счетчик видимых картин при смене вкладки
        setVisibleCount(8);
      } catch (err) {
        console.error('Ошибка при загрузке картин:', err);
        setError('Не удалось загрузить картины. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaintings();
  }, [activeTab]); // Перезагружаем картины при смене вкладки

  const visiblePaintings = paintings.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prev => {
      const newCount = prev + 8;
      return newCount > paintings.length ? paintings.length : newCount;
    });
  };

  const openPaintingPopup = (painting) => {
    setSelectedPainting(painting);
    setIsPopupOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Функция для получения URL изображения
  const getImageUrl = (painting) => {
    if (!painting) return '';
    
    if (painting.imageUrl) return painting.imageUrl;
    
    if (painting.image_path) {
      return `${API_BASE_URL}/uploads/${painting.image_path}`;
    }
    
    if (painting.image_url) {
      return painting.image_url.startsWith('http') 
        ? painting.image_url 
        : `${API_BASE_URL}${painting.image_url}`;
    }
    
    return '/placeholder.jpg';
  };

  // Обработчики для кнопок
  const handleGalleryClick = () => {
    setActiveTab('gallery');
  };

  const handleSaleClick = () => {
    setActiveTab('sale');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Загрузка картин...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <section id={id} className="paintings">
    <div className={styles.paintingsBlock}>
      <div className={styles.container}>
        <h2 className={styles.title}>КАРТИНЫ</h2>
        
        <div className={styles.buttons}>
          <button 
            className={activeTab === 'gallery' ? styles.activeButton : styles.inactiveButton}
            onClick={handleGalleryClick}
          >
            Галерея
          </button>
          <button 
            className={activeTab === 'sale' ? styles.activeButton : styles.inactiveButton}
            onClick={handleSaleClick}
          >
            Приобрести картины
          </button>
        </div>

        {activeTab === 'sale' && paintings.length === 0 ? (
          <div className={styles.emptyState}>
            <p>В данный момент нет картин на продажу</p>
          </div>
        ) : (
          <>
            <div className={styles.gallery}>
              {visiblePaintings.map(painting => {
                const imageUrl = getImageUrl(painting);
                
                return (
                  <div 
                    key={painting.id} 
                    className={`${styles.paintingCard} ${painting.on_sale ? styles.onSale : ''}`} 
                    onClick={() => openPaintingPopup(painting)}
                  >
                    <div className={styles.imageContainer}>
                      <img 
                        src={imageUrl} 
                        alt={painting.title} 
                        className={styles.paintingImage}
                        loading="lazy"
                        onError={(e) => {
                          console.error(`Ошибка загрузки изображения: ${imageUrl}`);
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      {painting.on_sale && activeTab === 'sale' && (
                        <div className={styles.saleBadge}>На продажу</div>
                      )}
                    </div>
                    <div className={styles.paintingInfo}>
                      <h3 className={styles.paintingTitle}>{painting.title}</h3>
                      <p className={styles.paintingYear}>{painting.year}</p>
                      <p className={styles.paintingDescription}>{painting.description}</p>
                      {painting.on_sale && activeTab === 'sale' && (
                        <div className={styles.priceInfo}>
                          <p className={styles.priceLabel}>Цена:</p>
                          <p className={styles.price}>По запросу</p>
                          {/* Если у вас есть поле с ценой, добавьте его здесь */}
                          {/* <p className={styles.price}>{painting.price} руб.</p> */}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {visibleCount < paintings.length && (
              <div className={styles.loadMoreWrapper}>
                <button 
                  onClick={loadMore} 
                  className={styles.loadMoreButton}
                  disabled={visibleCount >= paintings.length}
                >
                  Загрузить ещё
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Попап с деталями картины */}
      {isPopupOpen && selectedPainting && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div
            className={`${styles.popupContent} ${
              selectedPainting.popup_view === 2 ? styles.verticalLayout : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeButton} onClick={closePopup} aria-label="Закрыть">
              &times;
            </button>

            {selectedPainting.popup_view === 1 ? (
              <div className={styles.popupColumns}>
                <div className={styles.popupImageColumn}>
                  <div className={styles.popupImageContainer}>
                    <img
                      src={getImageUrl(selectedPainting)}
                      alt={selectedPainting.title}
                      className={styles.popupImage}
                      onError={(e) => {
                        console.error(`Ошибка загрузки изображения в попапе: ${getImageUrl(selectedPainting)}`);
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    {selectedPainting.on_sale && (
                      <div className={styles.popupSaleBadge}>На продажу</div>
                    )}
                  </div>
                </div>
                <div className={styles.popupInfoColumn}>
                  <h3 className={styles.popupTitle}>{selectedPainting.title}</h3>
                  <p className={styles.popupYear}>{selectedPainting.year}</p>
                  <p className={styles.popupDescription}>{selectedPainting.description}</p>
                  {selectedPainting.on_sale && (
                    <div className={styles.popupPriceInfo}>
                      <h4 className={styles.popupPriceTitle}>Информация о покупке:</h4>
                      <p className={styles.popupPrice}>Цена: по запросу</p>
                      <button className={styles.contactButton}>
                        Связаться для покупки
                      </button>
                      {/* Добавьте здесь свою контактную информацию или форму */}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.popupRows}>
                <div className={styles.popupTopImage}>
                  <div className={styles.popupImageContainer}>
                    <img
                      src={getImageUrl(selectedPainting)}
                      alt={selectedPainting.title}
                      className={styles.popupImage}
                      onError={(e) => {
                        console.error(`Ошибка загрузки изображения в попапе: ${getImageUrl(selectedPainting)}`);
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    {selectedPainting.on_sale && (
                      <div className={styles.popupSaleBadge}>На продажу</div>
                    )}
                  </div>
                </div>
                <div className={styles.popupBottomInfo}>
                  <h3 className={styles.popupTitle}>{selectedPainting.title}</h3>
                  <p className={styles.popupYear}>{selectedPainting.year}</p>
                  <p className={styles.popupDescription}>{selectedPainting.description}</p>
                  {selectedPainting.on_sale && (
                    <div className={styles.popupPriceInfo}>
                      <h4 className={styles.popupPriceTitle}>Информация о покупке:</h4>
                      <p className={styles.popupPrice}>Цена: по запросу</p>
                      <button className={styles.contactButton}>
                        Связаться для покупки
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </section>
  );
};

export default Paintings;