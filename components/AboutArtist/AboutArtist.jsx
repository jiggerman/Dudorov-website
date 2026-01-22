import React, { useState, useEffect } from 'react';
import styles from './AboutArtist.module.css';

const AboutArtist = ({ id }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (isPopupOpen) {
      const y = window.scrollY;
      setScrollY(y);
      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isPopupOpen]);

  const togglePopup = () => {
    setIsPopupOpen((prev) => !prev);
  };

  return (
    <section id={id} className="about">
      <div className={styles.aboutArtist}>
        <div className={styles.container}>
          <h2 className={styles.title}>О ХУДОЖНИКЕ</h2>
          <p className={styles.description}>
            <b>Александр Алфеевич Дудоров</b> — петербургский художник, член Профессионального Союза художников России, 
            победитель Международного художественного фестиваля (International Art Festival) в Нью-Йорке в 2014, 
            2015 и 2017 годах. Выставляется на многих российских и зарубежных выставках (Нью-Йорк, Париж, 
            Женева, Берлин и другие. Несколько сотен его работ находятся в музеях и частных коллекциях мира.
          </p>
          <button className={styles.moreButton} onClick={togglePopup}>Подробнее</button>

          {isPopupOpen && (
            <div className={styles.popupOverlay} onClick={togglePopup}>
              <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={togglePopup}>×</button>
                <p className={styles.popupText}>
                  Жизнь Александра Дудорова неразрывно связана с Санкт-Петербургским политехническим университетом Петра Великого. Закончил кафедру «Пластическая обработка металлов». Позднее он почувствовал непреодолимое желание стать художником! В родном ВУЗе также проводятся творческие выставки.
                  Интересно, что музыкальное образование помогло А. А. Дудорову стать ближе к изобразительному искусству.
                  Алла Прима (Alla Prima) — основная техника живописи художника. Его картины обладают узнаваемым, неповторимым стилем, где мазок пытается «успеть» за движением, царит ритм и поэзия.
                  Александр — член гильдии художников Пушкинского общества Соединенных Штатов Америки (Нью-Йорк).
                  Творчество художника ценится во всем мире: проводятся десятки персональных выставок в России, Европе и Америке. Выставочный проект «Северная Пальмира» был реализован во многих городах Сирийской Арабской Республики. Работы художника находятся в коллекции посольства РФ во Франции (Париж), в представительстве ООН в Швейцарии (Женева).
                  С 2020 года занимался исследованием и реставрацией икон церкви Успения Пресвятой Богородицы и церкви в честь прп. Никандра Пустынножителя Святогорского Свято-Успенского монастыря.
                  Александр Дудоров многие годы сотрудничает с благотворительным фондом AdVita («Ради жизни») для детей и взрослых с онкологическими и прочими заболеваниями. Активно работает с Центром волонтёрских проектов «Гармония» СПбПУ, который поддерживает студенческие инициативы и реализует различные мероприятия.
                  Проводит художественные мастер-классы (в том числе благотворительные).
                  Пейзажи, портреты, натюрморты Александра Дудорова, разные по тематике, настроению и манере исполнения, позволяют почувствовать первозданную красоту окружающего мира.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutArtist;