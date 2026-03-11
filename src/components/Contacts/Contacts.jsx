import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { sendContactMessage } from '../../services/api';
import axios from 'axios';
import contactBgImage from '../../assets/images/image-99.png';

const API_URL = 'http://localhost:5000/';

// Стилизованные компоненты
const ContactsSection = styled('section')({
  width: '100%',
  marginTop: '-10px',
  position: 'relative',
  '@media (max-width: 576px)': {
    marginTop: 0,
    overflowX: 'hidden',
    width: '100vw',
    position: 'relative',
    left: '50%',
    right: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw'
  }
});

const ContentContainer = styled(Container)({
  width: '100%',
  margin: '0 auto',
  padding: '0px',
  paddingTop: '100px',
  boxSizing: 'border-box',
  '@media (max-width: 576px)': {
    paddingTop: '40px',
    maxWidth: '100%',
    paddingRight: '40px'
  }
});

const Title = styled(Typography)({
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 500,
  fontSize: '56px',
  paddingLeft: '68px',
  lineHeight: 1,
  color: 'rgba(0, 57, 42, 1)',
  margin: '0 0 40px 0',
  textAlign: 'left',
  '@media (max-width: 576px)': {
    fontSize: '22px',
    paddingLeft: '20px',
    marginBottom: '30px'
  }
});

const ContactsContent = styled(Box)({
  width: '100%',
  height: '950px', // Еще немного увеличили высоту
  backgroundImage: `url(${contactBgImage})`,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  '@media (max-width: 576px)': {
    height: 'auto',
    minHeight: '750px',
    padding: '20px',
    backgroundSize: 'cover'
  }
});

const WhiteCard = styled(Paper)({
  width: '1000px',
  height: '800px', // Увеличили высоту
  background: 'white',
  padding: '60px 50px',
  boxSizing: 'border-box',
  display: 'flex',
  boxShadow: 'none',
  '@media (max-width: 576px)': {
    width: '95%',
    height: 'auto',
    padding: '30px 20px',
    margin: '20px 0'
  }
});

const LeftColumn = styled(Box)({
  width: '40%',
  paddingRight: '30px',
  borderRight: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(0, 57, 42, 0.3)',
    borderRadius: '4px'
  },
  '@media (max-width: 576px)': {
    width: '100%',
    borderRight: 'none',
    paddingRight: 0,
    marginBottom: '30px',
    overflowY: 'visible'
  }
});

const RightColumn = styled(Box)({
  width: '60%',
  paddingLeft: '30px',
  display: 'flex',
  flexDirection: 'column',
  '@media (max-width: 576px)': {
    width: '100%',
    paddingLeft: 0
  }
});

const ContactInfoTitle = styled(Typography)({
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 500,
  fontSize: '32px',
  margin: '0 0 25px 0',
  color: 'rgba(0, 57, 42, 1)',
  paddingLeft: '8px',
  '@media (max-width: 576px)': {
    fontSize: '22px',
    textAlign: 'center',
    paddingLeft: 0,
    marginBottom: '25px'
  }
});

const ContactItem = styled(Box)({
  marginBottom: '25px',
  '&:last-child': {
    marginBottom: 0
  }
});

const ContactLabel = styled(Typography)({
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 600,
  fontSize: '15px',
  color: '#00392a',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '1px'
});

const ContactValue = styled(Typography)({
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 400,
  fontSize: '16px',
  color: '#333',
  lineHeight: 1.5,
  whiteSpace: 'pre-line',
  wordBreak: 'break-word'
});

const StyledLink = styled(Link)({
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 400,
  fontSize: '16px',
  color: '#00392a',
  textDecoration: 'none',
  display: 'block',
  marginBottom: '5px',
  '&:hover': {
    textDecoration: 'underline',
    color: '#00261a'
  }
});

const FormTitle = styled(Typography)({
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 500,
  fontSize: '32px',
  margin: '0 0 25px 0',
  color: 'rgba(0, 57, 42, 1)',
  paddingLeft: '8px',
  '@media (max-width: 576px)': {
    fontSize: '22px',
    textAlign: 'center',
    paddingLeft: 0,
    marginBottom: '25px'
  }
});

const StyledForm = styled('form')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  height: '100%',
  justifyContent: 'space-between'
});

const StyledTextField = styled(TextField)(({ theme, multiline }) => ({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: multiline ? 'auto' : '60px',
    fontFamily: 'Manrope, sans-serif',
    fontSize: '18px',
    '& fieldset': {
      border: '2px solid #000000',
      borderRadius: 0
    },
    '&:hover fieldset': {
      borderColor: '#000000'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(0, 57, 42, 1)',
      borderWidth: '2px'
    }
  },
  '& .MuiOutlinedInput-input': {
    padding: multiline ? '20px' : '0 20px',
    height: multiline ? 'auto' : '60px',
    '&::placeholder': {
      color: '#999',
      opacity: 1
    }
  },
  '@media (max-width: 576px)': {
    '& .MuiOutlinedInput-root': {
      height: multiline ? '120px' : '50px',
      fontSize: '16px'
    },
    '& .MuiOutlinedInput-input': {
      padding: multiline ? '15px' : '0 15px'
    }
  }
}));

const StyledButton = styled(Button)({
  width: '200px',
  height: '60px',
  border: '2px solid #000000',
  backgroundColor: 'transparent',
  fontFamily: 'Manrope, sans-serif',
  fontWeight: 500,
  fontSize: '18px',
  margin: '10px auto 0',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  color: '#000000',
  borderRadius: 0,
  '&:hover': {
    backgroundColor: 'rgba(0, 57, 42, 1)',
    color: '#ffffff'
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  '@media (max-width: 576px)': {
    width: '160px',
    height: '50px',
    fontSize: '16px',
    marginTop: '10px'
  }
});

const StyledSwitch = styled(Switch)({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: 'rgba(0, 57, 42, 1)',
    '&:hover': {
      backgroundColor: 'rgba(0, 57, 42, 0.1)'
    }
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: 'rgba(0, 57, 42, 1)'
  }
});

const StyledFormControl = styled(FormControl)({
  width: '100%',
  '& .MuiOutlinedInput-root': {
    height: '60px',
    fontFamily: 'Manrope, sans-serif',
    fontSize: '18px',
    '& fieldset': {
      border: '2px solid #000000',
      borderRadius: 0
    },
    '&:hover fieldset': {
      borderColor: '#000000'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(0, 57, 42, 1)',
      borderWidth: '2px'
    }
  },
  '@media (max-width: 576px)': {
    '& .MuiOutlinedInput-root': {
      height: '50px',
      fontSize: '16px'
    }
  }
});

const StyledSelect = styled(Select)({
  height: '60px',
  fontFamily: 'Manrope, sans-serif',
  fontSize: '18px',
  '@media (max-width: 576px)': {
    height: '50px',
    fontSize: '16px'
  }
});

const Contacts = ({ id }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    wantToBuy: false,
    selectedPainting: ''
  });
  
  const [paintings, setPaintings] = useState([]);
  const [loadingPaintings, setLoadingPaintings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Контактная информация художника
  const contactInfo = {
    name: 'Дудоров Александр Алфеевич',
    position: 'Помощник ректора',
    address2: '194156, Санкт-Петербург пр. Энгельса, д. 23',
    phone: '+7(921)915 4329',
    email1: 'a_dudorov@mail.spbstu.ru',
    email2: 'a_dudorov@list.ru',
    telegram: 'https://t.me/a_dudorov',
    vk: 'https://vk.com/id26148688',
    website: 'www.spbstu.ru'
  };

  // Загрузка картин на продажу
  useEffect(() => {
    if (formData.wantToBuy) {
      fetchPaintingsOnSale();
    }
  }, [formData.wantToBuy]);

  const fetchPaintingsOnSale = async () => {
    setLoadingPaintings(true);
    try {
      const response = await axios.get(`${API_URL}/api/paintings?on_sale=true`);
      setPaintings(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке картин:', err);
    } finally {
      setLoadingPaintings(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'wantToBuy' ? checked : value
    }));
    
    if (successMessage || errorMessage) {
      setSuccessMessage('');
      setErrorMessage('');
    }

    if (name === 'wantToBuy' && !checked) {
      setFormData(prev => ({
        ...prev,
        selectedPainting: ''
      }));
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

    if (formData.wantToBuy && !formData.selectedPainting) {
      setErrorMessage('Пожалуйста, выберите картину для покупки');
      return;
    }
    
    // Комментарий теперь не обязателен

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await sendContactMessage({
        ...formData,
        paintingTitle: formData.wantToBuy 
          ? paintings.find(p => p.id === formData.selectedPainting)?.title 
          : null
      });
      
      if (response.success) {
        setSuccessMessage('Сообщение успешно отправлено!');
        setFormData({
          name: '',
          email: '',
          message: '',
          wantToBuy: false,
          selectedPainting: ''
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
    <ContactsSection id={id}>
      <ContentContainer maxWidth={false} disableGutters>
        <Title>КОНТАКТЫ</Title>
        
        <ContactsContent>
          <WhiteCard elevation={0}>
            <Box sx={{ display: 'flex', width: '100%', height: '100%', flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Левая колонка - Контактная информация */}
              <LeftColumn>
                <ContactInfoTitle>
                  Контакты
                </ContactInfoTitle>
                
                <ContactItem>
                  <ContactLabel>Имя</ContactLabel>
                  <ContactValue>{contactInfo.name}</ContactValue>
                </ContactItem>
                
                <ContactItem>
                  <ContactLabel>Адрес</ContactLabel>
                  <ContactValue>{contactInfo.address2}</ContactValue>
                </ContactItem>
                
                <ContactItem>
                  <ContactLabel>Телефон</ContactLabel>
                  <StyledLink href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}>
                    {contactInfo.phone}
                  </StyledLink>
                </ContactItem>
                
                <ContactItem>
                  <ContactLabel>Email</ContactLabel>
                  <StyledLink href={`mailto:${contactInfo.email1}`}>
                    {contactInfo.email1}
                  </StyledLink>
                  <StyledLink href={`mailto:${contactInfo.email2}`}>
                    {contactInfo.email2}
                  </StyledLink>
                </ContactItem>
                
                <ContactItem>
                  <ContactLabel>Социальные сети</ContactLabel>
                  <StyledLink href={contactInfo.telegram} target="_blank" rel="noopener noreferrer">
                    Telegram
                  </StyledLink>
                  <StyledLink href={contactInfo.vk} target="_blank" rel="noopener noreferrer">
                    VKontakte
                  </StyledLink>
                </ContactItem>
              </LeftColumn>
              
              {/* Правая колонка - Форма связи */}
              <RightColumn>
                <FormTitle>
                  Свяжитесь с нами
                </FormTitle>
                
                <StyledForm onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <StyledTextField
                      name="name"
                      placeholder="Ваше ФИО"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      variant="outlined"
                      required
                    />
                    
                    <StyledTextField
                      name="email"
                      placeholder="Ваш Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      variant="outlined"
                      required
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <FormControlLabel
                        control={
                          <StyledSwitch
                            checked={formData.wantToBuy}
                            onChange={handleInputChange}
                            name="wantToBuy"
                            disabled={isLoading}
                          />
                        }
                        label="Хочу приобрести картину"
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '18px',
                            color: 'rgba(0, 57, 42, 1)'
                          },
                          '@media (max-width: 576px)': {
                            '& .MuiFormControlLabel-label': {
                              fontSize: '16px'
                            }
                          }
                        }}
                      />
                    </Box>

                    {formData.wantToBuy && (
                      <StyledFormControl variant="outlined">
                        <InputLabel 
                          id="painting-select-label"
                          sx={{ 
                            fontFamily: 'Manrope, sans-serif',
                            fontSize: '18px',
                            top: '-8px'
                          }}
                        >
                          Выберите картину *
                        </InputLabel>
                        <StyledSelect
                          labelId="painting-select-label"
                          name="selectedPainting"
                          value={formData.selectedPainting}
                          onChange={handleInputChange}
                          label="Выберите картину *"
                          disabled={isLoading || loadingPaintings}
                          required={formData.wantToBuy}
                        >
                          {loadingPaintings ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} sx={{ mr: 1 }} /> Загрузка...
                            </MenuItem>
                          ) : paintings.length > 0 ? (
                            paintings.map((painting) => (
                              <MenuItem key={painting.id} value={painting.id}>
                                {painting.title} ({painting.year})
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>Нет картин на продаже</MenuItem>
                          )}
                        </StyledSelect>
                      </StyledFormControl>
                    )}

                    {/* Поле для комментария всегда отображается */}
                    <StyledTextField
                      name="message"
                      placeholder={formData.wantToBuy ? "Ваш комментарий к покупке (необязательно)" : "Ваш комментарий"}
                      value={formData.message}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      variant="outlined"
                      multiline
                      rows={4}
                    />
                  </Box>

                  <Box>
                    {errorMessage && (
                      <Alert 
                        severity="error" 
                        sx={{ 
                          fontFamily: 'Manrope, sans-serif',
                          borderRadius: 0,
                          border: '2px solid #ff0000',
                          mb: 2
                        }}
                      >
                        {errorMessage}
                      </Alert>
                    )}
                    
                    {successMessage && (
                      <Alert 
                        severity="success" 
                        sx={{ 
                          fontFamily: 'Manrope, sans-serif',
                          borderRadius: 0,
                          border: '2px solid #4caf50',
                          mb: 2
                        }}
                      >
                        {successMessage}
                      </Alert>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <StyledButton
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Отправить'}
                      </StyledButton>
                    </Box>
                  </Box>
                </StyledForm>
              </RightColumn>
            </Box>
          </WhiteCard>
        </ContactsContent>
      </ContentContainer>
    </ContactsSection>
  );
};

export default Contacts;