import { useRef } from 'react';
import { useHeroIntro } from './useHeroIntro';
export function Hero({ onOpenPhotos }: { onOpenPhotos?: () => void }) {
  const hero = useRef<HTMLElement>(null);
  useHeroIntro(hero);
  return <section ref={hero} id="home" className="hero" aria-labelledby="hero-heading">
    <div className="hero-meta"><span>MUHAMMAD FARIZ</span><span>APPLICATION DEVELOPER</span></div>
    <div className="hero-composition">
      <h1 id="hero-heading"><span>CODE.</span><span>CREATE.</span><span className="outline-word">REPEAT.</span></h1>
      <span className="art-coordinate" aria-hidden="true">INTERACTIVE NEURAL SYSTEM — 001</span>
    </div>
    <button type="button" className="hero-human-link" onClick={onOpenPhotos} aria-haspopup="dialog">BEYOND THE SCREEN ↗</button>
  </section>;
}
