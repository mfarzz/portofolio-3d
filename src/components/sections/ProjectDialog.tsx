import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Image as ImageIcon, X } from 'lucide-react';
import type { Project } from '../../app/data/portfolio';

export function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [slide, setSlide] = useState(0);
  const [failed, setFailed] = useState<string>();
  const image = project.gallery[slide];
  const source = image.src ? (/^https?:\/\//.test(image.src) ? image.src : import.meta.env.BASE_URL + image.src.replace(/^\//, '')) : undefined;
  const move = (direction: number) => setSlide(current => (current + direction + project.gallery.length) % project.gallery.length);

  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus({ preventScroll: true }); };
  }, []);

  return <dialog ref={dialog} className={'project-dialog case-' + project.id} aria-labelledby="project-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
    if (event.target !== dialog.current) return;
    const bounds = dialog.current.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
  }}>
    <div className="project-dialog-bar"><span>SELECTED WORK / {project.number}</span><button type="button" className="project-dialog-close" onClick={onClose} aria-label="Tutup detail proyek" autoFocus><X size={22} aria-hidden="true" /></button></div>
    <header className="project-dialog-heading"><p>{project.category} <span>— {project.period}</span></p><h2 id="project-dialog-title">{project.title}<span>.</span></h2><p className="project-dialog-description">{project.description}</p></header>
    <div className="project-gallery" role="group" aria-label={'Galeri ' + project.title} onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    }}>
      <figure>
        <div className="project-gallery-stage" tabIndex={0} aria-label="Pratinjau gambar. Gunakan panah kiri atau kanan untuk berpindah.">
          {source && failed !== source ? <img src={source} alt={image.alt || image.title + ' — ' + project.title} width={1600} height={1000} loading="lazy" decoding="async" onError={() => setFailed(source)} /> : <div className="gallery-placeholder"><span className="gallery-placeholder-index">{String(slide + 1).padStart(2, '0')}</span><ImageIcon size={42} strokeWidth={1} aria-hidden="true" /><strong>{image.title}</strong><span>Screenshot akan ditambahkan</span></div>}
        </div>
        <figcaption><div aria-live="polite" aria-atomic="true"><span>{String(slide + 1).padStart(2, '0')} / {String(project.gallery.length).padStart(2, '0')}</span><p>{image.description}</p></div><div className="gallery-arrows"><button type="button" onClick={() => move(-1)} aria-label="Gambar sebelumnya"><ArrowLeft size={20} aria-hidden="true" /></button><button type="button" onClick={() => move(1)} aria-label="Gambar selanjutnya"><ArrowRight size={20} aria-hidden="true" /></button></div></figcaption>
      </figure>
      <div className="gallery-selectors" aria-label="Pilih gambar">{project.gallery.map((item, index) => <button key={item.title} type="button" aria-pressed={slide === index} onClick={() => setSlide(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}</button>)}</div>
    </div>
    <dl className="project-case-summary">{[{ label: '01 / MASALAH', text: project.caseStudy.problem }, { label: '02 / KONTRIBUSI SAYA', text: project.caseStudy.contribution }, { label: '03 / HASIL', text: project.caseStudy.outcome }].map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.text}</dd></div>)}</dl>
    <footer className="project-dialog-footer"><ul aria-label="Teknologi proyek">{project.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>{project.links.length > 0 && <div className="project-external-links">{project.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={18} aria-hidden="true" /><span className="boot-sr-only">, buka tab baru</span></a>)}</div>}</footer>
  </dialog>;
}
