import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leagues_huangali } from './collections';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export const HuangaliLeague: React.FC = () => {
  const { league: slug } = useParams();
  const navigate = useNavigate();

  const selectedLeague = leagues_huangali.find(
    (l) => slugify(l.title) === slug,
  );

  if (!selectedLeague) {
    return (
      <div style={{ padding: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '12px',
            padding: '8px 16px',
            cursor: 'pointer',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          ← Volver
        </button>
        <div>Error: Liga no encontrada</div>
      </div>
    );
  }

  const handleScrap = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'scrap-league',
        selectedLeague.title,
      );
      alert(result); // O podés usar un toast
    } catch (err) {
      console.error('Error durante el scraping:', err);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '16px',
        borderRadius: '8px',
        margin: '16px 0',
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '12px',
          padding: '8px 16px',
          cursor: 'pointer',
          backgroundColor: '#f0f0f0',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        ← Volver
      </button>
      <h2>{selectedLeague.title}</h2>
      <a
        href={selectedLeague.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', marginBottom: '12px', color: 'pink' }}
      >
        {selectedLeague.link}
      </a>
      <button
        onClick={handleScrap}
        style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer' }}
      >
        Comenzar Scrapping
      </button>
    </div>
  );
};
