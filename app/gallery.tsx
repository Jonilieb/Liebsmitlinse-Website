'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type InstagramPost = {
  id: string; caption?: string; media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string; thumbnail_url?: string; permalink: string; timestamp: string;
  location?: { name?: string };
  children?: { data?: Array<{ id: string; media_type: 'IMAGE' | 'VIDEO'; media_url: string; thumbnail_url?: string }> };
};

function captionParts(caption = '') {
  const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu) || [];
  const description = caption.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s+/g, ' ').trim();
  return { description, hashtags: hashtags.join(' ') };
}

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
  const [selectedIndex, setSelectedIndex] = useState(0);
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
  const selectedMedia = selected?.children?.data?.length ? selected.children.data : selected ? [{ id: selected.id, media_type: selected.media_type, media_url: selected.media_url, thumbnail_url: selected.thumbnail_url }] : [];
  const activeMedia = selectedMedia[selectedIndex];
  const allMedia = useMemo(() => posts.flatMap((post) => {
    const media = post.children?.data?.length ? post.children.data : [{ id: post.id, media_type: post.media_type, media_url: post.media_url, thumbnail_url: post.thumbnail_url }];
    return media.map((item, childIndex) => ({ post, item, childIndex }));
  }), [posts]);
  const activeGlobalIndex = selected && activeMedia ? allMedia.findIndex(({ post, childIndex }) => post.id === selected.id && childIndex === selectedIndex) : -1;

  const moveFullscreen = (direction: number) => {
    if (!allMedia.length) return;
    const nextIndex = (Math.max(activeGlobalIndex, 0) + direction + allMedia.length) % allMedia.length;
    setSelected(allMedia[nextIndex].post);
    setSelectedIndex(allMedia[nextIndex].childIndex);
  };

  const moveGallery = (direction: number) => galleryRef.current?.scrollBy({ left: direction * window.innerWidth * 0.72, behavior: 'smooth' });

  useEffect(() => {
    const navigateWithKeys = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      if (selected) moveFullscreen(direction);
      else moveGallery(direction);
    };
    window.addEventListener('keydown', navigateWithKeys);
    return () => window.removeEventListener('keydown', navigateWithKeys);
  });
  return <main>
    <header className="site-header"><a className="wordmark" href="#top" aria-label="Liebs mit Linse – Startseite"><span>liebs</span><i>mit</i><span>linse.</span></a><div className="header-right"><span className={`sync-state ${live ? 'is-live' : ''}`}><b /> {live ? 'Live von Instagram' : 'Galerie-Vorschau'}</span><a className="instagram-link" href="https://www.instagram.com/liebsmitlinse/" target="_blank" rel="noreferrer">Instagram <span>↗</span></a></div></header>
    <section className="gallery-section" id="top" aria-label="Instagram Galerie">
      <div className="gallery-meta"><span>Echte Momente · Scrollen →</span><span>{count} Bilder</span></div>
      <button className="gallery-arrow main-previous" onClick={() => moveGallery(-1)} aria-label="Galerie nach links">‹</button>
      <button className="gallery-arrow main-next" onClick={() => moveGallery(1)} aria-label="Galerie nach rechts">›</button>
      <div className="gallery-scroll" ref={galleryRef} tabIndex={0} aria-label="Horizontal scrollbare Bildergalerie">
        {posts.map((post, index) => {
          const { description } = captionParts(post.caption);
          return <button className="gallery-card" key={post.id} onClick={() => { setSelected(post); setSelectedIndex(0); }} aria-label={`Beitrag öffnen: ${post.caption || 'Instagram Beitrag'}`}><img src={post.thumbnail_url || post.media_url} alt={post.caption || 'Hochzeitsmoment fotografiert von Liebs mit Linse'} loading={index > 3 ? 'lazy' : 'eager'} /><span className="card-overlay"><span className="post-copy">{post.location?.name && <small>⌖ {post.location.name}</small>}{description && <b>{description}</b>}</span><strong>{String(index + 1).padStart(2, '0')} ↗</strong></span>{post.media_type === 'VIDEO' && <span className="media-badge video-badge" aria-hidden="true">▶</span>}{post.media_type === 'CAROUSEL_ALBUM' && <span className="media-badge carousel-badge" aria-hidden="true" />}</button>;
        })}
        <footer className="about-footer">
          <div className="about-kicker">Hinter der Linse</div>
          <div className="about-grid"><h1>Wir sind<br /><em>Katharina & Jonas.</em></h1><div className="about-copy"><p>Wir fotografieren die lauten, leisen und vollkommen ungeplanten Augenblicke eures Tages – authentisch, nah und mit viel Liebe fürs Dazwischen.</p><div className="location"><span>Zu Hause in</span><strong>Reutlingen · Tübingen<br />Sigmaringen & überall dort,<br />wo ihr Ja sagt.</strong></div></div></div>
          <div className="footer-bottom"><span className="footer-script">liebs mit linse.</span><a href="https://www.instagram.com/liebsmitlinse/" target="_blank" rel="noreferrer">@liebsmitlinse ↗</a></div>
        </footer>
      </div>
    </section>
    {selected && activeMedia && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Bild in Vollansicht" onClick={() => setSelected(null)}>
      {activeMedia.media_type === 'VIDEO' ? <video className="fullscreen-media" src={activeMedia.media_url} poster={activeMedia.thumbnail_url} autoPlay loop muted playsInline /> : <img className="fullscreen-media" src={activeMedia.media_url} alt="Hochzeitsfotografie in Vollansicht" />}
      {allMedia.length > 1 && <><button className="carousel-nav previous" onClick={(event) => { event.stopPropagation(); moveFullscreen(-1); }} aria-label="Vorheriges Bild">‹</button><button className="carousel-nav next" onClick={(event) => { event.stopPropagation(); moveFullscreen(1); }} aria-label="Nächstes Bild">›</button><span className="carousel-count">{activeGlobalIndex + 1} / {allMedia.length}</span></>}
      <span className="close-hint">Klicken zum Schließen</span>
    </div>}
  </main>;
}
