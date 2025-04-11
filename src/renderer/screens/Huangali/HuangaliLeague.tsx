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
  const [page, setPage] = React.useState<number>(1); // 🔹 Página seleccionada
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
    const fullUrl = `${selectedLeague.link}?page=${page}`;
    try {
      const result = await window.electron.ipcRenderer.invoke(
        'scrap-league',
        fullUrl,
      );
      if (result.error) {
        alert(result.error);
      } else {
        setProducts(result.map((p: any) => ({ ...p, extraImages: [] })));
      }
    } catch (err) {
      console.error('Error durante el scraping:', err);
    }
  };

  const handleAddToShopify = async (product: any) => {
    try {
      const res = await window.electron.ipcRenderer.invoke(
        'shopify-add-product',
        {
          title: product.title,
          price: product.price,
          images: [...product.images, ...(product.extraImages || [])],
          url: product.url,
          description: `Scrappeado desde Huangali.\nOriginal: ${product.url}`,
          collectionHandle: slug, // 👈 esto es clave
        },
      );
      if (res.success) {
        alert('Producto agregado con éxito a Shopify');
      } else {
        alert(res.error || 'Error al agregar producto');
      }
    } catch (err) {
      console.error('Error al enviar a Shopify:', err);
      alert('Fallo de conexión o error inesperado.');
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

      <div style={{ marginBottom: '12px' }}>
        <label style={{ marginRight: '8px' }}>Página:</label>
        <input
          type="number"
          value={page}
          onChange={(e) => setPage(parseInt(e.target.value, 10) || 1)}
          style={{ width: '60px', padding: '4px' }}
          min={1}
        />
        <button
          onClick={handleScrap}
          style={{
            marginLeft: '12px',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
        >
          Scrappear página
        </button>
      </div>

      {products.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3>Productos encontrados:</h3>
          {products.map((product, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
              }}
            >
              <h4>{product.title}</h4>
              <p>
                <strong>Precio:</strong> ${product.price}{' '}
                {product.oldPrice && (
                  <>
                    (<del>${product.oldPrice}</del>)
                  </>
                )}
              </p>
              {product.discount && <p>Descuento: {product.discount}</p>}
              <p>{product.sale ? '🟢 En oferta' : '🔵 Sin oferta'}</p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.images.map((img: string, i: number) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${product.title} ${i + 1}`}
                    style={{
                      width: '400px',
                      borderRadius: '4px',
                    }}
                  />
                ))}
              </div>

              <a
                href={product.url}
                style={{ color: 'pink' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver producto →
              </a>
              <br />
              <button
                onClick={() => handleAddToShopify(product)}
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  backgroundColor: '#5cb85c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Agregar a Shopify
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
