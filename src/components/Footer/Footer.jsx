import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <h2 className={styles.galleryTitle}>Галерея Александра Дудорова</h2>
        </div>
        
        <div className={styles.columnsContainer}>
          <div className={styles.columns}>
            <div className={styles.column}>
              <p><b>© 2025 Санкт-Петербургский политехнический университет Петра Великого (СПбПУ)</b></p>
              <p>При использовании материалов портала активная ссылка на источник обязательна</p>
            </div>
            
            <div className={styles.column}>
              <p>Политика конфиденциальности</p>
              <p>Положение об использовании «cookie» файлов</p>
            </div>
            
            <div className={styles.column}>
              <p>Контакты</p>
              <p>пр-т. Энгельса, 23, Санкт-Петербург, 194156</p>
              <p>+7 (999) 999 99 99</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;