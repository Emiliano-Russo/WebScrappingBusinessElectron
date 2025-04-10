import React from 'react';
import { useNavigate } from 'react-router-dom';
import { leagues_huangali } from './collections';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const Huangali: React.FC = () => {
  const navigate = useNavigate();

  const goToLeague = (league: { title: string; link: string }) => {
    const slug = slugify(league.title);
    navigate(`/huangali/${slug}`);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          marginBottom: '20px',
        }}
      >
        ← Volver
      </button>
      <h1>Bienvenido al web scrapping de Huangali</h1>
      <h2>Elige una liga:</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {leagues_huangali.map((league, index) => (
          <div key={index}>
            <button className="buttonA" onClick={() => goToLeague(league)}>
              {league.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Huangali;
