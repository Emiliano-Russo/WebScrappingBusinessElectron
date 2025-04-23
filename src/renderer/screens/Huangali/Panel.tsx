import React from 'react';
import { useNavigate } from 'react-router-dom';
import { collections_huangali } from './collections';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export const Panel: React.FC = () => {
  const navigate = useNavigate();

  const goToCollection = (collection: { title: string; link: string }) => {
    const slug = slugify(collection.title);
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
      <h1>Huangali Panel</h1>
      <h2>Elige una Colleccion:</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {collections_huangali.map((item, index) => (
          <div key={index}>
            <button className="buttonA" onClick={() => goToCollection(item)}>
              {item.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
