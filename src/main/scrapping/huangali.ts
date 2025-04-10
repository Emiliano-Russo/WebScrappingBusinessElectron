import axios from 'axios';
import * as cheerio from 'cheerio';

interface Product {
  title: string;
  url: string;
  images: string[];
  price: string;
  oldPrice?: string;
  discount?: string;
  sale?: boolean;
}

//para cuando tenemos listado las ligas
export async function scrapeProducts(
  url: string,
  baseURL: string,
): Promise<Product[]> {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  const products: Product[] = [];

  $('.themes_prod.list_products_item').each((_, el) => {
    const element = $(el);
    const title = element.find('.item_name').text().trim();
    const relativeUrl = element.find('.item_name').attr('href') || '';
    const fullUrl = new URL(relativeUrl, baseURL).href;

    const images: string[] = [];

    element.find('.compute_process_img img').each((_, img) => {
      const $img = $(img);
      const lazySrc = $img.attr('data-srcset');
      const srcset = $img.attr('srcset');
      const fallbackSrc = $img.attr('src');

      // Elegimos el mejor disponible
      const chosen = lazySrc || srcset || fallbackSrc;

      if (
        chosen &&
        !chosen.includes('img-reloading') &&
        !images.includes(chosen)
      ) {
        const finalSrc = chosen.startsWith('//')
          ? 'https:' + chosen
          : new URL(chosen, baseURL).href;
        images.push(finalSrc);
      }
    });

    const price = element.find('.item_price .price_data').first().text().trim();
    const oldPrice =
      element.find('.themes_products_origin_price .price_data').text().trim() ||
      undefined;
    const discount = element.find('.themes_sales').text().trim() || undefined;
    const sale = !!element.find('em.icon_seckill').length;

    products.push({
      title,
      url: fullUrl,
      images,
      price,
      oldPrice,
      discount,
      sale,
    });
  });

  return products;
}
