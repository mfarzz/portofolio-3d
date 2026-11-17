import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
const links = [{ href: '#projects', label: 'KARYA' }, { href: '#about', label: 'TENTANG' }, { href: '#contact', label: 'KONTAK' }];
export function Navigation() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    const media = window.matchMedia('(min-width: 761px)');
    const resize = () => { if (media.matches) setOpen(false); };
    document.addEventListener('keydown', escape);
    media.addEventListener('change', resize);
    return () => { document.removeEventListener('keydown', escape); media.removeEventListener('change', resize); };
  }, [open]);
  return <header className="site-header"><div className="nav-layout">
    <a href="#home" className="wordmark" aria-label="Muhammad Fariz, kembali ke awal" onClick={() => setOpen(false)}>fariz<span>*</span></a>
    <button ref={button} type="button" className="menu-toggle" aria-controls="main-navigation" aria-expanded={open} aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav id="main-navigation" className={'main-nav ' + (open ? 'is-open' : '')} aria-label="Navigasi utama">{links.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}{link.href === '#contact' && <ArrowUpRight size={17} aria-hidden="true" />}</a>)}</nav>
  </div></header>;
}
