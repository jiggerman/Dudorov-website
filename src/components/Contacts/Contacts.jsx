import React, { useState } from 'react';
import styles from './Contacts.module.css';
import contactBgImage from '../../assets/images/image-99.png';
import { sendContactMessage } from '../../services/api';

const Contacts = ({id}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (successMessage || errorMessage) {
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setErrorMessage('Пожалуйста, введите ваше имя');
      return;
    }
    
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage('Пожалуйста, введите корректный email');
      return;
    }
    
    if (!formData.message.trim()) {
      setErrorMessage('Пожалуйста, введите ваше сообщение');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await sendContactMessage(formData);
      
      if (response.success) {
        setSuccessMessage('Сообщение успешно отправлено!');
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        setErrorMessage(response.message || 'Ошибка при отправке сообщения');
      }
    } catch (error) {
      setErrorMessage('Ошибка соединения с сервером. Попробуйте позже.');
      console.error('Contact form error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id={id} className="contacts">
      <div className={styles.contactsBlock}>
        <div className={styles.container}>
          <h2 className={styles.title}>КОНТАКТЫ</h2>
          
          <div className={styles.contactsContent} style={{ backgroundImage: `url(${contactBgImage})` }}>
            <div className={styles.contactsForm}>
              <h3 className={styles.formTitle}>Свяжитесь с нами:</h3>
              
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <input 
                    type="text" 
                    name="name"
                    placeholder="Ваше ФИО" 
                    className={styles.inputField}
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Ваш Email" 
                    className={styles.inputField}
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <textarea 
                    name="message"
                    placeholder="Ваш комментарий" 
                    className={`${styles.inputField} ${styles.textareaField}`}
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>

                {errorMessage && (
                  <div className={styles.errorMessage}>
                    {errorMessage}
                  </div>
                )}
                
                {successMessage && (
                  <div className={styles.successMessage}>
                    {successMessage}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Отправка...' : 'Отправить'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;