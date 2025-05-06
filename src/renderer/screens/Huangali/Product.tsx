import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collections_huangali } from './collections';

export const Product: React.FC = () => {
  const { league: slug } = useParams();
  const navigate = useNavigate();
  const selectedCollection = collections_huangali.find((l) => l.title === slug);

  const [products, setProducts] = React.useState<any[]>([]);
  const [selected, setSelected] = React.useState<number[]>([]);
  const [filterKids, setFilterKids] = React.useState<boolean>(true);
  const [filterJerseyAndShort, setFilterJerseyAndShort] =
    React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);
  const [progress, setProgress] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      window.localStorage.removeItem('customScrapUrl');
    };
  }, []);

  if (!selectedCollection) {
    return <div>Error: Colección no encontrada</div>;
  }

  const handleScrap = async () => {
    setProducts([]);
    setSelected([]);

    const customUrl = window.localStorage.getItem('customScrapUrl');
    const baseLink = customUrl ? customUrl : selectedCollection.link;

    const separator = baseLink.includes('?') ? '&' : '?';
    const fullUrl = `${baseLink}${separator}page=${page}`;

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
    setSelected([]);
    setProgress(null);
    alert('Carga finalizada');
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <h2>{selectedCollection.title}</h2>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: 8 }}>Filtrar Niños</h4>
            <input
              type="checkbox"
              checked={filterKids}
              onChange={(val) => setFilterKids(val.target.checked)}
              style={{ width: 20, height: 15 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h4 style={{ marginRight: 8 }}>Filtrar "Jersey and Short"</h4>
            <input
              type="checkbox"
              checked={filterJerseyAndShort}
              onChange={(val) => setFilterJerseyAndShort(val.target.checked)}
              style={{ width: 20, height: 15 }}
            />
          </div>
        </div>
        {progress && (
          <span style={{ marginLeft: 10 }}>Progreso: {progress}</span>
        )}
      </div>

      {products
        .map((product, idx) => ({ product, idx }))
        .filter(
          ({ product }) =>
            (!filterKids || !/kids/i.test(product.title)) &&
            (!filterJerseyAndShort || !/jersey and short/i.test(product.title)),
        )
        .map(({ product, idx }) => (
          <div
            key={idx}
            style={{
              border: '1px solid #ccc',
              margin: '10px',
              padding: '10px',
            }}
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
                <img key={i} src={img} style={{ width: 200 }} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};
