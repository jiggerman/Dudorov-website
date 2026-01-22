import React, { useState, useEffect } from 'react';
import styles from './Exhibition.module.css';

const Exhibition = () => {
  const [popupData, setPopupImage] = useState(null);

  useEffect(() => {
    if (popupData) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [popupData]);

  const handleImageClick = (item) => {
    setPopupImage(item);
  };

  const closePopup = () => {
    setPopupImage(null);
  };

  const exhibitions = [
    { 
      src: '/images/image-18.png', 
      caption: 'Выставка во Дворце Организации Объединенных Наций. Швейцария. Женева. Февраль 2020г.',
      text: 'Во Дворце ООН, Швейцария. Февраль 2020 года.',
      className: styles.large 
    },
    { 
      src: '/images/image-28.png', 
      caption: '«Пальмира Севера» — передвижная выставка...',
      text: 'Во Дворце ООН, Швейцария. Февраль 2020 года.',
      className: styles.small 
    },
    { 
      src: '/images/image-25.png', 
      caption: 'Выставка в Русском доме. ФРГ. Берлин. Февраль 2020г.',
      text: 'Во Дворце ООН, Швейцария. Февраль 2020 года.',
      className: styles.small 
    },
    { 
      src: '/images/image-21.png', 
      caption: 'Выставка в Российском духовно-культурном православном центре. Франция. Париж.',
      text: 'Во Дворце ООН, Швейцария. Февраль 2020 года.',
      className: styles.wideBottom 
    },
    { 
      src: '/images/image-33.png', 
      caption: 'Биеннале, Италия, Генуя',
      text: 'Во Дворце ООН, Швейцария. Февраль 2020 года.',
      className: styles.wideBottomLeft 
    },
    { 
      src: '/images/image-37.png', 
      caption: 'сотрудничество с Пушкинским обществом Америки...',
      text: 'Во Дворце ООН, Швейцария. Февраль 2020 года.',
      className: styles.wideBottomRight 
    }
  ];

  return (
    <div className={styles.container}>
      <p className={styles.mainTitle}>ВЫСТАВКИ</p>

      <div className={styles.grid}>
        {/* Левая большая */}
        <div className={styles.large} onClick={() => handleImageClick(exhibitions[0])}>
          <img src={exhibitions[0].src} alt="exhibition" className={styles.image} />
          <p className={styles.caption}>{exhibitions[0].caption}</p>
        </div>

        {/* Правая сетка */}
        <div className={styles.right}>
          <div className={styles.topRow}>
            {exhibitions.slice(1, 3).map((item, i) => (
              <div key={i} className={item.className} onClick={() => handleImageClick(item)}>
                <img src={item.src} alt="exhibition" className={styles.image} />
                <p className={styles.caption}>{item.caption}</p>
              </div>
            ))}
          </div>
          <div className={styles.wideBottom} onClick={() => handleImageClick(exhibitions[3])}>
            <img src={exhibitions[3].src} alt="exhibition" className={styles.image} />
            <p className={styles.caption}>{exhibitions[3].caption}</p>
          </div>
        </div>
      </div>

      {/* Нижний ряд */}
      <div className={styles.bottomRow}>
        {exhibitions.slice(4).map((item, i) => (
          <div key={i} className={item.className} onClick={() => handleImageClick(item)}>
            <img src={item.src} alt="exhibition" className={styles.image} />
            <p className={styles.caption}>{item.caption}</p>
          </div>
        ))}
      </div>

      {/* Попап */}
      {popupData && (
        <div className={styles.popupOverlay} onClick={closePopup}>
          <div className={styles.textPopup} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closePopup}>×</button>
            <h2 className={styles.popupTitle}>{popupData.caption}</h2>
            <p className={styles.popupText}>{popupData.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exhibition;