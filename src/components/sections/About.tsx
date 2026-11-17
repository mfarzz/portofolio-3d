import { achievements, education, profile, stack } from '../../app/data/portfolio';
import { Download } from 'lucide-react';
import { Sculpture } from '../hero/Sculpture';
import { GitHubActivity } from './GitHubActivity';

export function About() {
  return <section id="about" className="about-section section" aria-labelledby="about-heading">
    <div className="section-kicker" data-reveal><span>02 / THE HUMAN BEHIND THE CODE</span><span>FULL-STACK DEVELOPER</span></div>
    <div className="about-composition">
      <h2 id="about-heading" className="choreo-heading"><span className="heading-line"><span className="heading-ink">BUILD</span></span><span className="heading-line"><span className="heading-ink">WITH</span></span><span className="heading-line"><span className="heading-ink tone-coral">PURPOSE.</span></span></h2>
      <div className="about-model"><Sculpture variant="code" defer /></div>
    </div>
    <div className="about-bottom" data-reveal><a className="cv-download" href={import.meta.env.BASE_URL + profile.cv} download="Muhammad-Fariz-CV.pdf"><Download size={17} aria-hidden="true" />UNDUH CV <span>PDF</span></a><a href="#experience">PERJALANAN SAYA ↘</a></div>
    <div className="education-line" data-reveal><span>{education.degree}<br /><strong>{education.institution}</strong></span><span>{education.period}</span><span>IPK <strong>{education.gpa}</strong></span></div>
    <div className="stack-window"><ul className="stack-track" aria-label="Teknologi">{stack.map(skill => <li key={skill}>{skill}<span aria-hidden="true">✳</span></li>)}</ul></div>
    <GitHubActivity />
    <div className="recognition-grid">{achievements.map(award => <article className={'recognition recognition-' + award.color} key={award.title}>
      <span className="recognition-title">{award.title}</span><h3>{award.event}</h3><p>{award.detail}</p>
    </article>)}</div>
  </section>;
}
