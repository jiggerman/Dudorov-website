import React, { useEffect } from 'react';
import MainBlock from '../components/Mainblock/Mainblock';
import AboutArtist from '../components/AboutArtist/AboutArtist';
import Gallery from '../components/Paintings/Paintings';
import Contacts from '../components/Contacts/Contacts';

const HomePage = () => {
  useEffect(() => {
      const token = localStorage.getItem('token');
      console.log(token)
    });

  return (
    <>
      <MainBlock />
      <AboutArtist id="about" />
      <Gallery id="paintings" />
      <Contacts id="contacts" />
    </>
  );
};
//<Gallery id="paintings" />
export default HomePage;
