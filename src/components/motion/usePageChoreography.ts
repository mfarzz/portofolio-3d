import { useEffect, type RefObject } from 'react';

/** Scroll owns wrapper transforms; CSS hover and the 3D scene keep their own layers. */
export function usePageChoreography(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cancelled = false;
    let started = false;
    let cleanup: (() => void) | undefined;

    const start = () => {
      root.dataset.motion = preference.matches ? 'reduced' : 'active';
      if (started || preference.matches) return;
      started = true;
      void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const media = gsap.matchMedia();
        media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 761px)', animatedModel: '(min-width: 901px)' }, mediaContext => {
          if (!mediaContext.conditions?.motion) return;
          const desktop = !!mediaContext.conditions.desktop;
          const frames = new Set<number>();
          const details = Array.from(root.querySelectorAll<HTMLDetailsElement>('details'));
          const context = gsap.context(() => {
            gsap.fromTo('.page-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true } });

            root.querySelectorAll<HTMLElement>('.choreo-heading').forEach(heading => {
              gsap.fromTo(heading.querySelectorAll('.heading-ink'), { yPercent: 110, rotate: 2 }, {
                yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.1, ease: 'power3.out',
                scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
              });
            });
            root.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
              gsap.fromTo(element, { y: 22, opacity: 0.25 }, { y: 0, opacity: 1, duration: 0.75, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 92%', once: true } });
            });

            root.querySelectorAll<HTMLElement>('.project').forEach((project, index) => {
              gsap.fromTo(project, { y: desktop ? 75 : 35, rotate: desktop ? (index % 2 ? 2 : -2) : 0 }, {
                y: 0, rotate: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: project, start: 'top 94%', once: true },
              });
              gsap.fromTo(project.querySelector('.project-art-drift'), { y: 24 }, { y: -24, ease: 'none', scrollTrigger: { trigger: project, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
            });
            root.querySelectorAll<HTMLElement>('.archive-row').forEach((row, index) => {
              gsap.fromTo(row, { x: 20, opacity: 0.3 }, { x: 0, opacity: 1, duration: 0.6, delay: index % 3 * 0.045, ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 94%', once: true } });
            });

            gsap.fromTo('.motion-band-track', { xPercent: 3 }, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: '.motion-band', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
            if (mediaContext.conditions?.animatedModel) gsap.fromTo('.about-model', { y: 12 }, { y: -12, ease: 'none', scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 1 } });
            // Measure actual text width, so every skill can cross the viewport on mobile.
            const stack = root.querySelector<HTMLElement>('.stack-track');
            if (stack) gsap.fromTo(stack, { x: 0 }, { x: () => -Math.max(0, stack.scrollWidth - stack.parentElement!.clientWidth), ease: 'none', scrollTrigger: { trigger: '.stack-window', start: 'top 95%', end: 'top 15%', scrub: 0.8, invalidateOnRefresh: true } });
            root.querySelectorAll<HTMLElement>('.recognition').forEach((award, index) => {
              gsap.fromTo(award.querySelector('.recognition-title'), { y: 55, rotate: index ? 4 : -4, opacity: 0.25 }, { y: 0, rotate: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: award, start: 'top 88%', once: true } });
            });

            gsap.fromTo('.timeline-track i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.experience-list', start: 'top 75%', end: 'bottom 65%', scrub: 0.6 } });
            root.querySelectorAll<HTMLElement>('.experience-row').forEach(row => {
              gsap.fromTo(row, { x: 25, opacity: 0.3 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 90%', once: true } });
            });
            gsap.fromTo('.contact-title-link h2', { y: 65, rotate: -2 }, { y: 0, rotate: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true } });
            gsap.fromTo('#contact', { '--arrow-reveal': 0 }, { '--arrow-reveal': 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '#contact', start: 'top 80%', once: true } });
            gsap.fromTo('#contact', { '--contact-orbit': 0 }, { '--contact-orbit': 1, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'bottom bottom', scrub: 1 } });
            gsap.fromTo('.contact-bottom', { y: 18, opacity: 0.3 }, { y: 0, opacity: 1, duration: 0.7, scrollTrigger: { trigger: '.contact-bottom', start: 'top 97%', once: true } });
          }, root);

          const refresh = () => {
            const frame = requestAnimationFrame(() => { frames.delete(frame); if (!cancelled) ScrollTrigger.refresh(); });
            frames.add(frame);
          };
          const toggle = (event: Event) => {
            const detail = event.currentTarget as HTMLDetailsElement;
            if (detail.open) context.add(() => { gsap.fromTo(detail.querySelector('.detail-body'), { y: 8, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }); });
            refresh();
          };
          details.forEach(detail => detail.addEventListener('toggle', toggle));
          void document.fonts.ready.then(() => { if (!cancelled) refresh(); });
          refresh();
          return () => {
            frames.forEach(cancelAnimationFrame);
            details.forEach(detail => detail.removeEventListener('toggle', toggle));
            context.revert();
          };
        });
        cleanup = () => media.revert();
      }).catch(() => { root.dataset.motion = 'static'; });
    };
    preference.addEventListener('change', start);
    start();
    return () => { cancelled = true; preference.removeEventListener('change', start); cleanup?.(); };
  }, [ref]);
}
