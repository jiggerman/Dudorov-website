import React, { useState, useEffect } from 'react';
import styles from './Paintings.module.css';
import axios from 'axios';

const Paintings = ({ id }) => {
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedPainting, setSelectedPainting] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка картин из API
  useEffect(() => {
    const fetchPaintings = async () => {
      try {
        const response = await axios.get('https://chistyakov.tech/api/api/paintings');
        setPaintings(response.data);
      } catch (err) {
        console.error('Ошибка при загрузке картин:', err);
        setError('Не удалось загрузить картины. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaintings();
  }, []);

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

  if (paintings.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>Картины не найдены</p>
      </div>
    );
  }

  return (
    <section id={id} className="paintings">
    <div className={styles.paintingsBlock}>
      <div className={styles.container}>
        <h2 className={styles.title}>КАРТИНЫ</h2>
        
        <div className={styles.buttons}>
          <button className={styles.activeButton}>Галерея</button>
          <button className={styles.inactiveButton}>Приобрести картины</button>
        </div>

        <div className={styles.gallery}>
          {visiblePaintings.map(painting => (
            <div 
              key={painting.id} 
              className={styles.paintingCard} 
              onClick={() => openPaintingPopup(painting)}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={`https://chistyakov.tech/api/${painting.image_url}`} 
                  alt={painting.title} 
                  className={styles.paintingImage}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/placeholder.jpg'; // Запасное изображение
                  }}
                />
              </div>
              <div className={styles.paintingInfo}>
                <h3 className={styles.paintingTitle}>{painting.title}</h3>
                <p className={styles.paintingYear}>{painting.year}</p>
                <p className={styles.paintingDescription}>{painting.description}</p>
              </div>
            </div>
          ))}
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
                      src={`https://chistyakov.tech/api/${selectedPainting.image_url}`}
                      alt={selectedPainting.title}
                      className={styles.popupImage}
                    />
                  </div>
                </div>
                <div className={styles.popupInfoColumn}>
                  <h3 className={styles.popupTitle}>{selectedPainting.title}</h3>
                  <p className={styles.popupYear}>{selectedPainting.year}</p>
                  <p className={styles.popupDescription}>{selectedPainting.description}</p>
                </div>
              </div>
            ) : (
              <div className={styles.popupRows}>
                <div className={styles.popupTopImage}>
                  <div className={styles.popupImageContainer}>
                    <img
                      src={`https://chistyakov.tech/api/${selectedPainting.image_url}`}
                      alt={selectedPainting.title}
                      className={styles.popupImage}
                    />
                  </div>
                </div>
                <div className={styles.popupBottomInfo}>
                  <h3 className={styles.popupTitle}>{selectedPainting.title}</h3>
                  <p className={styles.popupYear}>{selectedPainting.year}</p>
                  <p className={styles.popupDescription}>{selectedPainting.description}</p>
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