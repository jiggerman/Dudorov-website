import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === 'liggerman@mail.ru' && password === 'admin') {
      localStorage.setItem('code', '812901');
      navigate('/verify-code');
    } else {
      setError('Неверные логин или пароль');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginWindow}>
        <h2 className={styles.loginTitle}>Панель админа</h2>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Эл. почта:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button type="submit" className={styles.submitButton}>
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;