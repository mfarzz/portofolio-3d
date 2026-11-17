import { ArrowUpRight } from 'lucide-react';
import { profile } from '../../app/data/portfolio';
export function Contact() {
  return <section id="contact" className="contact-section section" aria-labelledby="contact-heading">
    <div className="section-kicker"><span>PUNYA IDE?</span><span>LET'S MAKE IT HAPPEN.</span></div>
    <a className="contact-title-link" href={'mailto:' + profile.email}><h2 id="contact-heading">LET'S<br />BUILD<span>.</span></h2><ArrowUpRight className="contact-arrow" strokeWidth={.9} aria-hidden="true" /></a>
    <div className="contact-bottom"><a href={'mailto:' + profile.email}>{profile.email} <ArrowUpRight size={20} aria-hidden="true" /></a><p>Proyek baru. Kolaborasi. Atau sekadar halo.</p></div>
  </section>;
}
export function Footer() {
  return <footer className="site-footer"><a href="#home" className="footer-name">fariz*</a><span>© {new Date().getFullYear()}</span><div><a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub, buka tab baru">GITHUB ↗</a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn, buka tab baru">LINKEDIN ↗</a></div><a href="#home">KEMBALI KE ATAS ↑</a></footer>;
}
