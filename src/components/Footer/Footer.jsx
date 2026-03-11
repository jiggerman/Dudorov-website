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
              <a 
                href="https://www.spbstu.ru/" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <b>© 2026 Санкт-Петербургский политехнический университет Петра Великого (СПбПУ)</b></a>
              <p>При использовании материалов портала активная ссылка на источник обязательна</p>
            </div>
            
            <div className={styles.column}>
              <a 
                href="https://www.spbstu.ru/upload/personal_data_policy.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit',  display: 'block' }}
              >Политика конфиденциальности</a>
              <a 
                href="https://www.spbstu.ru/upload/personal_cookie.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit',  display: 'block' }}
              >Положение об использовании «cookie» файлов</a>
            </div>
            
            <div className={styles.column}>
              <p>Контакты</p>
              <p>194156, Санкт-Петербург пр. Энгельса, д. 23</p>
              <p>+7(921)915 4329</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;