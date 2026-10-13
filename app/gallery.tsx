'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type InstagramPost = {
  id: string; caption?: string; media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string; thumbnail_url?: string; permalink: string; timestamp: string;
  location?: { name?: string };
  children?: { data?: Array<{ id: string; media_type: 'IMAGE' | 'VIDEO'; media_url: string; thumbnail_url?: string }> };
};

function isInstagramPost(value: unknown): value is InstagramPost {
  if (typeof value !== 'object' || value === null) return false;
  const post = value as Record<string, unknown>;
  return typeof post.id === 'string'
    && typeof post.media_url === 'string'
    && typeof post.permalink === 'string'
    && typeof post.timestamp === 'string'
    && (post.media_type === 'IMAGE' || post.media_type === 'VIDEO' || post.media_type === 'CAROUSEL_ALBUM');
}

function captionParts(caption = '') {
  const hashtags = caption.match(/#[\p{L}\p{N}_]+/gu) || [];
  const description = caption.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/\s+/g, ' ').trim();
  return { description, hashtags: hashtags.join(' ') };
}

export default function Gallery() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selected, setSelected] = useState<InstagramPost | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadState, setLoadState] = useState<'intro' | 'reveal' | 'ready' | 'error'>('intro');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const updateNavigation = useCallback(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    setCanScrollLeft(gallery.scrollLeft > 2);
    setCanScrollRight(gallery.scrollLeft < gallery.scrollWidth - gallery.clientWidth - 2);
  }, []);
  const loadInstagram = useCallback(async () => {
    const startedAt = Date.now();
    const finishMinimumLoadingTime = () => new Promise<void>((resolve) => {
      window.setTimeout(resolve, Math.max(0, 1200 - (Date.now() - startedAt)));
    });
    setLoadState('intro');
    try {
      const response = await fetch('/api/instagram');
      if (!response.ok) throw new Error('Request failed');
      const result: unknown = await response.json();
      if (typeof result !== 'object' || result === null || !('data' in result)) throw new Error('Invalid response');
      const apiPosts = Array.isArray(result.data) ? result.data.filter(isInstagramPost) : [];
      if (!apiPosts.length) throw new Error('No posts');
      await finishMinimumLoadingTime();
      setPosts(apiPosts);
      setLoadState('reveal');
      window.setTimeout(() => setLoadState('ready'), 2300);
    } catch {
      await finishMinimumLoadingTime();
      setLoadState('error');
    }
  }, []);
  useEffect(() => { loadInstagram(); }, [loadInstagram]);
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
      updateNavigation();
    };

    window.addEventListener('wheel', moveSideways, { passive: false });
    window.addEventListener('resize', updateNavigation);
    gallery.addEventListener('scroll', syncAfterTouch, { passive: true });
    updateNavigation();
    return () => {
      window.removeEventListener('wheel', moveSideways);
      window.removeEventListener('resize', updateNavigation);
      gallery.removeEventListener('scroll', syncAfterTouch);
      cancelAnimationFrame(animationFrame);
    };
  }, [selected, updateNavigation]);
  const selectedMedia = selected?.children?.data?.length ? selected.children.data : selected ? [{ id: selected.id, media_type: selected.media_type, media_url: selected.media_url, thumbnail_url: selected.thumbnail_url }] : [];

  const moveFullscreen = (direction: number) => {
    if (selectedMedia.length < 2) return;
    setSelectedIndex(Math.max(0, Math.min(selectedMedia.length - 1, selectedIndex + direction)));
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
    <header className="site-header"><a className="wordmark" href="#top" aria-label="Liebs mit Linse – Startseite"><span>liebs</span><i>mit</i><span>linse.</span></a><div className="header-right"><span className={`sync-state ${loadState === 'ready' || loadState === 'reveal' ? 'is-live' : ''}`}><b /> {loadState === 'ready' || loadState === 'reveal' ? 'Live von Instagram' : loadState === 'intro' ? 'Instagram wird geladen' : 'Verbindung unterbrochen'}</span><a className="instagram-link" href="https://www.instagram.com/liebsmitlinse/" target="_blank" rel="noreferrer">Instagram <span>↗</span></a></div></header>
    <section className="gallery-section" id="top" aria-label="Instagram Galerie">
      {(loadState === 'intro' || loadState === 'reveal') && <div className={`gallery-intro ${loadState === 'reveal' ? 'is-revealing' : ''}`} role="status" aria-live="polite"><p>Weil wichtige Momente<br /><em>es wert sind, festgehalten<br />zu werden.</em></p></div>}
      <div className="gallery-meta"><span>{loadState === 'ready' ? 'Echte Momente · Scrollen →' : 'Echte Momente'}</span></div>
      {loadState === 'ready' && canScrollLeft && <button className="gallery-arrow main-previous" onClick={() => moveGallery(-1)} aria-label="Galerie nach links">‹</button>}
      {loadState === 'ready' && canScrollRight && <button className="gallery-arrow main-next" onClick={() => moveGallery(1)} aria-label="Galerie nach rechts">›</button>}
      <div className="gallery-scroll" ref={galleryRef} tabIndex={0} aria-label="Horizontal scrollbare Bildergalerie">
        {loadState === 'error' && <div className="gallery-loading gallery-error" role="alert"><p>Die Galerie konnte gerade nicht geladen werden.</p><button onClick={loadInstagram}>Erneut versuchen</button></div>}
        {posts.map((post, index) => {
          const { description } = captionParts(post.caption);
          return <button className="gallery-card" style={{ animationDelay: `${Math.min(index * 55, 440)}ms` }} key={post.id} onClick={() => { setSelected(post); setSelectedIndex(0); }} aria-label={`Beitrag öffnen: ${post.caption || 'Instagram Beitrag'}`}><img src={post.thumbnail_url || post.media_url} alt={post.caption || 'Hochzeitsmoment fotografiert von Liebs mit Linse'} loading={index > 3 ? 'lazy' : 'eager'} onLoad={updateNavigation} /><span className="card-overlay"><span className="post-copy">{post.location?.name && <small>⌖ {post.location.name}</small>}{description && <b>{description}</b>}</span><strong>{String(index + 1).padStart(2, '0')} ↗</strong></span>{post.media_type === 'VIDEO' && <span className="media-badge video-badge" aria-hidden="true">▶</span>}{post.media_type === 'CAROUSEL_ALBUM' && <span className="media-badge carousel-badge" aria-hidden="true" />}</button>;
        })}
        {(loadState === 'ready' || loadState === 'reveal') && <footer className="about-footer">
          <div className="about-kicker">Hinter der Linse</div>
          <div className="about-grid"><h1>Wir sind<br /><em>Katharina & Jonas.</em></h1><div className="about-copy"><p>Wir fotografieren die lauten, leisen und vollkommen ungeplanten Augenblicke eures Tages – authentisch, nah und mit viel Liebe fürs Dazwischen.</p><div className="location"><span>Zu Hause in</span><strong>Reutlingen · Tübingen<br />Sigmaringen & überall dort,<br />wo ihr Ja sagt.</strong></div></div></div>
          <div className="footer-bottom"><span className="footer-script">liebs mit linse.</span><a href="https://www.instagram.com/liebsmitlinse/" target="_blank" rel="noreferrer">@liebsmitlinse ↗</a></div>
        </footer>}
      </div>
    </section>
    {selected && selectedMedia.length > 0 && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Bild in Vollansicht" onClick={() => setSelected(null)}>
      <div className="fullscreen-track" style={{ transform: `translate3d(-${selectedIndex * 100}vw,0,0)` }}>
        {selectedMedia.map((media) => <div className="fullscreen-slide" key={media.id}>{media.media_type === 'VIDEO' ? <video className="fullscreen-media" src={media.media_url} poster={media.thumbnail_url} autoPlay={media.id === selectedMedia[selectedIndex]?.id} loop muted playsInline /> : <img className="fullscreen-media" src={media.media_url} alt="Hochzeitsfotografie in Vollansicht" />}</div>)}
      </div>
      {selectedMedia.length > 1 && <><button className="carousel-nav previous" disabled={selectedIndex === 0} onClick={(event) => { event.stopPropagation(); moveFullscreen(-1); }} aria-label="Vorheriges Bild">‹</button><button className="carousel-nav next" disabled={selectedIndex === selectedMedia.length - 1} onClick={(event) => { event.stopPropagation(); moveFullscreen(1); }} aria-label="Nächstes Bild">›</button><span className="carousel-count">{selectedIndex + 1} / {selectedMedia.length}</span></>}
      <span className="close-hint">Klicken zum Schließen</span>
    </div>}
  </main>;
}
