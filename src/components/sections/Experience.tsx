import { experiences, qualifications } from '../../app/data/portfolio';

export function Experience() {
  return <section id="experience" className="experience-section section" aria-labelledby="experience-heading">
    <div className="section-kicker" data-reveal><span>03 / ALONG THE WAY</span></div>
    <h2 id="experience-heading" className="choreo-heading"><span className="heading-line"><span className="heading-ink">BUKAN CUMA</span></span><span className="heading-line"><span className="heading-ink tone-muted">DI BALIK LAYAR.</span></span></h2>
    <div className="experience-list"><span className="timeline-track" aria-hidden="true"><i /></span>{experiences.map(item => <article key={item.role + item.organization} className="experience-row">
      <span className="experience-period">{item.period}</span><h3>{item.role}</h3><p>{item.organization}</p>
      <p className="experience-description">{item.description}</p>
    </article>)}</div>
    <details className="qualifications"><summary>PEMBELAJARAN & ORGANISASI <span>+</span></summary><div className="detail-body">{qualifications.map(item => <article className="qualification-row" key={item.name}><span>{item.label}</span><h3>{item.name}</h3><p>{item.detail}</p></article>)}</div></details>
  </section>;
}
