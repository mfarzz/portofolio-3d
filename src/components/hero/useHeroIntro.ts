import { useEffect, type RefObject } from 'react';

export function useHeroIntro(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    void import('gsap').then(({ gsap }) => {
      if (cancelled || !ref.current) return;
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const context = gsap.context(() => {
          const section = ref.current!;
          const header = section.closest('.portfolio-page')?.querySelector('.site-header');
          const assembly = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { section.dataset.assembled = 'true'; } });
          section.dataset.assembled = 'false';
          if (header) assembly.fromTo(header, { y: -70, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, 0);
          assembly.fromTo('.hero-meta > span', { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, stagger: 0.12 }, 0.2)
            .fromTo('h1 > span:nth-child(1)', { x: -150, y: 25, rotate: -8, opacity: 0 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 0.85 }, 0.4)
            .fromTo('h1 > span:nth-child(2)', { x: 150, y: 30, rotate: 7, opacity: 0 }, { x: 0, y: 0, rotate: 0, opacity: 1, duration: 0.85 }, 0.67)
            .fromTo('h1 > span:nth-child(3)', { y: 110, rotate: -4, opacity: 0 }, { y: 0, rotate: 0, opacity: 1, duration: 0.9 }, 0.94)
            .fromTo('.art-coordinate', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, 1.85);
        }, ref.current!);
        return () => context.revert();
      });
      cleanup = () => media.revert();
    }).catch(() => { /* Static text remains available if the animation chunk fails. */ });
    return () => { cancelled = true; cleanup?.(); };
  }, [ref]);
}
