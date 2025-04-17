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
    .replace(/Limited Edition/gi, 'Edición Limitada')
    .replace(/Jersey/gi, '')
    .replace(/Shirt and Shorts/gi, '')
    .replace(/\bHome\b/gi, 'Local')
    .replace(/\bFourth\b/gi, 'Cuarta')
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
  retro: 479299436737,
  special: 479299469505,
  'brasileiro-serie-a': 479364251841,
  mls: 479364350145,
  'liga-mx': 479390597313,
  'scottish-premiership': 479390630081,
  eredivisie: 479390662849,
  'liga-profesional': 479390695617, // liga argentina
  'primeira-liga-1': 479390728385, // portugal
};

// ... importaciones y funciones anteriores

export async function uploadProductToShopify(productData: any) {
  const dollarPrice = parseFloat(
    (process.env.DOLLAR_PRICE_FOR_URUGUAY || '1').replace(',', '.'),
  );

  const priceInUYU = productData.price * dollarPrice * 5;
  const roundedPrice = Math.floor(priceInUYU / 100) * 100;
  const formattedTitle = formatTitle(productData.title);

  const images = await Promise.all(
    productData.images.map((url: string) => urlToBase64(url)),
  );

  let description = '';
  if (/player version|versión jugador/i.test(productData.title)) {
    description +=
      '⚠️ Esta camiseta es *Versión Jugador*, por lo que se recomienda elegir un talle más del habitual.';
  }

  // Crear producto en Shopify
  const productRes = await axios.post(
    `${process.env.SHOPIFY_DOMAIN}/admin/api/2023-10/products.json`,
    {
      product: {
        title: formattedTitle,
        body_html: description,
        images,
        options: [
          {
            name: 'Talle',
            values: ['S', 'M', 'L', 'XL', 'XXL'],
          },
        ],
        variants: ['S', 'M', 'L', 'XL', 'XXL'].map((size) => ({
          option1: size,
          price: roundedPrice.toFixed(0),
          inventory_management: 'shopify',
          inventory_quantity: 10,
        })),
      },
    },
    {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
    },
  );

  const productId = productRes.data.product.id;

  // Determinar la colección única a usar
  let finalCollectionHandle = productData.collectionHandle;

  if (/retro/i.test(productData.title)) {
    finalCollectionHandle = 'retro';
  } else if (/special/i.test(productData.title)) {
    finalCollectionHandle = 'special';
  }

  const collectionId = COLLECTION_IDS[finalCollectionHandle];

  // Asociar solo a una colección
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

  return productRes.data;
}
