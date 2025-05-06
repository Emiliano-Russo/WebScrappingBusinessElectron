import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collections_huangali } from './collections';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export const Panel: React.FC = () => {
  const navigate = useNavigate();
  const [customSlug, setCustomSlug] = useState<string>(
    collections_huangali.length > 0
      ? slugify(collections_huangali[0].title)
      : '',
  );
  const [customUrl, setCustomUrl] = useState<string>('');

  const goToCollection = (collection: { title: string; link: string }) => {
    const slug = slugify(collection.title);
    navigate(`/huangali/${slug}`);
  };

  const handleCustomLink = () => {
    if (customSlug && customUrl) {
      // Navegar pasando el slug, y después en la otra página usás window.customScrapUrl o similar
      window.localStorage.setItem('customScrapUrl', customUrl);
      navigate(`/huangali/${customSlug}`);
    } else {
      alert('Selecciona un slug y escribe una URL');
    }
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
      <h2>Elige una Colección:</h2>
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

      {/* Nuevo Panel para Custom Link Scrapper */}
      <div style={{ marginTop: '40px' }}>
        <h2>Custom Link Scrapper</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '400px',
          }}
        >
          <select
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            style={{ padding: '5px', fontSize: '16px' }}
          >
            {collections_huangali.map((collection, idx) => (
              <option key={idx} value={slugify(collection.title)}>
                {collection.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Pega la URL a scrappear..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            style={{ padding: '5px', fontSize: '16px' }}
          />
          <button
            onClick={handleCustomLink}
            style={{
              backgroundColor: '#4CAF50', // Botón verde
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '16px',
              borderRadius: '4px',
            }}
          >
            Ir a Scrappear Custom
          </button>
        </div>
      </div>
    </div>
  );
};
