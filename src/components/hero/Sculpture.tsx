import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SculptureController } from './SculptureScene';
import type { ScreenMode } from './WorkstationScreens';

type Props = { variant?: 'workstation' | 'code'; defer?: boolean };

export function Sculpture({ variant = 'code', defer = false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SculptureController>();
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)').matches);
  const [mode, setMode] = useState<'poster' | 'loading' | 'ready' | 'fallback'>('poster');
  const [paused, setPaused] = useState(false);
  const [screenMode] = useState<ScreenMode>('editor');
  const [nearby, setNearby] = useState(!defer);
  const workstation = variant === 'workstation';

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px), (hover: none), (pointer: coarse)');
    const change = () => setMobile(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    if (!defer || nearby || !host.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setNearby(true); observer.disconnect(); }
    }, { rootMargin: '220px' });
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [defer, nearby]);

  useEffect(() => {
    let cancelled = false;
    const container = host.current;
    const section = container?.closest<HTMLElement>('section');
    setMode(reducedMotion || mobile || !nearby ? 'poster' : 'loading');
    if (reducedMotion || mobile || !nearby || !container || !section) return;
    void import('./SculptureScene').then(({ mountSculpture }) => {
      if (cancelled) return;
      try {
        controller.current = mountSculpture(container, {
          hero: section,
          variant,
          modelUrl: import.meta.env.BASE_URL + (workstation ? 'models/workstation.glb' : 'models/code-sculpture.glb'),
          onReady: () => { if (!cancelled) setMode('ready'); },
          onFallback: () => { if (!cancelled) setMode('fallback'); },
        });
      } catch { if (!cancelled) setMode('fallback'); }
    }).catch(() => { if (!cancelled) setMode('fallback'); });
    return () => { cancelled = true; controller.current?.dispose(); controller.current = undefined; };
  }, [reducedMotion, mobile, nearby, variant, workstation]);

  useEffect(() => { controller.current?.setPaused(paused); }, [paused, mode]);
  useEffect(() => { controller.current?.setScreenMode(screenMode); }, [screenMode, mode]);

  if (mobile) return null;

  return <div className="sculpture" data-variant={variant} data-scene-state={mode} data-screen-mode={screenMode}>
    <img className="sculpture-poster" src={import.meta.env.BASE_URL + (workstation ? 'images/workstation-poster.webp' : 'images/code-sculpture-poster.webp')} width="960" height="960" loading={defer ? 'lazy' : 'eager'} alt={workstation ? 'Workstation 3D dengan monitor editor kode, keyboard, trackpad, serta panel terminal dan preview melayang' : 'Patung simbol kode coral dengan slash metalik, bola lime, dan kubus apricot'} />
    <div ref={host} className="sculpture-canvas" aria-hidden="true" />
    {mode === 'ready' && <div className="scene-controls">
      <button type="button" className="motion-toggle" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Lanjutkan gerakan 3D' : 'Jeda gerakan 3D'} aria-pressed={paused}>
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span>{paused ? 'PLAY' : 'PAUSE'}</span>
      </button>
    </div>}
  </div>;
}
