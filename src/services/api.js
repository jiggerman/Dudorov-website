// services/api.js

const API_URL = 'http://localhost:5000/api';

// Функция для логина
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        access_token: data.access_token,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Ошибка входа'
      };
    }
  } catch (error) {
    console.error('Login API error:', error);
    return {
      success: false,
      message: 'Сервер не отвечает'
    };
  }
};

// Функция для верификации кода
export const verifyCode = async (code) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return {
        success: false,
        message: 'Токен не найден'
      };
    }

    // Отправляем код как число
    const response = await fetch(`${API_URL}/code_2f`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code: code }), // code уже число
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('access_token', data.access_token);
      return {
        success: true,
        access_token: data.access_token,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Неверный код'
      };
    }
  } catch (error) {
    console.error('Verify code API error:', error);
    return {
      success: false,
      message: 'Сервер не отвечает'
    };
  }
};

export const resendCode = async (email) => {
  try {
    const response = await fetch(`${API_URL}/resend-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Ошибка отправки кода'
      };
    }
  } catch (error) {
    console.error('Resend code API error:', error);
    return {
      success: false,
      message: 'Сервер не отвечает'
    };
  }
};

// Проверка авторизации
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return !!token;
};

// Выход из системы
export const logout = () => {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
};

// Получение картин (пример другой функции API)
export const getPaintings = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/paintings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Ошибка получения данных');
    }
  } catch (error) {
    console.error('Get paintings error:', error);
    throw error;
  }
};
// services/api.js - добавить функцию sendContactMessage

export const sendContactMessage = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: data.message || 'Сообщение отправлено успешно'
      };
    } else {
      return {
        success: false,
        message: data.message || 'Ошибка при отправке сообщения'
      };
    }
  } catch (error) {
    console.error('Contact form API error:', error);
    return {
      success: false,
      message: 'Сервер не отвечает'
    };
  }
};

export default {
  loginUser,
  verifyCode,
  isAuthenticated,
  logout,
  getPaintings
};