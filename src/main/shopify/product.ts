import axios from 'axios';
import { formatTitle, urlToBase64 } from './formatters';
import { COLLECTION_IDS } from './collection_ids';
import { ProductData } from './product.interface';

export async function uploadProductToShopify(productData: ProductData) {
  console.log('PRODUCT DATA: ', productData);
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
  // hasta aca
  const productId = productRes.data.product.id;

  // Determinar la colección única a usar
  let finalCollectionHandle = productData.collectionHandle;
  console.log('Collection handle: ', finalCollectionHandle);

  if (/retro/i.test(productData.title)) {
    finalCollectionHandle = 'retro';
  } else if (
    /special/i.test(productData.title) ||
    /Limited Edition/i.test(productData.title)
  ) {
    finalCollectionHandle = 'special';
  } else if (/Jacket/i.test(productData.title)) {
    finalCollectionHandle = 'jacket';
  }

  console.log('Final collection handle: ', finalCollectionHandle);

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
