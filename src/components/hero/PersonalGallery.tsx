import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Image as ImageIcon, X } from 'lucide-react';
import { lifeGalleries, type LifeGallery } from '../../app/data/neural';

type Origin = { x: number; y: number };

export function PersonalGallery({ gallery, onGalleryChange, onClose, origin, returnFocus }: { gallery: LifeGallery; onGalleryChange: (index: number) => void; onClose: () => void; origin?: Origin; returnFocus?: HTMLElement | null }) {
  const personalPhotos = gallery.photos;
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<Array<HTMLButtonElement | null>>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [focused, setFocused] = useState(0);
  const [entered, setEntered] = useState(false);
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const count = personalPhotos.length;
  const navigate = (direction: number) => {
    const next = ((selected ?? focused) + direction + count) % count;
    setFocused(next);
    if (selected !== null) setSelected(next);
    else cards.current[next]?.focus({ preventScroll: true });
  };
  useLayoutEffect(() => {
    const previous = returnFocus || document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const element = dialog.current;
    document.body.style.overflow = 'hidden';
    element?.showModal();
    if (origin && stage.current && element) {
      const bounds = stage.current.getBoundingClientRect();
      element.style.setProperty('--fan-origin-x', `${origin.x - bounds.left - bounds.width / 2}px`);
      element.style.setProperty('--fan-origin-y', `${origin.y - bounds.top - bounds.height * 0.44}px`);
    }
    return () => {
      element?.close(); document.body.style.overflow = overflow;
      window.setTimeout(() => {
        if (document.querySelector('dialog[open]')) return;
        const target = previous?.isConnected ? previous : document.querySelector<HTMLElement>('#main');
        target?.focus({ preventScroll: true });
      }, 60);
    };
  }, [origin, returnFocus]);
  useEffect(() => { if (selected !== null) cards.current[selected]?.focus({ preventScroll: true }); }, [selected]);
  useEffect(() => {
    const timer = window.setTimeout(() => setEntered(true), (0.8 + Math.max(0, count - 1) * 0.065) * 1000);
    return () => window.clearTimeout(timer);
  }, [count]);

  return <dialog ref={dialog} className="personal-gallery arc-gallery" data-expanded={selected !== null} data-entered={entered} aria-labelledby="personal-gallery-title" aria-describedby="personal-gallery-instructions" onCancel={event => {
    event.preventDefault();
    if (selected !== null) setSelected(null); else onClose();
  }} onKeyDown={event => {
    if (event.target instanceof HTMLSelectElement) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); navigate(event.key === 'ArrowLeft' ? -1 : 1); }
  }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <header className="arc-gallery-heading"><div><p>BEYOND THE SCREEN / MUHAMMAD FARIZ</p><h2 id="personal-gallery-title">{gallery.title}<span>.</span></h2><select className="arc-gallery-chapters" aria-label="Pilih bab kehidupan" value={gallery.id} onChange={event => onGalleryChange(lifeGalleries.findIndex(item => item.id === event.target.value))}>{lifeGalleries.map((item, index) => <option key={item.id} value={item.id}>{String(index + 1).padStart(2, '0')} / {item.label}</option>)}</select></div><button type="button" className="arc-gallery-close" onClick={onClose} aria-label="Tutup galeri kegiatan" autoFocus><X size={22} aria-hidden="true" /></button></header>
    <div ref={stage} className="arc-gallery-stage" role="group" aria-label="Foto kegiatan tersusun melengkung" onClick={event => {
      if (event.target !== event.currentTarget) return;
      if (selected !== null) setSelected(null); else onClose();
    }}>
      <svg className="arc-gallery-guide" viewBox="0 0 1200 420" aria-hidden="true"><path d="M80 335Q600 -10 1120 335" /><path d="M105 365Q600 30 1095 365" /></svg>
      {personalPhotos.map((photo, index) => {
        const position = count === 1 ? 0 : (index - (count - 1) / 2) / ((count - 1) / 2);
        const source = photo.src ? (/^https?:\/\//.test(photo.src) ? photo.src : import.meta.env.BASE_URL + photo.src.replace(/^\//, '')) : undefined;
        return <div className="arc-photo-slot" data-selected={selected === index} key={photo.title} style={{ '--fan-position': position, '--fan-height': position * position, '--fan-angle': `${position * 16}deg`, '--fan-order': index, '--fan-depth': 20 - Math.round(Math.abs(position) * 5) } as CSSProperties}>
          <button ref={element => { cards.current[index] = element; }} type="button" className="arc-photo-card" aria-label={`${photo.title}, foto ${index + 1} dari ${count}${selected === index ? ', perkecil foto' : ', perbesar foto'}`} aria-pressed={selected === index} disabled={selected !== null && selected !== index} onFocus={() => setFocused(index)} onClick={() => { setEntered(true); setFocused(index); setSelected(value => value === index ? null : index); }}>
            <span className="arc-photo-image">{source && !failed.has(source) ? <img src={source} alt={photo.alt || photo.title} width={1200} height={1500} decoding="async" onError={() => setFailed(value => new Set([...value, source]))} /> : <span className="arc-photo-placeholder"><ImageIcon size={36} strokeWidth={1} aria-hidden="true" /><span>Foto kegiatan<br />akan ditambahkan</span></span>}<span className="arc-photo-stamp">{String(index + 1).padStart(2, '0')} / FARIZ</span></span>
            <span className="arc-photo-caption"><span>{photo.title}</span><span aria-hidden="true">{selected === index ? '−' : '↗'}</span></span>
          </button>
        </div>;
      })}
    </div>
    <footer className="arc-gallery-footer"><button type="button" className="arc-gallery-arrow" onClick={() => navigate(-1)} aria-label="Foto sebelumnya"><ArrowLeft size={20} aria-hidden="true" /></button><div aria-live="polite" aria-atomic="true"><p id="personal-gallery-instructions">{selected !== null ? personalPhotos[selected].caption : 'Pilih foto untuk memperbesar.'}</p><span>{selected !== null ? String(selected + 1).padStart(2, '0') : '01'} / {String(count).padStart(2, '0')}{selected !== null ? ' · ESC UNTUK KEMBALI' : ' · A FEW MOMENTS, A BIGGER STORY'}</span></div><button type="button" className="arc-gallery-arrow" onClick={() => navigate(1)} aria-label="Foto selanjutnya"><ArrowRight size={20} aria-hidden="true" /></button></footer>
  </dialog>;
}
