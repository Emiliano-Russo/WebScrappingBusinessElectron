import axios from 'axios';
import path from 'path';

export async function urlToBase64(
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

export function formatTitle(title: string): string {
  return title
    .replace(/Thai Version/gi, '')
    .replace(/Player Version/gi, 'Versión Jugador')
    .replace(/Special Kit/gi, 'Kit Especial')
    .replace(/Authentic Jersey/gi, '')
    .replace(/Authentic/gi, '')
    .replace(/Limited Edition/gi, 'Edición Limitada')
    .replace(/Long Sleeve/gi, 'Manga Larga')
    .replace(/Jersey/gi, '')
    .replace(/Shirt and Shorts/gi, '')
    .replace(/\bHome\b/gi, 'Local')
    .replace(/\bFourth\b/gi, 'Cuarta')
    .replace(/\bGoalkeeper \b/gi, 'Arquero')
    .replace(/\bSpecial\b/gi, 'Especial')
    .replace(/\bTraining\b/gi, 'Entrenamiento')
    .replace(/\bAway\b/gi, 'Alternativa')
    .replace(/\bAlternate\b/gi, 'Alternativa')
    .replace(/\bSoccer\b/gi, '')
    .replace(/\bAdult\b/gi, '')
    .replace(/\bThird\b/gi, 'Tercera')
    .replace(/\bKids\b/gi, 'Niños')
    .replace(/\s+and\s+/gi, ' y ')
    .replace(/\s+/g, ' ') // Normaliza espacios duplicados
    .trim();
}
