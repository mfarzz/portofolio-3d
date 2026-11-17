import { Plus, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { otherProjects, projects, type Project } from '../../app/data/portfolio';
import { ProjectArtwork } from './ProjectArtwork';
import { ProjectDialog } from './ProjectDialog';

export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);
  return <section id="projects" className="work-section section" aria-labelledby="work-heading">
    <div className="section-kicker" data-reveal><span>01 / SELECTED WORK</span><span>WEB · DESKTOP · AI</span></div>
    <h2 id="work-heading" className="choreo-heading"><span className="heading-line"><span className="heading-ink">LESS TALK.</span></span><span className="heading-line"><span className="heading-ink tone-muted">MORE BUILD.</span></span></h2>
    <div className="projects-grid">{projects.map(project => <article className="project" key={project.id} aria-labelledby={'project-' + project.id}>
      <button type="button" className={'project-preview project-cover preview-' + project.style} onClick={() => setSelected(project)} aria-label={'Lihat galeri dan detail ' + project.title} aria-haspopup="dialog">
        <span className="project-visual-number" aria-hidden="true">{project.number}</span>
        <span className="project-art-drift"><ProjectArtwork project={project} /></span>
        <span className="project-visual-label">{project.period}</span>
        {project.id === 'ally' && <span className="project-honor">TOP 30 FINALIST <ArrowUpRight size={13} aria-hidden="true" /></span>}
        <span className="project-cover-cta">LIHAT PROYEK <ArrowUpRight size={20} aria-hidden="true" /></span>
      </button>
      <div className="project-caption"><div><h3 id={'project-' + project.id}>{project.title}</h3><p>{project.category}</p></div></div>
      <button type="button" className="project-detail-trigger" onClick={() => setSelected(project)} aria-haspopup="dialog" aria-label={'Di balik proyek ' + project.title}>Di balik proyek <Plus size={16} aria-hidden="true" /></button>
    </article>)}</div>
    <div className="archive-heading" data-reveal><h3>EXPLORATIONS<span>.</span></h3><span>DELAPAN PROYEK LAINNYA</span></div>
    <div className="project-archive">{otherProjects.map((project, index) => <details className="archive-row" key={project.name}>
      <summary><span className="archive-index">{String(index + 5).padStart(2, '0')}</span><h3>{project.name}</h3><span className="archive-year">{project.period}</span><Plus size={19} aria-hidden="true" /></summary>
      <div className="detail-body"><p>{project.description}</p><span className="detail-stack">{project.technologies}</span></div>
    </details>)}</div>
    {selected && <ProjectDialog key={selected.id} project={selected} onClose={() => setSelected(null)} />}
  </section>;
}
