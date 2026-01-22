import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyCode, resendCode } from '../../services/api';
import styles from './VerifyCode.module.css';

const VerifyCode = () => {
  const [code, setCode] = useState(['', '', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem('login_email');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 6) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }

    // Когда все поля заполнены - отправляем автоматически
    if (newCode.every(digit => digit !== '') && index === 6) {
      handleSubmitFromCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`).focus();
    }
    
    if (e.key === 'ArrowLeft' && index > 0) {
      document.getElementById(`code-input-${index - 1}`).focus();
    }
    if (e.key === 'ArrowRight' && index < 6) {
      document.getElementById(`code-input-${index + 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').split('').slice(0, 7);
    
    if (digits.length === 7) {
      const newCode = [...code];
      digits.forEach((digit, index) => {
        newCode[index] = digit;
      });
      setCode(newCode);
      
      setTimeout(() => {
        document.getElementById(`code-input-${Math.min(digits.length - 1, 6)}`).focus();
      }, 10);
    }
  };

  const handleSubmitFromCode = async (fullCode) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Преобразуем строку в число
      const codeNumber = parseInt(fullCode, 10);
      
      const response = await verifyCode(codeNumber);
      
      if (response.success) {
        setSuccess('Код подтвержден успешно!');
        localStorage.setItem('access_token', response.access_token);
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(response.message || 'Неверный код подтверждения');
        setCode(['', '', '', '', '', '', '']);
        document.getElementById('code-input-0').focus();
      }
    } catch (err) {
      setError(err.message || 'Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length === 7) {
      handleSubmitFromCode(fullCode);
    } else {
      setError('Пожалуйста, введите все 7 цифр кода');
    }
  };

  const handleResendCode = async () => {
    if (!email || !canResend) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await resendCode(email);
      
      if (response.success) {
        setSuccess('Новый код отправлен на вашу почту');
        setTimer(300);
        setCanResend(false);
        setCode(['', '', '', '', '', '', '']);
        document.getElementById('code-input-0').focus();
      } else {
        setError(response.message || 'Не удалось отправить код');
      }
    } catch (err) {
      setError('Ошибка при отправке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('login_email');
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.verifyWindow}>
        <h2 className={styles.title}>Подтверждение входа</h2>
        
        <p className={styles.subtitle}>
          Мы отправили 7-значный код подтверждения на почту<br />
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.codeInputContainer}>
            <label className={styles.inputLabel}>Введите код:</label>
            <div className={styles.codeInputs}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`${styles.codeInput} ${error ? styles.errorInput : ''}`}
                  maxLength="1"
                  disabled={isLoading}
                  autoFocus={index === 0}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              ))}
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <div className={styles.timerSection}>
            <p className={styles.timerText}>
              Код действителен: <span className={styles.timer}>{formatTime(timer)}</span>
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading || code.some(digit => digit === '')}
            >
              {isLoading ? 'Проверка...' : 'Подтвердить'}
            </button>
            
            <button
              type="button"
              className={styles.resendButton}
              onClick={handleResendCode}
              disabled={isLoading || !canResend}
            >
              {canResend ? 'Отправить код повторно' : `Повторная отправка через ${formatTime(timer)}`}
            </button>
            
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={isLoading}
            >
              Отмена
            </button>
          </div>
        </form>

        <div className={styles.helpText}>
          <p>Не пришел код?</p>
          <ul>
            <li>Проверьте папку "Спам"</li>
            <li>Убедитесь, что ввели правильный email</li>
            <li>Попробуйте отправить код повторно через 5 минут</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;