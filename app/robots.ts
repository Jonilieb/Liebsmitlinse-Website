import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: 'https://liebsmitlinse.de/sitemap.xml', host: 'https://liebsmitlinse.de' };
}
