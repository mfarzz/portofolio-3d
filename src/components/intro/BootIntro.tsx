import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import type { SculptureController } from '../hero/SculptureScene';
import { EditorPreview } from './EditorPreview';
import type { MonitorPower } from '../hero/EditorSurface';
import { usePortfolioPreparation } from '../../app/preparation';

type Props = { onLaunch: () => void };

export function BootIntro({ onLaunch }: Props) {
  const shell = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const fallback = useRef<HTMLDivElement>(null);
  const controller = useRef<SculptureController>();
  const cancelled = useRef(false);
  const lastCommand = useRef('');
  const output = useRef<HTMLDivElement>(null);
  const preparation = usePortfolioPreparation();
  const preparationRef = useRef(preparation);
  preparationRef.current = preparation;
  const bootStarted = useRef<number>();
  const reportedRun = useRef('');
  const prepared = preparation.status !== 'loading';
  const [entering, setEntering] = useState(false);
  const [terminalElement] = useState(() => {
    const element = document.createElement('div');
    element.className = 'boot-terminal-surface';
    return element;
  });
  const [allow3d, setAllow3d] = useState(() => window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches);
  const [sceneState, setSceneState] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [command, setCommand] = useState('');
  const [launching, setLaunching] = useState(false);
  const [power, setPower] = useState<MonitorPower>(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'booting' : 'off');
  const [bootProgress, setBootProgress] = useState(0);
  const [lines, setLines] = useState(['Preparing portfolio resources…']);
  useEffect(() => { if (output.current) output.current.scrollTop = output.current.scrollHeight; }, [lines]);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (sceneState === 'loading') return;
    if (bootStarted.current === undefined) bootStarted.current = performance.now();
    let timer: number | undefined;
    const update = () => {
      const elapsed = performance.now() - bootStarted.current!;
      if (!preference.matches && elapsed < 650) { setPower('off'); setBootProgress(0); return false; }
      const snapshot = preparationRef.current;
      setBootProgress(snapshot.progress);
      const complete = snapshot.status !== 'loading' && (preference.matches || elapsed >= 1000);
      setPower(complete ? 'on' : 'booting');
      return complete;
    };
    if (!update()) timer = window.setInterval(() => { if (update()) window.clearInterval(timer); }, 80);
    const change = () => { if (update()) window.clearInterval(timer); };
    preference.addEventListener('change', change);
    return () => { window.clearInterval(timer); preference.removeEventListener('change', change); };
  }, [sceneState, preparation.key]);

  useEffect(() => {
    if (!prepared || reportedRun.current === preparation.key) return;
    reportedRun.current = preparation.key;
    const messages = ['[ready] Workspace prepared on branch main.'];
    if (preparation.issues.includes('GITHUB / DAILY ACTIVITY')) messages.push('[info] GitHub unavailable; retry is available in About.');
    if (preparation.issues.some(issue => issue !== 'GITHUB / DAILY ACTIVITY')) messages.push('[info] Some visuals use their fallback view.');
    messages.push('Run pnpm dev to start the experience.');
    setLines(messages);
  }, [prepared, preparation.key, preparation.issues]);

  useEffect(() => { controller.current?.setPower(power, bootProgress); }, [power, bootProgress, sceneState]);

  useLayoutEffect(() => {
    fallback.current?.append(terminalElement);
    return () => { terminalElement.remove(); };
  }, [terminalElement]);

  useEffect(() => {
    cancelled.current = false;
    const media = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const change = () => setAllow3d(media.matches);
    media.addEventListener('change', change);
    return () => { cancelled.current = true; media.removeEventListener('change', change); };
  }, []);

  useEffect(() => {
    let disposed = false;
    setSceneState('loading');
    if (!allow3d || !stage.current || !shell.current) { setSceneState('fallback'); return; }
    void import('../hero/SculptureScene').then(({ mountSculpture }) => {
      if (disposed || !stage.current || !shell.current) return;
      try {
        controller.current = mountSculpture(stage.current, {
          hero: shell.current,
          variant: 'workstation',
          boot: true,
          terminalElement,
          modelUrl: import.meta.env.BASE_URL + 'models/workstation.glb',
          onReady: () => { if (!disposed) setSceneState('ready'); },
          onFallback: () => { if (!disposed) { fallback.current?.append(terminalElement); setSceneState('fallback'); } },
        });
      } catch { setSceneState('fallback'); }
    }).catch(() => { if (!disposed) setSceneState('fallback'); });
    return () => {
      disposed = true;
      controller.current?.dispose();
      controller.current = undefined;
      fallback.current?.append(terminalElement);
    };
  }, [allow3d, terminalElement]);

  const launch = async () => {
    setLaunching(true);
    await preparation.waitUntilPrepared();
    if (cancelled.current) return;
    setLines(previous => [...previous.slice(-2), '$ ' + (command.trim() || 'pnpm dev'), '> portfolio@1.0.0 dev', '[vite] preparing the experience…', '[ready] opening portfolio']);
    setCommand('');
    await new Promise(resolve => setTimeout(resolve, 350));
    if (cancelled.current) return;
    if (controller.current && sceneState === 'ready') await controller.current.launch();
    else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) await new Promise(resolve => setTimeout(resolve, 1500));
    if (!cancelled.current) onLaunch();
  };

  const skip = async () => {
    setEntering(true);
    await preparation.waitUntilPrepared();
    if (!cancelled.current) onLaunch();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (launching || entering || !prepared || power !== 'on') return;
    const value = command.trim();
    if (!value) return;
    lastCommand.current = value;
    const normalized = value.toLowerCase().replace(/\s+/g, ' ');
    if (['pnpm dev', 'pnpm run dev', 'npm run dev'].includes(normalized)) { void launch(); return; }
    if (normalized === 'clear') setLines([]);
    else if (normalized === 'help') setLines(['pnpm dev        launch portfolio', 'ls / pwd        explore workspace', 'whoami          about the developer', 'clear           clear terminal', '↑ history · Tab autocomplete']);
    else if (normalized === 'ls' || normalized === 'ls -la') setLines(['package.json  pnpm-lock.yaml', 'src/  public/  README.md']);
    else if (normalized === 'pwd') setLines(['/home/fariz/portfolio']);
    else if (normalized === 'whoami') setLines(['fariz', 'Application Developer / .NET & React']);
    else if (normalized === 'uname' || normalized === 'uname -a') setLines(['GNU/Linux · browser workspace']);
    else if (normalized === 'cat readme.md') setLines(['# Muhammad Fariz', 'Web. Desktop. Thoughtful experiences.', 'Get started: pnpm dev']);
    else setLines(previous => [...previous.slice(-2), '$ ' + value, 'bash: command not found. Try help.']);
    setCommand('');
  };
  const history = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab' && command.trim() && !['pnpm dev', 'whoami', 'clear', 'help', 'pwd', 'ls'].includes(command.trim())) {
      const completion = ['pnpm dev', 'whoami', 'clear', 'help', 'pwd', 'ls'].find(value => value.startsWith(command.trim()));
      if (completion) { event.preventDefault(); setCommand(completion); }
    }
    if (event.ctrlKey && event.key.toLowerCase() === 'l') { event.preventDefault(); setLines([]); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setCommand(lastCommand.current); }
    if (event.key === 'ArrowDown') { event.preventDefault(); setCommand(''); }
  };

  const terminal = <><div className="terminal-session" hidden={power !== 'on'}>
    <div className="linux-titlebar"><span className="linux-terminal-icon" aria-hidden="true">&gt;_</span><span>fariz@linux: ~/portfolio</span><span className="linux-window-actions" aria-hidden="true">−　□　×</span></div>
    <div className="linux-menubar" aria-hidden="true">File　Edit　View　Search　Terminal　Help</div>
    <div className="linux-tabbar" aria-hidden="true"><span>⌁　bash — ~/portfolio</span><span>＋</span></div>
    <div className="boot-terminal-body">
      <div className="linux-motd"><p>┌─ <strong>FARIZ / WORKSPACE</strong></p><p>│ .NET · React · TypeScript</p><p>└─ ideas → code → experiences</p></div>
      <div ref={output} className="boot-terminal-output" role="log" aria-live="polite" aria-label="Output terminal">{lines.map((line, index) => <p className={line.startsWith('[ready]') ? 'shell-success' : line.startsWith('bash:') ? 'shell-error' : line.startsWith('$') ? 'shell-echo' : ''} key={index}>{line}</p>)}</div>
      <form onSubmit={submit} className="boot-command-form"><label htmlFor="boot-command"><span className="shell-user">fariz@linux</span><span className="shell-path">:~/portfolio</span><span className="shell-branch"> (main*)</span></label><div className="linux-input-row"><span className="shell-prompt" aria-hidden="true">❯</span><input id="boot-command" aria-label="Perintah terminal" value={command} onChange={event => setCommand(event.target.value)} onKeyDown={history} placeholder="pnpm dev" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} maxLength={80} disabled={launching || entering || !prepared} /><button type="submit" disabled={launching || entering || !prepared} aria-label="Jalankan perintah">↵</button></div></form>
      <p className="boot-terminal-help">{launching ? '● starting development experience…' : '↵ run  ·  ↑ history  ·  tab complete  ·  help'}</p>
    </div>
  </div>{power !== 'on' && <div className="boot-power-cover" data-phase={power} role="status" aria-label={power === 'off' ? 'Monitor mati' : 'Monitor sedang menyala'}>
    {power === 'booting' && <div className="boot-power-content"><p>FARIZ / WORKSPACE</p><span>PREPARING PORTFOLIO</span><div className="boot-power-progress" role="progressbar" aria-label="Loading monitor" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(bootProgress * 100)}><i style={{ transform: 'scaleX(' + bootProgress + ')' }} /></div><code>{String(Math.round(bootProgress * 100)).padStart(2, '0')}%</code><small>{preparation.completed} / {preparation.total} · {preparation.label.toLowerCase()}</small></div>}
  </div>}</>;

  return <main ref={shell} className={'boot-intro ' + (launching ? 'is-launching' : '')} data-boot-scene={sceneState} data-monitor-power={power} data-preparation={preparation.status} data-resources-loaded={preparation.completed} data-resources-total={preparation.total}>
    <h1 className="boot-sr-only">Workspace interaktif Muhammad Fariz</h1>
    <header className="boot-header"><span className="wordmark">fariz<span>*</span></span><span>IDEAS BECOME REAL.</span><button type="button" onClick={() => void skip()} disabled={launching || entering} aria-busy={entering}>{entering ? 'Menyiapkan…' : 'Lewati intro'} ↗</button></header>
    <div ref={stage} className="boot-stage" />
    <div className="boot-flat-workspace" hidden={sceneState === 'ready'}>
      <section className="boot-flat-editor" aria-label="Editor ide"><EditorPreview power={power} progress={bootProgress} launching={launching && sceneState !== 'ready'} /></section>
      <div ref={fallback} className="boot-terminal-fallback" />
    </div>
    {createPortal(terminal, terminalElement)}
    <footer className="boot-footer"><span>01 / THE WORKSPACE</span><p>Ketik <kbd>pnpm dev</kbd> di terminal untuk membuka portofolio.</p><span>MUHAMMAD FARIZ — DEVELOPER</span></footer>
  </main>;
}
