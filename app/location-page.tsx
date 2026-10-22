import type { Metadata } from 'next';
import Link from 'next/link';

export type Location = {
  slug: string;
  city: string;
  region: string;
  setting: string;
  localText: string;
};

export const locations: Location[] = [
  { slug: 'hochzeitsfotograf-tuebingen', city: 'Tübingen', region: 'im Raum Tübingen und am Neckar', setting: 'zwischen Altstadt, Neckar und der Natur rund um Tübingen', localText: 'Tübingen verbindet historische Gassen, Wasser und viel Grün auf engem Raum. Ob standesamtliche Trauung, freie Zeremonie oder große Feier: Wir stimmen die fotografische Begleitung auf euren Tagesablauf ab und lassen genügend Raum für alles, was ungeplant entsteht.' },
  { slug: 'hochzeitsfotograf-reutlingen', city: 'Reutlingen', region: 'in Reutlingen und am Fuß der Schwäbischen Alb', setting: 'zwischen Reutlinger Altstadt, Achalm und Schwäbischer Alb', localText: 'Rund um Reutlingen treffen Stadt, Streuobstwiesen und die Landschaft der Schwäbischen Alb aufeinander. Das schafft viele Möglichkeiten für eine Hochzeitsreportage, die zu euch passt – ohne starre Motive und ohne euren Tag für die Kamera zu unterbrechen.' },
  { slug: 'hochzeitsfotograf-nuertingen', city: 'Nürtingen', region: 'in Nürtingen, im Neckartal und am Albtrauf', setting: 'zwischen Neckar, Altstadt und Albvorland', localText: 'Nürtingen liegt nah am Neckar und am Albvorland und bietet damit urbane wie natürliche Kulissen. Wir begleiten euch dort unaufdringlich vom Getting Ready bis zur Feier und halten nicht nur die großen Programmpunkte, sondern vor allem die kleinen Begegnungen dazwischen fest.' },
  { slug: 'hochzeitsfotograf-sigmaringen', city: 'Sigmaringen', region: 'in Sigmaringen und im Donautal', setting: 'zwischen Donau, Schlosskulisse und dem weiten Donautal', localText: 'Sigmaringen und das Donautal bieten einen besonderen Rahmen für Hochzeiten – von der Trauung in der Stadt bis zur Feier im Grünen. Wir reisen gern zu euch und erzählen euren Tag in einer ruhigen, zusammenhängenden Bildserie.' },
];

export function locationMetadata(location: Location): Metadata {
  const title = `Hochzeitsfotograf ${location.city} | Liebsmitlinse`;
  const description = `Authentische Hochzeitsfotografie in ${location.city}: Katharina & Jonas begleiten euren Tag nah, ungestellt und mit Liebe fürs Dazwischen.`;
  return {
    title,
    description,
    alternates: { canonical: `/${location.slug}` },
    openGraph: { title, description, url: `/${location.slug}`, type: 'website', images: [{ url: '/og.png', width: 1200, height: 630, alt: `Liebsmitlinse – Hochzeitsfotograf ${location.city}` }] },
    twitter: { card: 'summary_large_image', title, description, images: ['/og.png'] },
  };
}

function ExternalArrow() {
  return <svg className="external-arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function LocationPage({ location }: { location: Location }) {
  const otherLocations = locations.filter((item) => item.slug !== location.slug);
  const structuredData = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': 'https://liebsmitlinse.de/#business',
    name: 'Liebsmitlinse', url: 'https://liebsmitlinse.de/', image: 'https://liebsmitlinse.de/og.png',
    description: `Authentische Hochzeitsfotografie in ${location.city} von Katharina und Jonas Lieb.`,
    telephone: '+4915788750135', email: 'jonas_wurster@gmx.net',
    address: { '@type': 'PostalAddress', streetAddress: 'Stuttgarter Str. 35', postalCode: '72666', addressLocality: 'Neckartailfingen', addressCountry: 'DE' },
    areaServed: { '@type': 'City', name: location.city }, sameAs: ['https://www.instagram.com/liebsmitlinse/'],
  };
  return <main className="seo-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <header className="site-header seo-header"><Link className="wordmark" href="/">liebsmitlinse</Link><nav className="header-right" aria-label="Hauptnavigation"><a className="instagram-link whatsapp-link" href="https://wa.me/4915788750135" target="_blank" rel="noreferrer">Schreibe uns auf WhatsApp <ExternalArrow /></a><a className="instagram-link" href="https://www.instagram.com/liebsmitlinse/" target="_blank" rel="noreferrer">Instagram <ExternalArrow /></a></nav></header>
    <section className="seo-hero">
      <p className="seo-kicker">Hochzeitsreportagen · {location.city}</p>
      <h1>Hochzeitsfotograf<br /><em>{location.city}</em></h1>
      <div className="seo-hero-copy"><p>Weil wichtige Momente es wert sind, festgehalten zu werden.</p><p>Wir sind Katharina und Jonas – ein Fotografenpaar für ehrliche, lebendige Hochzeitsreportagen {location.region}.</p></div>
    </section>
    <section className="seo-intro">
      <figure><img src="/katharina-jonas-lieb.jpg" alt={`Katharina und Jonas von Liebsmitlinse – Hochzeitsfotografen für ${location.city}`} /><figcaption>Katharina &amp; Jonas · Liebsmitlinse</figcaption></figure>
      <div><p className="seo-kicker">Eure Geschichte, nicht unser Drehbuch</p><h2>Hochzeitsfotografie, die sich nach euch anfühlt.</h2><p>Wir fotografieren die lauten, leisen und vollkommen ungeplanten Augenblicke eures Tages – authentisch, nah und mit viel Liebe fürs Dazwischen. Dabei greifen wir nur dann ein, wenn ihr Orientierung braucht. Den Rest des Tages dürft ihr einfach erleben.</p><p>{location.localText}</p></div>
    </section>
    <section className="seo-details" aria-label="Unsere Hochzeitsfotografie">
      <article><span>01</span><h2>Zwei Perspektiven</h2><p>Ihr bekommt nicht nur einen Lieb, sondern gleich zwei. So halten wir gleichzeitig eure großen Momente und die stillen Reaktionen eurer Lieblingsmenschen fest.</p></article>
      <article><span>02</span><h2>Ungezwungen begleitet</h2><p>Keine endlosen Posen, kein ständiges Unterbrechen. Wir geben euch Sicherheit, bleiben aufmerksam im Hintergrund und schaffen Bilder mit echten Gefühlen.</p></article>
      <article><span>03</span><h2>Eine runde Reportage</h2><p>Vom Ankommen bis zum letzten Tanz entsteht eine zusammenhängende Geschichte – sorgfältig ausgewählt, natürlich bearbeitet und zeitlos erzählt.</p></article>
    </section>
    <section className="seo-local"><p className="seo-kicker">Heiraten in {location.city}</p><h2>Echte Momente {location.setting}.</h2><p>Jede Hochzeit hat ihren eigenen Rhythmus. Deshalb lernen wir euch vorab kennen, besprechen die wichtigen Eckpunkte und planen ausreichend Luft für spontane Augenblicke ein. So entsteht eine Reportage, die euren Tag nicht inszeniert, sondern bewahrt.</p></section>
    <section className="seo-process"><p className="seo-kicker">So starten wir</p><ol><li><strong>Unverbindlich schreiben</strong><span>Erzählt uns von euch, eurem Datum und euren Plänen.</span></li><li><strong>Kennenlernen</strong><span>Wir sprechen in Ruhe darüber, was euch wichtig ist.</span></li><li><strong>Gemeinsam feiern</strong><span>An eurem Hochzeitstag könnt ihr euch ganz aufeinander konzentrieren.</span></li></ol></section>
    <section className="seo-cta"><p className="seo-kicker">Klingt nach euch?</p><h2>Lasst uns eure Geschichte festhalten.</h2><p>Schreibt uns ganz unverbindlich. Wir freuen uns, euch und eure Pläne für {location.city} kennenzulernen.</p><div><a href="https://wa.me/4915788750135" target="_blank" rel="noreferrer">Auf WhatsApp schreiben ↗</a><a href="mailto:jonas_wurster@gmx.net">E-Mail senden ↗</a></div></section>
    <footer className="seo-footer"><div><Link className="wordmark" href="/">liebsmitlinse</Link><address>Katharina &amp; Jonas Lieb<br />Stuttgarter Str. 35 · 72666 Neckartailfingen</address></div><nav aria-label="Weitere Regionen">{otherLocations.map((item) => <Link key={item.slug} href={`/${item.slug}`}>Hochzeitsfotograf {item.city}</Link>)}</nav></footer>
  </main>;
}
