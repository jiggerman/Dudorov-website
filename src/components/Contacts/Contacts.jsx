import React from 'react';
import styles from './Contacts.module.css';
import contactBgImage from '../../assets/images/image-99.png';

const Contacts = ({id}) => {
  return (
    <section id={id} className="contacts">
    <div className={styles.contactsBlock}>
      <div className={styles.container}>
        <h2 className={styles.title}>КОНТАКТЫ</h2>
        
        <div className={styles.contactsContent} style={{ backgroundImage: `url(${contactBgImage})` }}>
          <div className={styles.contactsForm}>
            <h3 className={styles.formTitle}>Свяжитесь с нами:</h3>
            
            <form className={styles.form}>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="Ваше ФИО" 
                  className={styles.inputField}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <input 
                  type="email" 
                  placeholder="Ваш Email" 
                  className={styles.inputField}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <textarea 
                  placeholder="Ваш комментарий" 
                  className={`${styles.inputField} ${styles.textareaField}`}
                  rows="5"
                />
              </div>
              
              <button type="submit" className={styles.submitButton}>
                Отправить
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