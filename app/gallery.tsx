'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

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

function ArrowUpRight({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M3 11 11 3M5 3h6v6" /></svg>;
}

export default function Gallery() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [selected, setSelected] = useState<InstagramPost | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadState, setLoadState] = useState<'intro' | 'reveal' | 'ready' | 'error'>('intro');
  const [showGalleryLabel, setShowGalleryLabel] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightboxTouch = useRef({ x: 0, y: 0, moved: false });
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const resetToStart = () => {
      window.scrollTo(0, 0);
      if (galleryRef.current) galleryRef.current.scrollLeft = 0;
    };
    resetToStart();
    const animationFrame = window.requestAnimationFrame(resetToStart);
    window.addEventListener('pageshow', resetToStart);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('pageshow', resetToStart);
    };
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
      window.setTimeout(() => setLoadState('ready'), 2900);
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
    let touchX = 0;
    let touchY = 0;
    let touchScrollLeft = 0;
    let touchDirection: 'horizontal' | 'vertical' | null = null;
    let touchLastY = 0;
    let touchLastTime = 0;
    let touchVelocity = 0;
    let inertiaFrame = 0;

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
      const aboutSection = gallery.querySelector<HTMLElement>('.about-footer');
      setShowGalleryLabel(!aboutSection || gallery.scrollLeft + gallery.clientWidth <= aboutSection.offsetLeft + 2);
    };

    const startTouchScroll = (event: TouchEvent) => {
      if (selected || window.matchMedia('(max-width: 760px)').matches || event.touches.length !== 1) return;
      cancelAnimationFrame(inertiaFrame);
      inertiaFrame = 0;
      touchX = event.touches[0].clientX;
      touchY = event.touches[0].clientY;
      touchLastY = touchY;
      touchLastTime = performance.now();
      touchVelocity = 0;
      touchScrollLeft = gallery.scrollLeft;
      touchDirection = null;
    };

    const moveTouchScroll = (event: TouchEvent) => {
      if (selected || window.matchMedia('(max-width: 760px)').matches || event.touches.length !== 1) return;
      const deltaX = touchX - event.touches[0].clientX;
      const deltaY = touchY - event.touches[0].clientY;
      if (!touchDirection && Math.max(Math.abs(deltaX), Math.abs(deltaY)) > 5) {
        touchDirection = Math.abs(deltaY) >= Math.abs(deltaX) ? 'vertical' : 'horizontal';
      }
      if (touchDirection !== 'vertical') return;
      event.preventDefault();
      const now = performance.now();
      const elapsed = Math.max(1, now - touchLastTime);
      const instantVelocity = ((touchLastY - event.touches[0].clientY) * 0.84) / elapsed;
      touchVelocity = touchVelocity * 0.68 + instantVelocity * 0.32;
      touchLastY = event.touches[0].clientY;
      touchLastTime = now;
      gallery.scrollLeft = touchScrollLeft + deltaY * 0.84;
      target = current = gallery.scrollLeft;
    };

    const endTouchScroll = () => {
      if (touchDirection !== 'vertical' || Math.abs(touchVelocity) < 0.04) return;
      let velocity = touchVelocity * 14;
      const glide = () => {
        const maximum = gallery.scrollWidth - gallery.clientWidth;
        const next = Math.max(0, Math.min(maximum, gallery.scrollLeft + velocity));
        gallery.scrollLeft = next;
        target = current = next;
        velocity *= 0.92;
        if (Math.abs(velocity) > 0.18 && next > 0 && next < maximum) {
          inertiaFrame = requestAnimationFrame(glide);
        } else {
          inertiaFrame = 0;
        }
      };
      inertiaFrame = requestAnimationFrame(glide);
    };

    window.addEventListener('wheel', moveSideways, { passive: false });
    gallery.addEventListener('scroll', syncAfterTouch, { passive: true });
    gallery.addEventListener('touchstart', startTouchScroll, { passive: true });
    gallery.addEventListener('touchmove', moveTouchScroll, { passive: false });
    gallery.addEventListener('touchend', endTouchScroll, { passive: true });
    gallery.addEventListener('touchcancel', endTouchScroll, { passive: true });
    syncAfterTouch();
    return () => {
      window.removeEventListener('wheel', moveSideways);
      gallery.removeEventListener('scroll', syncAfterTouch);
      gallery.removeEventListener('touchstart', startTouchScroll);
      gallery.removeEventListener('touchmove', moveTouchScroll);
      gallery.removeEventListener('touchend', endTouchScroll);
      gallery.removeEventListener('touchcancel', endTouchScroll);
      cancelAnimationFrame(animationFrame);
      cancelAnimationFrame(inertiaFrame);
    };
  }, [selected, loadState]);
  const selectedMedia = selected?.children?.data?.length ? selected.children.data : selected ? [{ id: selected.id, media_type: selected.media_type, media_url: selected.media_url, thumbnail_url: selected.thumbnail_url }] : [];

  const moveFullscreen = (direction: number) => {
    if (selectedMedia.length < 2) return;
    setSelectedIndex(Math.max(0, Math.min(selectedMedia.length - 1, selectedIndex + direction)));
  };

  const moveGallery = (direction: number) => galleryRef.current?.scrollBy({ left: direction * window.innerWidth * 0.72, behavior: 'smooth' });

  const startLightboxSwipe = (event: React.TouchEvent) => {
    if (event.touches.length !== 1) return;
    lightboxTouch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, moved: false };
  };

  const moveLightboxSwipe = (event: React.TouchEvent) => {
    if (event.touches.length !== 1) return;
    const deltaX = event.touches[0].clientX - lightboxTouch.current.x;
    const deltaY = event.touches[0].clientY - lightboxTouch.current.y;
    if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) lightboxTouch.current.moved = true;
  };

  const endLightboxSwipe = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    const deltaX = touch.clientX - lightboxTouch.current.x;
    const deltaY = touch.clientY - lightboxTouch.current.y;
    if (Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
      moveFullscreen(deltaX < 0 ? 1 : -1);
    }
  };

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
    <header className="site-header"><a className="wordmark" href="#top" aria-label="Liebs mit Linse – Startseite">liebsmitlinse</a><div className="header-right"><a className="instagram-link whatsapp-link" href="https://wa.me/4915788750135" target="_blank" rel="noreferrer">Schreibe uns auf WhatsApp <ArrowUpRight className="external-arrow" /></a><a className="instagram-link" href="https://www.instagram.com/liebsmitlinse/" target="_blank" rel="noreferrer">Instagram <ArrowUpRight className="external-arrow" /></a></div></header>
    <section className="gallery-section" id="top" aria-label="Instagram Galerie">
      {(loadState === 'intro' || loadState === 'reveal') && <div className={`gallery-intro ${loadState === 'reveal' ? 'is-revealing' : ''}`} role="status" aria-live="polite"><p>Weil wichtige Momente<br /><em>es wert sind, festgehalten<br />zu werden.</em></p></div>}
      <div className={`gallery-meta ${showGalleryLabel && loadState === 'ready' ? 'is-visible' : ''}`}><span>Echte liebsmitlinse-Momente <i className="scroll-nudge" aria-hidden="true">→</i></span></div>
      <div className="gallery-scroll" ref={galleryRef} tabIndex={0} aria-label="Horizontal scrollbare Bildergalerie">
        {loadState === 'error' && <div className="gallery-loading gallery-error" role="alert"><p>Die Galerie konnte gerade nicht geladen werden.</p><button onClick={loadInstagram}>Erneut versuchen</button></div>}
        {posts.map((post, index) => {
          const { description } = captionParts(post.caption);
          return <button className="gallery-card" style={{ animationDelay: `${Math.min(index * 55, 440)}ms` }} key={post.id} onClick={() => { setSelected(post); setSelectedIndex(0); }} aria-label={`Beitrag öffnen: ${post.caption || 'Instagram Beitrag'}`}><img src={post.thumbnail_url || post.media_url} alt={post.caption || 'Hochzeitsmoment fotografiert von Liebs mit Linse'} loading={index > 3 ? 'lazy' : 'eager'} /><span className="card-overlay"><span className="post-copy">{post.location?.name && <small>⌖ {post.location.name}</small>}{description && <b>{description}</b>}</span><strong>{String(index + 1).padStart(2, '0')} <ArrowUpRight className="post-arrow" /></strong></span>{post.media_type === 'VIDEO' && <span className="media-badge video-badge" aria-hidden="true">▶</span>}{post.media_type === 'CAROUSEL_ALBUM' && <span className="media-badge carousel-badge" aria-hidden="true" />}</button>;
        })}
        {(loadState === 'ready' || loadState === 'reveal') && <footer className="about-footer">
          <div className="about-grid">
            <div className="about-identity"><span className="identity-photo-label">Hinter der Linse</span><h1><span>Wir sind</span><em>Katharina &amp;<br />Jonas.</em></h1><img src="/katharina-jonas-lieb.jpg" alt="Katharina und Jonas Lieb" /></div>
            <div className="about-profile">
              <section className="profile-entry"><span>Was wir tun</span><p>Wir fotografieren die lauten, leisen und vollkommen ungeplanten Augenblicke eures Tages – authentisch, nah und mit viel Liebe fürs Dazwischen.</p></section>
              <section className="profile-entry"><span>Das zeichnet uns aus</span><p>Wir sind ein Team. Bei uns bekommt ihr nicht nur einen Lieb, sondern gleich zwei. So bringt jeder von uns seine eigenen Stärken ein – und gemeinsam machen wir euer Shooting zu einem reibungslosen, entspannten Erlebnis.</p></section>
              <section className="profile-entry profile-location"><span>Zuhause in</span><strong>Irgendwo zwischen Reutlingen, Tübingen, Sigmaringen &amp; überall dort, wo ihr Ja sagt.</strong></section>
              <section className="profile-entry profile-cta"><span>Lernt uns kennen</span><div className="cta-copy"><h2>Schreibt uns ganz unverbindlich – wir freuen uns, euch kennenzulernen.</h2><nav aria-label="Kontaktmöglichkeiten"><a href="https://wa.me/4915788750135" target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight className="external-arrow" /></a><a href="mailto:jonas_wurster@gmx.net">E-Mail <ArrowUpRight className="external-arrow" /></a></nav></div><address className="contact-details contact-small">Liebsmitlinse · Katharina &amp; Jonas Lieb<br />Stuttgarter Str. 35 · 72666 Neckartailfingen<br />jonas_wurster@gmx.net · +49 157 88750135</address></section>
            </div>
          </div>
        </footer>}
      </div>
    </section>
    {selected && selectedMedia.length > 0 && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Bild in Vollansicht" onTouchStart={startLightboxSwipe} onTouchMove={moveLightboxSwipe} onTouchEnd={endLightboxSwipe} onClick={() => { if (!lightboxTouch.current.moved) setSelected(null); lightboxTouch.current.moved = false; }}>
      <div className="fullscreen-track" style={{ transform: `translate3d(-${selectedIndex * 100}vw,0,0)` }}>
        {selectedMedia.map((media) => <div className="fullscreen-slide" key={media.id}>{media.media_type === 'VIDEO' ? <video className="fullscreen-media" src={media.media_url} poster={media.thumbnail_url} autoPlay={media.id === selectedMedia[selectedIndex]?.id} loop muted playsInline /> : <img className="fullscreen-media" src={media.media_url} alt="Hochzeitsfotografie in Vollansicht" />}</div>)}
      </div>
      {selectedMedia.length > 1 && <><button className="carousel-nav previous" disabled={selectedIndex === 0} onClick={(event) => { event.stopPropagation(); moveFullscreen(-1); }} aria-label="Vorheriges Bild">‹</button><button className="carousel-nav next" disabled={selectedIndex === selectedMedia.length - 1} onClick={(event) => { event.stopPropagation(); moveFullscreen(1); }} aria-label="Nächstes Bild">›</button><span className="carousel-count">{selectedIndex + 1} / {selectedMedia.length}</span></>}
      <span className="close-hint">Klicken zum Schließen</span>
    </div>}
  </main>;
}
