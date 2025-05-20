import React from 'react';
import styles from './Header.module.css';
import vector11 from '../../assets/images/vector-11.svg';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const y = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <div className={styles.headerRow}>
            <Link to="/" className={styles.logo}>ГАЛЕРЕЯ АЛЕКСАНДРА ДУДОРОВА</Link>
            <button
              className={styles.burgerButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Открыть меню"
            >
              ☰
            </button>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.menu}>
              <div className={styles.navLinkDropdown}>
                <p className={styles.menuItem}>RU</p>
                <img src={vector11} alt="Dropdown" className={styles.dropdownIcon} />
              </div>
              <Link to="/gallery" className={styles.menuItem}>Выставки</Link>
              <Link to="/" onClick={() => scrollToSection('about')} className={styles.menuItem}>О художнике</Link>
              <Link to="/" onClick={() => scrollToSection('paintings')} className={styles.menuItem}>Картины</Link>
              <Link to="/" onClick={() => scrollToSection('contacts')} className={styles.menuItem}>Контакты</Link>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className={styles.mobileMenuOverlay}>
            <div className={styles.mobileMenuContent}>
              <button
                className={styles.closeButton}
                onClick={() => setIsMenuOpen(false)}
                aria-label="Закрыть меню"
              >
                &times;
              </button>
              <div className={styles.mobileMenuLinks}>
                <Link to="/gallery" onClick={() => setIsMenuOpen(false)} className={styles.menuItem}>Выставки</Link>
                <Link to="/" onClick={() => scrollToSection('about')} className={styles.menuItem}>О художнике</Link>
                <Link to="/" onClick={() => scrollToSection('paintings')} className={styles.menuItem}>Картины</Link>
                <Link to="/" onClick={() => scrollToSection('contacts')} className={styles.menuItem}>Контакты</Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;