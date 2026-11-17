import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { lifeGalleries, neuralMarkers, neuralStages, personalPhotos, type NeuralMarkerId } from '../../app/data/neural';
import { projects, type Project } from '../../app/data/portfolio';
import { Hero } from './Hero';
import { PersonalGallery } from './PersonalGallery';
import { ProjectDialog } from '../sections/ProjectDialog';
import type { NeuralController } from './NeuralScene';

const mediaQuery = '(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function NeuralExperience() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const controller = useRef<NeuralController>();
  const markers = useRef(new Map<string, HTMLButtonElement>());
  const lifeTargets = useRef(new Map<number, HTMLButtonElement>());
  const range = useRef({ start: 0, end: 1 });
  const progress = useRef(0);
  const select = useRef<(id: NeuralMarkerId, layer?: number, point?: { x: number; y: number }) => void>(() => {});
  const [enabled, setEnabled] = useState(() => matchMedia(mediaQuery).matches);
  const [scene, setScene] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [hovered, setHovered] = useState<NeuralMarkerId | null>(null);
  const [phase, setPhase] = useState(0);
  const [activeLayer, setActiveLayer] = useState('IMAGE INPUT');
  const [paused, setPaused] = useState(false);
  const [photos, setPhotos] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [photoOrigin, setPhotoOrigin] = useState<{ x: number; y: number }>();
  const photoTrigger = useRef<HTMLElement | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const go = (position: number) => {
    window.scrollTo({ top: range.current.start + (range.current.end - range.current.start) * position, behavior: 'smooth' });
  };
  const openPhotos = (layer = 0, point?: { x: number; y: number }) => {
    const index = Math.max(0, Math.min(lifeGalleries.length - 1, layer));
    const element = enabled ? lifeTargets.current.get(index) : root.current?.querySelector<HTMLElement>('.hero-human-link');
    const bounds = element?.getBoundingClientRect();
    photoTrigger.current = element || document.activeElement as HTMLElement | null;
    setGalleryIndex(index);
    setPhotoOrigin(point || (bounds ? { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 } : undefined));
    setPhotos(true);
  };
  select.current = (id, layer, point) => {
    setHovered(null);
    if (id === 'input' || id === 'features') { openPhotos(layer || 0, point); return; }
    if (id === 'network') { go(neuralStages[2].progress); return; }
    if (id === 'tangkapin') {
      const heading = [...document.querySelectorAll<HTMLElement>('.archive-row h3')].find(element => element.textContent === 'Tangkapin');
      const detail = heading?.closest('details');
      if (detail) {
        detail.open = true;
        // Wait for the expanded row and ScrollTrigger's layout refresh before jumping.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (!detail.isConnected) return;
          detail.scrollIntoView({ behavior: 'instant', block: 'center' });
          detail.querySelector('summary')?.focus({ preventScroll: true });
        }));
      }
      return;
    }
    const project = projects.find(item => item.id === id);
    if (project) setSelectedProject(project);
  };

  useEffect(() => {
    const media = matchMedia(mediaQuery);
    const update = () => setEnabled(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!enabled || !root.current || !stage.current || !canvas.current) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    setScene('loading');
    void Promise.all([import('./NeuralScene'), import('gsap'), import('gsap/ScrollTrigger')]).then(([{ mountNeuralScene }, { gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current || !stage.current || !canvas.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const container = root.current;
      const pin = stage.current;
      try {
        controller.current = mountNeuralScene(canvas.current, {
          onReady: () => { if (!cancelled) setScene('ready'); },
          onFallback: () => { controller.current?.dispose(); controller.current = undefined; if (!cancelled) setScene('fallback'); },
          onHover: id => { if (!cancelled) setHovered(id); },
          onActiveLayer: label => { if (!cancelled) setActiveLayer(label); },
          onSelect: (id, layer, point) => select.current(id, layer, point),
          photoUrl: personalPhotos[0].src ? import.meta.env.BASE_URL + personalPhotos[0].src : undefined,
          project: (id, x, y, visible) => {
            const button = markers.current.get(id);
            if (!button) return;
            button.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
            button.style.visibility = visible ? 'visible' : 'hidden';
          },
          projectLayer: (index, x, y, width, height) => {
            const button = lifeTargets.current.get(index);
            if (!button) return;
            button.style.transform = `translate3d(${x}px,${y}px,0)`;
            button.style.width = `${width}px`; button.style.height = `${height}px`;
            button.style.visibility = 'visible';
          },
        });
      } catch { setScene('fallback'); }
      const state = { value: 0 };
      let lastPhase = -1;
      const update = () => {
        progress.current = state.value;
        controller.current?.setProgress(state.value);
        pin.dataset.progress = state.value.toFixed(4);
        pin.dataset.view = state.value > 0.22 ? 'story' : 'hero';
        pin.style.setProperty('--neural-expand', String(Math.min(1, state.value / 0.25)));
        pin.style.setProperty('--neural-current', String(state.value));
        const nextPhase = state.value < 0.36 ? 0 : state.value < 0.7 ? 1 : state.value < 0.88 ? 2 : 3;
        pin.dataset.phase = neuralStages[nextPhase].id;
        if (nextPhase !== lastPhase) { lastPhase = nextPhase; setPhase(nextPhase); }
      };
      const context = gsap.context(() => {
        gsap.timeline({
          scrollTrigger: {
            id: 'neural-story', trigger: container, start: 'top top+=80', end: 'bottom bottom',
            pin, pinSpacing: false, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
            onRefresh: self => { range.current = { start: self.start, end: self.end }; state.value = self.progress; update(); },
          },
        })
          .fromTo(state, { value: 0 }, { value: 1, duration: 1, ease: 'none', onUpdate: update }, 0)
          .fromTo(container.querySelector('.hero-composition'), { x: 0, opacity: 1 }, { x: -90, opacity: 0, duration: 0.22, ease: 'none' }, 0)
          .fromTo(container.querySelector('.hero-meta'), { opacity: 1 }, { opacity: 0, duration: 0.16, ease: 'none' }, 0);
      }, container);
      update();
      let refreshFrame = 0;
      const refresh = () => { cancelAnimationFrame(refreshFrame); refreshFrame = requestAnimationFrame(() => { if (!cancelled) ScrollTrigger.refresh(); }); };
      void document.fonts.ready.then(refresh);
      refresh();
      cleanup = () => { cancelAnimationFrame(refreshFrame); context.revert(); controller.current?.dispose(); controller.current = undefined; };
    }).catch(() => { if (!cancelled) setEnabled(false); });
    return () => { cancelled = true; cleanup?.(); };
  }, [enabled]);

  useEffect(() => { controller.current?.setHovered(hovered); }, [hovered, scene]);
  useEffect(() => { controller.current?.setPaused(paused || photos || !!selectedProject); }, [paused, photos, selectedProject, scene]);

  return <div ref={root} className={'neural-experience ' + (enabled ? 'has-neural-scene' : 'is-minimal')}>
    <Hero onOpenPhotos={() => openPhotos()} />
    {enabled && <>
      <section id="ai-workflow" className="neural-scroll-space" aria-label="Eksplorasi workflow AI interaktif"><span className="boot-sr-only">Scroll untuk mengikuti perjalanan. Setiap kelompok layer kotak membuka galeri bab kehidupan yang berbeda. Node output membuka proyek.</span></section>
      <div ref={stage} className="neural-stage" data-scene={scene} data-view="hero" data-phase="input" data-progress="0" aria-label="Visualisasi CNN interaktif">
        <div className="neural-story-heading"><p>01 / THE NEURAL WORKFLOW</p><h2>FROM INPUT.<br /><span>TO IMPACT.</span></h2></div>
        <img className="neural-fallback" src={import.meta.env.BASE_URL + 'images/neural-workflow.svg'} width={1400} height={600} alt="Ilustrasi CNN: input gambar, tumpukan feature maps, pooling, dan node output" />
        <div ref={canvas} className="neural-canvas" />
        <div className="neural-life-targets">{lifeGalleries.map((gallery, index) => <button key={gallery.id} ref={element => { if (element) lifeTargets.current.set(index, element); else lifeTargets.current.delete(index); }} type="button" className="neural-life-target" data-life-layer={index} aria-label={'Buka galeri ' + gallery.label} aria-haspopup="dialog" onClick={event => openPhotos(index, event.detail ? { x: event.clientX, y: event.clientY } : undefined)} onPointerEnter={() => { setHovered(index === 0 ? 'input' : 'features'); controller.current?.setLayerHovered(index); }} onPointerLeave={() => { setHovered(null); controller.current?.setLayerHovered(null); }} onFocus={() => { setHovered(index === 0 ? 'input' : 'features'); controller.current?.setLayerHovered(index); }} onBlur={() => { setHovered(null); controller.current?.setLayerHovered(null); }}><span>{String(index + 1).padStart(2, '0')} / {gallery.label} ↗</span></button>)}</div>
        <div className="neural-markers">{neuralMarkers.filter(marker => marker.kind === 'project').map(marker => <button key={marker.id} ref={element => { if (element) markers.current.set(marker.id, element); else markers.current.delete(marker.id); }} className={'neural-marker marker-' + marker.kind} data-node={marker.id} type="button" aria-label={marker.hint} aria-haspopup={marker.id === 'rintas' || marker.id === 'ally' ? 'dialog' : undefined} onClick={() => select.current(marker.id)} onPointerEnter={() => setHovered(marker.id)} onPointerLeave={() => setHovered(null)} onFocus={() => setHovered(marker.id)} onBlur={() => setHovered(null)}>
          <span className="neural-node-dot" /><span>{marker.label}</span><ArrowUpRight size={12} aria-hidden="true" />
        </button>)}</div>
        <div className="neural-hero-hint"><span>KLIK LAYER UNTUK GALERI KEGIATAN</span><button type="button" onClick={() => go(0.3)}>SCROLL TO EXPLORE <ArrowDown size={15} aria-hidden="true" /></button></div>
        <div className="neural-story-footer">
          <div className="neural-phase-copy" aria-live="polite" aria-atomic="true"><span>{activeLayer}</span><h3>{neuralStages[phase].title}</h3><p>{neuralStages[phase].detail}</p></div>
          <div className="neural-journey"><nav aria-label="Tahapan workflow AI">{neuralStages.map((item, index) => <button type="button" key={item.id} aria-current={index === phase ? 'step' : undefined} onClick={() => go(item.progress)}><span>0{index + 1}</span>{item.label}</button>)}</nav><div className="neural-journey-track" aria-hidden="true"><i /></div></div>
        </div>
        <div className="neural-utility"><span>KLIK LAYER: FOTO · NODE: PROYEK</span><button type="button" className="neural-pause" aria-pressed={paused} aria-label={paused ? 'Lanjutkan gerakan workflow' : 'Jeda gerakan workflow'} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{paused ? 'PLAY' : 'PAUSE'}</button><a href="#projects">LEWATI KE KARYA ↓</a></div>
        {scene === 'loading' && <span className="neural-load-status" role="status">INITIALIZING NEURAL SYSTEM…</span>}
      </div>
    </>}
    {photos && <PersonalGallery key={lifeGalleries[galleryIndex].id} gallery={lifeGalleries[galleryIndex]} onGalleryChange={index => { setGalleryIndex(index); setPhotoOrigin(undefined); }} origin={photoOrigin} returnFocus={photoTrigger.current} onClose={() => setPhotos(false)} />}
    {selectedProject && <ProjectDialog key={selectedProject.id} project={selectedProject} onClose={() => setSelectedProject(null)} />}
  </div>;
}
