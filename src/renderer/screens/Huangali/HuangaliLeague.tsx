import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leagues_huangali } from './collections';

const slugify = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export const HuangaliLeague: React.FC = () => {
  const [products, setProducts] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [progress, setProgress] = React.useState<string | null>(null);

  const { league: slug } = useParams();
  const navigate = useNavigate();
  const selectedLeague = leagues_huangali.find(
    (l) => slugify(l.title) === slug,
  );

  const handleScrap = async () => {
    const fullUrl = `${selectedLeague!.link}?page=${page}`;
    const result = await window.electron.ipcRenderer.invoke(
      'scrap-league',
      fullUrl,
    );
    if (!result.error) {
      setProducts(result.map((p: any) => ({ ...p, extraImages: [] })));
      setSelected([]);
    } else {
      alert(result.error);
    }
  };

  const toggleSelect = (idx: number) => {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleBatchUpload = async () => {
    setProgress('Iniciando...');
    for (let i = 0; i < selected.length; i++) {
      const product = products[selected[i]];
      setProgress(`${i + 1} / ${selected.length}`);
      await window.electron.ipcRenderer.invoke('shopify-add-product', {
        title: product.title,
        price: product.price,
        images: [...product.images, ...(product.extraImages || [])],
        url: product.url,
        description: `Scrappeado desde Huangali.\nOriginal: ${product.url}`,
        collectionHandle: slug,
      });
    }
    setProgress(null);
    alert('Carga finalizada');
  };

  if (!selectedLeague) {
    return <div>Error: Liga no encontrada</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <h2>{selectedLeague.title}</h2>
      <div>
        <label>Página:</label>
        <input
          type="number"
          value={page}
          min={1}
          onChange={(e) => setPage(parseInt(e.target.value))}
        />
        <button onClick={handleScrap}>Scrappear</button>
        {selected.length > 0 && (
          <button onClick={handleBatchUpload}>
            Agregar {selected.length} a Shopify
          </button>
        )}
        {progress && (
          <span style={{ marginLeft: 10 }}>Progreso: {progress}</span>
        )}
      </div>

      {products.map((product, idx) => (
        <div
          key={idx}
          style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}
        >
          <input
            type="checkbox"
            checked={selected.includes(idx)}
            onChange={() => toggleSelect(idx)}
            style={{ marginRight: '8px' }}
          />
          <strong>{product.title}</strong>
          <p>Precio: ${product.price}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {product.images.map((img: string, i: number) => (
              <img key={i} src={img} style={{ width: 100 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
