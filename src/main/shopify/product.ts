import axios from 'axios';
import path from 'path';

async function urlToBase64(
  url: string,
): Promise<{ attachment: string; filename: string }> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const contentType = response.headers['content-type'] || 'image/jpeg';
  const base64 = Buffer.from(response.data).toString('base64');

  const filename = path.basename(url.split('?')[0]); // para que sea 'imagen.jpg'

  return {
    attachment: base64,
    filename,
  };
}

// 🔢 Redondear al 100 más cercano hacia abajo
function roundToNearest100(price: number): number {
  return Math.floor(price / 100) * 100;
}

function formatTitle(title: string): string {
  return title
    .replace(/Thai Version/gi, '')
    .replace(/Player Version/gi, 'Versión Jugador')
    .replace(/Special Kit/gi, 'Kit Especial')
    .replace(/Authentic Jersey/gi, '')
    .replace(/Authentic/gi, '')
    .replace(/Jersey/gi, '')
    .replace(/Shirt and Shorts/gi, '')
    .replace(/\bHome\b/gi, 'Local')
    .replace(/\bCuarta\b/gi, 'Cuarta')
    .replace(/\bSpecial\b/gi, 'Especial')
    .replace(/\bTraining\b/gi, 'Entrenamiento')
    .replace(/\bAway\b/gi, 'Alternativa')
    .replace(/\bAlternate\b/gi, 'Alternativa')
    .replace(/\bThird\b/gi, 'Tercera')
    .replace(/\bGoalkeeper\b/gi, 'Arquero')
    .replace(/\bKids\b/gi, 'Niños')
    .replace(/\s+and\s+/gi, ' y ')
    .replace(/\s+/g, ' ') // Normaliza espacios duplicados
    .trim();
}

const COLLECTION_IDS: Record<string, number> = {
  'premier-league': 479203033281,
  'serie-a': 479203098817,
  'la-liga': 479203131585,
  'ligue-1': 479203164353,
  bundesliga: 479203197121,
};

export async function uploadProductToShopify(productData: any) {
  console.log('Subiendo imágenes como base64...');
  const dollarPrice = parseFloat(
    (process.env.DOLLAR_PRICE_FOR_URUGUAY || '1').replace(',', '.'),
  );

  const imagesAttachments = await Promise.all(
    productData.images.map((url: string) => urlToBase64(url)),
  );

  const priceInUYU = productData.price * dollarPrice * 5;
  const roundedPrice = Math.floor(priceInUYU / 100) * 100;
  const formattedTitle = formatTitle(productData.title);

  // 1. Crear el producto
  const createRes = await axios.post(
    `${process.env.SHOPIFY_DOMAIN}/admin/api/2023-10/products.json`,
    {
      product: {
        title: formattedTitle,
        images: imagesAttachments,
        variants: [{ price: roundedPrice.toFixed(0) }],
      },
    },
    {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
    },
  );

  const productId = createRes.data.product.id;

  console.log('Producto creado:', createRes.data.product);
  console.log('Asignando collections...');
  // 2. Asignarlo a la colección si está especificado
  if (productData.collectionHandle) {
    const collectionId = COLLECTION_IDS[productData.collectionHandle];
    if (collectionId) {
      await axios.post(
        `${process.env.SHOPIFY_DOMAIN}/admin/api/2023-10/collects.json`,
        {
          collect: {
            product_id: productId,
            collection_id: collectionId,
          },
        },
        {
          headers: {
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
            'Content-Type': 'application/json',
          },
        },
      );
    }
  }

  return createRes.data;
}
