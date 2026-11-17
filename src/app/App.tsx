import { useEffect, useRef, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { NeuralExperience } from '../components/hero/NeuralExperience';
import { Projects } from '../components/sections/Projects';
import { About } from '../components/sections/About';
import { Experience } from '../components/sections/Experience';
import { Contact, Footer } from '../components/sections/Contact';
import { MotionBand } from '../components/MotionBand';
import { usePageChoreography } from '../components/motion/usePageChoreography';
import { BootIntro } from '../components/intro/BootIntro';
import { DataSignal } from '../components/motion/DataSignal';

export function App() {
  const [opened, setOpened] = useState(() => window.location.hash.length > 1);
  return opened ? <Portfolio /> : <BootIntro onLaunch={() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); setOpened(true); }} />;
}

function Portfolio() {
  const page = useRef<HTMLDivElement>(null);
  usePageChoreography(page);
  useEffect(() => { document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true }); }, []);
  return <div ref={page} className="portfolio-page">
    <div className="page-progress" aria-hidden="true" />
    <DataSignal />
    <a className="skip-link" href="#main">Lewati navigasi</a>
    <Navigation />
    <main id="main" tabIndex={-1}><NeuralExperience /><Projects /><MotionBand /><About /><Experience /><Contact /></main>
    <Footer />
  </div>;
}
