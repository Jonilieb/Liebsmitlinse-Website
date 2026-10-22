'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type PreviewPost = { id: string; media_type: string; media_url: string; thumbnail_url?: string; caption?: string };

function isPreviewPost(value: unknown): value is PreviewPost {
  if (typeof value !== 'object' || value === null) return false;
  const post = value as Record<string, unknown>;
  return typeof post.id === 'string' && typeof post.media_url === 'string' && typeof post.media_type === 'string';
}

export default function SeoPreview() {
  const [posts, setPosts] = useState<PreviewPost[]>([]);

  useEffect(() => {
    fetch('/api/instagram')
      .then((response) => response.ok ? response.json() as Promise<unknown> : Promise.reject())
      .then((result) => {
        if (typeof result !== 'object' || result === null || !('data' in result) || !Array.isArray(result.data)) return;
        setPosts(result.data.filter(isPreviewPost).filter((post) => post.media_type !== 'VIDEO').slice(0, 3));
      })
      .catch(() => undefined);
  }, []);

  if (!posts.length) return null;

  return <section className="seo-preview" aria-label="Einblicke in unsere Hochzeitsgalerie">
    <div className="seo-preview-head"><p className="seo-kicker">Echte Liebsmitlinse-Momente</p><Link href="/#top">Zur Galerie <span aria-hidden="true">→</span></Link></div>
    <div className="seo-preview-grid">{posts.map((post) => <Link href="/#top" key={post.id} aria-label="Vollständige Galerie ansehen"><img src={post.thumbnail_url || post.media_url} alt={post.caption || 'Hochzeitsmoment fotografiert von Liebsmitlinse'} /></Link>)}</div>
  </section>;
}
