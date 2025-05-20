import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './VerifyCode.module.css'; // Создайте этот файл стилей

const VerifyCodePage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const expectedCode = localStorage.getItem('code');

    if (code === expectedCode) {
      localStorage.setItem('token', '2'); //fake-jwt-token-123456
      navigate('/dashboard');
    } else {
      setError('Неверный код');
    }
  };

  const handleCancel = () => {
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <div className={styles.verifyWindow}>
        <h2 className={styles.title}>Введите код подтверждения</h2>
        <p className={styles.subtitle}>На вашу почту было выслано письмо с кодом подтверждения учетной записи.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={styles.codeInput}
              placeholder="Введите код"
              required
            />
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton}>
              Готово
            </button>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyCodePage;