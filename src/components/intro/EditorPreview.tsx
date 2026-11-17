import { useEffect, useRef } from 'react';
import { paintBootScreen, paintEditor, type MonitorPower } from '../hero/EditorSurface';
import { createWorkspaceBrowser } from './WorkspaceBrowser';

export function EditorPreview({ power = 'on', progress = 1, launching = false }: { power?: MonitorPower; progress?: number; launching?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const browserHost = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!launching || !browserHost.current) return;
    const browser = createWorkspaceBrowser();
    browserHost.current.append(browser.element);
    return () => browser.element.remove();
  }, [launching]);
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext('2d');
    if (!element || !context) return;
    if (power !== 'on') { paintBootScreen(context, element.width, element.height, power, progress); return; }
    paintEditor(context, element.width, element.height, 5);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const started = performance.now();
    const timer = window.setInterval(() => {
      if (!document.hidden && element.getBoundingClientRect().bottom > 0) paintEditor(context, element.width, element.height, (performance.now() - started) / 1000);
    }, 350);
    return () => window.clearInterval(timer);
  }, [power, progress]);
  return <div className="editor-preview-wrap"><canvas ref={canvas} width={1720} height={1080} className="boot-editor-preview" role="img" aria-label="Editor bergaya Visual Studio Code di Linux dengan project explorer, kode TypeScript, debugger, watch variables, dan debug console" /><div ref={browserHost} className="flat-browser-host" /></div>;
}
