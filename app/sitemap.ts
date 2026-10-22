import type { MetadataRoute } from 'next';
import { locations } from './location-page';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://liebsmitlinse.de/', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...locations.map((location) => ({ url: `https://liebsmitlinse.de/${location.slug}`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 })),
  ];
}
