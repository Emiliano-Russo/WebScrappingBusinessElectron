import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  web: string;
  link: string;
  navigation: string;
}

export const Menu: React.FC = () => {
  const navigate = useNavigate();

  const pages: MenuItem[] = [
    {
      web: 'huangali',
      link: 'https://www.huangali.com/',
      navigation: '/huangali',
    },
    {
      web: 'example',
      link: 'https://www.example.com/',
      navigation: '/example',
    },
    {
      web: 'anotherSite',
      link: 'https://www.anothersite.com/',
      navigation: '/anotherSite',
    },
  ];

  const handleNavigation = (navigation: string) => {
    navigate(navigation);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Bienvenido a Web Scrapping Business</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        {pages.map((page, index) => (
          <button
            key={index}
            className="buttonB"
            onClick={() => handleNavigation(page.navigation)}
            style={{
              padding: '10px 20px',
              cursor: 'pointer',
            }}
          >
            {page.web}
          </button>
        ))}
      </div>
    </div>
  );
};
