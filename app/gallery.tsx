'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type InstagramPost = {
  id: string; caption?: string; media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string; thumbnail_url?: string; permalink: string; timestamp: string;
};

const demoPosts: InstagramPost[] = [
  ['1', 'Ein stiller Moment, kurz bevor es losgeht.', 'photo-1519741497674-611481863552'],
  ['2', 'Zwei Menschen. Ein Ja. Und ganz viel echtes Lachen.', 'photo-1606800052052-a08af7148866'],
  ['3', 'Sommerlicht und Lieblingsmenschen.', 'photo-1519225421980-715cb0215aed'],
  ['4', 'Die kleinen Blicke dazwischen.', 'photo-1511285560929-80b456fea0bc'],
  ['5', 'Wenn aus Aufregung Vorfreude wird.', 'photo-1544078751-58fee2d8a03b'],
  ['6', 'Ein Tag, der sich genauso angefühlt hat.', 'photo-1511285560929-80b456fea0bc'],
  ['7', 'Zwischen Tübingen und für immer.', 'photo-1522673607200-164d1b6ce486'],
  ['8', 'Die schönsten Bilder passieren ungeplant.', 'photo-1532712938310-34cb3982ef74'],
  ['9', 'Hände halten. Tief durchatmen. Losgehen.', 'photo-1519741347686-c1e0aadf4611'],
].map(([id, caption, photo], index) => ({ id, caption, media_type: 'IMAGE', media_url: `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=85`, permalink: 'https://www.instagram.com/liebsmitlinse/', timestamp: new Date(2026, 8, 20 - index).toISOString() } as InstagramPost));

export default function Gallery() {
  const [posts, setPosts] = useState(demoPosts);
  const [selected, setSelected] = useState<InstagramPost | null>(null);
  const [live, setLive] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  useEffect(() => { fetch('/api/instagram').then((r) => r.ok ? r.json() : Promise.reject()).then((data) => { if (Array.isArray(data.data) && data.data.length) { setPosts(data.data); setLive(true); } }).catch(() => undefined); }, []);
  useEffect(() => { if (!selected) return; const close = (event: KeyboardEvent) => event.key === 'Escape' && setSelected(null); window.addEventListener('keydown', close); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', close); document.body.style.overflow = ''; }; }, [selected]);
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    let target = gallery.scrollLeft;
    let current = gallery.scrollLeft;
    let animationFrame = 0;

    const animate = () => {
      current += (target - current) * 0.22;
      gallery.scrollLeft = current;
      if (Math.abs(target - current) > 0.35) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        gallery.scrollLeft = target;
        current = target;
        animationFrame = 0;
      }
    };

    const moveSideways = (event: WheelEvent) => {
      if (selected) return;
      event.preventDefault();
      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 24 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerWidth : 1;
      const rawDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      const controlledDelta = Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), 120) * multiplier;
      const maximum = gallery.scrollWidth - gallery.clientWidth;
      target = Math.max(0, Math.min(maximum, target + controlledDelta * 1.22));
      if (!animationFrame) {
        current = gallery.scrollLeft;
        animationFrame = requestAnimationFrame(animate);
      }
    };

    const syncAfterTouch = () => {
      if (!animationFrame) target = current = gallery.scrollLeft;
    };

    window.addEventListener('wheel', moveSideways, { passive: false });
    gallery.addEventListener('scroll', syncAfterTouch, { passive: true });
    return () => {
      window.removeEventListener('wheel', moveSideways);
      gallery.removeEventListener('scroll', syncAfterTouch);
      cancelAnimationFrame(animationFrame);
    };
  }, [selected]);
  const count = useMemo(() => String(posts.length).padStart(2, '0'), [posts.length]);
  return <main>
    <header className="site-header"><a className="wordmark" href="#top" aria-label="Liebs mit Linse – Startseite"><span>liebs</span><i>mit</i><span>linse.</span></a><div className="header-right"><span className={`sync-state ${live ? 'is-live' : ''}`}><b /> {live ? 'Live von Instagram' : 'Galerie-Vorschau'}</span><a className="instagram-link" href="https://www.instagram.com/liebsmitlinse/" target="_blank" rel="noreferrer">Instagram <span>↗</span></a></div></header>
    <section className="gallery-section" id="top" aria-label="Instagram Galerie">
      <div className="gallery-meta"><span>Echte Momente · Scrollen →</span><span>{count} Bilder</span></div>
      <div className="gallery-scroll" ref={galleryRef} tabIndex={0} aria-label="Horizontal scrollbare Bildergalerie">
        {posts.map((post, index) => <button className="gallery-card" key={post.id} onClick={() => setSelected(post)} aria-label={`Beitrag öffnen: ${post.caption || 'Instagram Beitrag'}`}><img src={post.thumbnail_url || post.media_url} alt={post.caption || 'Hochzeitsmoment fotografiert von Liebs mit Linse'} loading={index > 3 ? 'lazy' : 'eager'} /><span className="card-overlay"><i>{String(index + 1).padStart(2, '0')}</i><b>Ansehen ↗</b></span>{post.media_type !== 'IMAGE' && <span className="media-badge">{post.media_type === 'VIDEO' ? '▶' : '▣'}</span>}</button>)}
        <footer className="about-footer">
          <div className="about-kicker">Hinter der Linse</div>
          <div className="about-grid"><h1>Wir sind<br /><em>Katharina & Jonas.</em></h1><div className="about-copy"><p>Wir fotografieren die lauten, leisen und vollkommen ungeplanten Augenblicke eures Tages – authentisch, nah und mit viel Liebe fürs Dazwischen.</p><div className="location"><span>Zu Hause in</span><strong>Reutlingen · Tübingen<br />Sigmaringen & überall dort,<br />wo ihr Ja sagt.</strong></div></div></div>
          <div className="footer-bottom"><span className="footer-script">liebs mit linse.</span><a href="https://www.instagram.com/liebsmitlinse/" target="_blank" rel="noreferrer">@liebsmitlinse ↗</a></div>
        </footer>
      </div>
    </section>
    {selected && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Instagram Beitrag" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><button className="close" onClick={() => setSelected(null)} aria-label="Schließen">×</button><div className="lightbox-card"><div className="lightbox-image"><img src={selected.thumbnail_url || selected.media_url} alt={selected.caption || 'Hochzeitsfotografie'} /></div><div className="lightbox-copy"><span>@liebsmitlinse</span><p>{selected.caption || 'Ein echter Moment, für immer festgehalten.'}</p><a href={selected.permalink} target="_blank" rel="noreferrer">Beitrag auf Instagram ansehen ↗</a></div></div></div>}
  </main>;
}
