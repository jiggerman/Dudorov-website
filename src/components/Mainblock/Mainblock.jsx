import React from 'react';
import styles from './Mainblock.module.css';
import smallPhoto from '../../assets/images/logo_01.png';
import largePhoto from '../../assets/images/node-18.png';

const MainBlock = () => {
  return (
    <div className={styles.mainBlock}>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <img src={smallPhoto} alt="Small photo" className={styles.smallPhoto} />
          <div className={styles.textContainer}>
            <span className={styles.gallery}>ГАЛЕРЕЯ</span>
            <span className={styles.name}>АЛЕКСАНДРА</span>
            <span className={styles.surname}>ДУДОРОВА</span>
            <p className={styles.quote}>
              ЖИВОПИСЬ МОЖЕТ БЫТЬ ЛЮБОЙ,<br />КРОМЕ СКУЧНОЙ
            </p>
            <p className={styles.caption}>ХУДОЖЕСТВЕННЫЙ ПРАКТИК ПОЛИТЕХА</p>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <img src={largePhoto} alt="Large photo" className={styles.largePhoto} />
        </div>
      </div>
    </div>
  );
};

export default MainBlock;