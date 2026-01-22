import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { loginUser } from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Валидация email
      if (!email || !email.includes('@')) {
        setError('Пожалуйста, введите корректный email');
        setIsLoading(false);
        return;
      }

      if (!password) {
        setError('Пожалуйста, введите пароль');
        setIsLoading(false);
        return;
      }

      // Отправляем запрос на сервер
      const response = await loginUser(email, password);
      
      if (response.success) {
        // Сохраняем токен в localStorage или context
        localStorage.setItem('access_token', response.access_token);
        
        // Перенаправляем на страницу верификации кода
        navigate('/verify-code');
      } else {
        setError(response.message || 'Неверные логин или пароль');
      }
    } catch (err) {
      setError(err.message || 'Ошибка соединения с сервером');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
              placeholder="Введите email"
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
              disabled={isLoading}
              placeholder="Введите пароль"
            />
          </div>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;