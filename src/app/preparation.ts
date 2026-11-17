import { useEffect, useState } from 'react';
import { loadModelBytes, prepareImage } from './assetCache';
import { loadGitHubActivity } from './data/githubActivity';
import { projects } from './data/portfolio';
import { personalPhotos } from './data/neural';

export type PreparationState = {
  key: string;
  status: 'loading' | 'ready' | 'fallback';
  progress: number;
  completed: number;
  total: number;
  label: string;
  issues: string[];
};
type Run = { snapshot: PreparationState; promise: Promise<PreparationState>; subscribe: (listener: (state: PreparationState) => void) => () => void };
const runs = new Map<string, Run>();
const desktopQuery = '(min-width: 901px) and (hover: hover) and (pointer: fine)';
const reduceQuery = '(prefers-reduced-motion: reduce)';
const url = (path: string) => /^https?:\/\//.test(path) ? path : import.meta.env.BASE_URL + path.replace(/^\//, '');

function deadline<T>(promise: Promise<T>, milliseconds = 12_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error('Preparation timed out')), milliseconds);
    promise.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}

function preparePortfolio(): Run {
  const desktop = matchMedia(desktopQuery).matches;
  const motion = !matchMedia(reduceQuery).matches;
  const key = `${desktop ? 'desktop' : 'mobile'}-${motion ? 'motion' : 'static'}`;
  const existing = runs.get(key);
  if (existing) return existing;
  const tasks: { label: string; work: () => Promise<unknown> }[] = [
    { label: 'FONT / TYPOGRAPHY', work: () => deadline(Promise.all([400, 500, 600, 700, 800].map(weight => document.fonts.load(`${weight} 24px Barlow`))).then(() => document.fonts.ready)) },
    { label: 'GITHUB / DAILY ACTIVITY', work: () => loadGitHubActivity() },
  ];
  if (motion) tasks.push({ label: 'MOTION / PAGE MODULES', work: () => Promise.all([import('gsap'), import('gsap/ScrollTrigger')]) });
  if (desktop) {
    tasks.push({ label: 'ABOUT / POSTER', work: () => prepareImage(url('images/code-sculpture-poster.webp')) });
    if (motion) tasks.push(
      { label: 'CNN / SCENE MODULE', work: () => import('../components/hero/NeuralScene') },
      { label: '3D / SCENE MODULE', work: () => import('../components/hero/SculptureScene') },
      { label: 'ABOUT / MODEL DATA', work: () => loadModelBytes(url('models/code-sculpture.glb')) },
      { label: 'CNN / FALLBACK IMAGE', work: () => prepareImage(url('images/neural-workflow.svg')) },
    );
  }
  const configuredImages = new Set([...projects.flatMap(project => project.gallery.map(image => image.src)), ...personalPhotos.map(photo => photo.src)].filter((path): path is string => !!path));
  configuredImages.forEach(path => tasks.push({ label: 'GALLERY / IMAGE', work: () => prepareImage(url(path)) }));
  const listeners = new Set<(state: PreparationState) => void>();
  let resolveRun!: (state: PreparationState) => void;
  const completion = new Promise<PreparationState>(resolve => { resolveRun = resolve; });
  const run: Run = {
    snapshot: { key, status: 'loading', progress: 0, completed: 0, total: tasks.length, label: 'PREPARING WORKSPACE', issues: [] },
    promise: completion,
    subscribe(listener) { listeners.add(listener); listener(run.snapshot); return () => { listeners.delete(listener); }; },
  };
  const emit = () => listeners.forEach(listener => listener(run.snapshot));
  runs.set(key, run);
  void (async () => {
    const began = performance.now();
    let cursor = 0;
    const running = new Map<number, string>();
    const worker = async () => {
      while (cursor < tasks.length) {
        const taskIndex = cursor++;
        const task = tasks[taskIndex];
        running.set(taskIndex, task.label);
        run.snapshot = { ...run.snapshot, label: running.values().next().value || task.label };
        emit();
        let failed = false;
        try {
          const remaining = 15_000 - (performance.now() - began);
          if (remaining <= 0) throw new Error('Preparation budget exceeded');
          await deadline(task.work(), Math.min(12_000, remaining));
        } catch { failed = true; }
        const completed = run.snapshot.completed + 1;
        running.delete(taskIndex);
        const issues = failed ? [...run.snapshot.issues, task.label] : run.snapshot.issues;
        run.snapshot = { key, completed, total: tasks.length, progress: completed / tasks.length, label: completed === tasks.length ? 'WORKSPACE PREPARED' : running.values().next().value || task.label, issues, status: completed === tasks.length ? (issues.length ? 'fallback' : 'ready') : 'loading' };
        emit();
      }
    };
    await Promise.all(Array.from({ length: Math.min(3, tasks.length) }, worker));
    resolveRun(run.snapshot);
  })();
  return run;
}

async function waitUntilPrepared(): Promise<PreparationState> {
  const run = preparePortfolio();
  const result = await run.promise;
  if (preparePortfolio() !== run) return waitUntilPrepared();
  return result;
}

export function usePortfolioPreparation() {
  const [state, setState] = useState<PreparationState>({ key: '', status: 'loading', progress: 0, completed: 0, total: 0, label: 'PREPARING WORKSPACE', issues: [] });
  useEffect(() => {
    const desktop = matchMedia(desktopQuery), reduced = matchMedia(reduceQuery);
    let release = () => {};
    const update = () => { release(); release = preparePortfolio().subscribe(setState); };
    desktop.addEventListener('change', update); reduced.addEventListener('change', update); update();
    return () => { release(); desktop.removeEventListener('change', update); reduced.removeEventListener('change', update); };
  }, []);
  return { ...state, waitUntilPrepared };
}
