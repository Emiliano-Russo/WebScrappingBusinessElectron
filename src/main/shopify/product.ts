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

export async function uploadProductToShopify(productData: any) {
  console.log('Subiendo imágenes como base64...');

  const imagesAttachments = await Promise.all(
    productData.images.map((url: string) => urlToBase64(url)),
  );

  const response = await axios.post(
    `${process.env.SHOPIFY_DOMAIN}/admin/api/2023-10/products.json`,
    {
      product: {
        title: productData.title,
        body_html: productData.description || '',
        images: imagesAttachments,
        variants: [
          {
            price: productData.price,
          },
        ],
      },
    },
    {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
}
