import { useEffect, useId, useLayoutEffect, useRef } from 'react';

const sections = ['ai-workflow', 'projects', 'about', 'experience', 'contact'];

/** A fiber-optic signal carries the neural workflow's red light through the page. */
export function DataSignal() {
  const id = useId().replace(/:/g, '');
  const svg = useRef<SVGSVGElement>(null);
  const guide = useRef<SVGPathElement>(null);
  const live = useRef<Array<SVGPathElement | null>>([]);
  const head = useRef<SVGGElement>(null);
  const trails = useRef<Array<SVGCircleElement | null>>([]);
  const geometry = useRef({ length: 0, progress: 0, mobile: false, nodes: [] as { element: Element; distance: number }[] });
  const paint = useRef<(progress: number) => void>(() => {});
  const refresh = useRef<(() => void) | undefined>();

  useLayoutEffect(() => {
    const element = svg.current;
    const path = guide.current;
    const root = element?.closest<HTMLElement>('.portfolio-page');
    if (!element || !path || !root) return;
    let stopped = false;
    let frame = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    paint.current = value => {
      if (!geometry.current.length || !head.current) return;
      const progress = Math.max(0, Math.min(1, value));
      geometry.current.progress = progress;
      const distance = geometry.current.length * progress;
      live.current.forEach(route => { if (route) route.style.strokeDashoffset = String(geometry.current.length - distance); });
      const point = path.getPointAtLength(distance);
      head.current.setAttribute('transform', `translate(${point.x} ${point.y}) scale(${geometry.current.mobile ? 0.65 : 1})`);
      trails.current.forEach((trail, index) => {
        if (!trail) return;
        const behind = distance - (index + 1) * 42;
        trail.style.visibility = behind > 0 ? 'visible' : 'hidden';
        if (behind > 0) { const point = path.getPointAtLength(behind); trail.setAttribute('cx', String(point.x)); trail.setAttribute('cy', String(point.y)); }
      });
      geometry.current.nodes.forEach(node => node.element.setAttribute('data-lit', String(distance >= node.distance - 2)));
      element.dataset.signalProgress = progress.toFixed(4);
      element.dataset.connected = String(progress > 0.985);
    };

    const measure = () => {
      if (stopped) return;
      const bounds = root.getBoundingClientRect();
      const width = root.clientWidth, height = root.scrollHeight;
      if (!width || !height || (width === lastWidth && height === lastHeight)) return;
      lastWidth = width; lastHeight = height;
      const hero = root.querySelector<HTMLElement>('#home');
      const contact = root.querySelector<HTMLElement>('#contact');
      if (!hero || !contact) return;
      const mobile = width < 761;
      geometry.current.mobile = mobile;
      const gutter = width - (mobile ? 9 : 25);
      const bend = mobile ? 3 : 8;
      const heroBounds = hero.getBoundingClientRect();
      const startX = Math.min(gutter - 16, width * (mobile ? 0.84 : 0.91));
      const startY = heroBounds.top - bounds.top + heroBounds.height * (mobile ? 0.7 : 0.55);
      const endY = contact.getBoundingClientRect().bottom - bounds.top - 55;
      let d = `M ${startX} ${startY} C ${startX + 45} ${startY}, ${gutter} ${startY + 18}, ${gutter} ${startY + 90}`;
      let lastY = startY + 90;
      const positions: { id: string; x: number; y: number }[] = [];
      for (const id of sections) {
        const section = root.querySelector<HTMLElement>('#' + id);
        if (!section || !section.getClientRects().length) continue;
        const y = section.getBoundingClientRect().top - bounds.top + 44;
        if (y < lastY + 140 || y > endY - 100) continue;
        d += ` L ${gutter} ${y - 52} C ${gutter} ${y - 23}, ${gutter - bend * 2} ${y - 23}, ${gutter - bend * 2} ${y}`;
        d += ` C ${gutter - bend * 2} ${y + 23}, ${gutter} ${y + 23}, ${gutter} ${y + 52}`;
        positions.push({ id, x: gutter - bend * 2, y }); lastY = y + 52;
      }
      const finish = Math.max(lastY + 35, endY);
      d += ` L ${gutter} ${finish}`;
      element.setAttribute('viewBox', `0 0 ${width} ${height}`);
      element.querySelectorAll<SVGPathElement>('[data-signal-route]').forEach(route => route.setAttribute('d', d));
      element.querySelector('.signal-source')?.setAttribute('transform', `translate(${startX} ${startY})`);
      element.querySelector('.signal-destination')?.setAttribute('transform', `translate(${gutter} ${finish}) scale(${mobile ? 0.6 : 1})`);
      geometry.current.length = path.getTotalLength();
      live.current.forEach(route => { if (route) route.style.strokeDasharray = String(geometry.current.length); });
      geometry.current.nodes = [];
      for (const id of sections) {
        const node = element.querySelector('[data-signal-node="' + id + '"]');
        const position = positions.find(item => item.id === id);
        if (!node) continue;
        node.setAttribute('visibility', position ? 'visible' : 'hidden');
        if (!position) continue;
        node.setAttribute('transform', `translate(${position.x} ${position.y})`);
        let low = 0, high = geometry.current.length;
        for (let step = 0; step < 22; step++) { const middle = (low + high) / 2; if (path.getPointAtLength(middle).y < position.y) low = middle; else high = middle; }
        geometry.current.nodes.push({ element: node, distance: (low + high) / 2 });
      }
      paint.current(geometry.current.progress);
      refresh.current?.();
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule); observer.observe(root);
    window.addEventListener('resize', schedule);
    void document.fonts.ready.then(schedule);
    measure();
    return () => { stopped = true; cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', schedule); paint.current = () => {}; };
  }, []);

  useEffect(() => {
    const element = svg.current;
    const root = element?.closest<HTMLElement>('.portfolio-page');
    if (!element || !root) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let stopped = false, started = false;
    let cleanup: (() => void) | undefined;
    const start = () => {
      if (preference.matches) paint.current(1);
      if (started || preference.matches) return;
      started = true;
      void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (stopped) return;
        gsap.registerPlugin(ScrollTrigger);
        refresh.current = () => ScrollTrigger.refresh();
        const media = gsap.matchMedia();
        media.add({ motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' }, context => {
          if (!context.conditions?.motion) { paint.current(1); return; }
          const state = { progress: 0 };
          const tween = gsap.fromTo(state, { progress: 0 }, {
            progress: 1, ease: 'none', onUpdate: () => paint.current(state.progress),
            scrollTrigger: { id: 'portfolio-signal', trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.55, invalidateOnRefresh: true, onRefresh: self => { state.progress = self.progress; paint.current(state.progress); } },
          });
          paint.current(0);
          return () => { tween.scrollTrigger?.kill(); tween.kill(); };
        });
        cleanup = () => { media.revert(); refresh.current = undefined; };
      }).catch(() => paint.current(1));
    };
    preference.addEventListener('change', start); start();
    return () => { stopped = true; preference.removeEventListener('change', start); cleanup?.(); };
  }, []);

  return <svg ref={svg} className="data-signal" aria-hidden="true" data-signal-progress="0">
    <defs><filter id={'signal-head-' + id} x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3" /></filter></defs>
    <path ref={guide} data-signal-route className="signal-sheath" />
    <path data-signal-route className="signal-track" />
    <path ref={element => { live.current[0] = element; }} data-signal-route className="signal-halo" />
    <path ref={element => { live.current[1] = element; }} data-signal-route className="signal-light" />
    <path ref={element => { live.current[2] = element; }} data-signal-route className="signal-core" />
    <g className="signal-source"><circle r="10" fill="#ff4d4312" /><circle r="4" fill="#ff6259" /><circle r="1.5" fill="#fff0e8" /></g>
    {sections.map(section => <g key={section} className="signal-node" data-signal-node={section} visibility="hidden"><circle className="signal-node-aura" r="10" /><circle className="signal-node-ring" r="5" /><circle className="signal-node-core" r="2" /></g>)}
    <g className="signal-destination"><circle className="signal-end-aura" r="14" /><circle className="signal-node-ring" r="8" /><circle className="signal-end-core" r="3" /></g>
    {[0, 1, 2].map(index => <circle key={index} ref={element => { trails.current[index] = element; }} className="signal-packet" r={2.5 - index * 0.5} opacity={0.65 - index * 0.16} />)}
    <g ref={head} className="signal-head"><circle r="7" fill="#ff3938" opacity=".8" filter={'url(#signal-head-' + id + ')'} /><circle r="3.8" fill="#ff514b" /><circle r="1.8" fill="#fff3eb" /></g>
  </svg>;
}
