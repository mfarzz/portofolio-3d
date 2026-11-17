// A code-native VS Code / Linux-inspired workspace. Everything shown is demo code.
const source = [
  "import { createRoot } from 'react-dom/client';",
  "import { createTimeline } from './motion/timeline';",
  "import { Portfolio } from './app/Portfolio';",
  "import { projects, profile } from './data';",
  '',
  'interface WorkspaceOptions {',
  '  mode: "development" | "production";',
  '  enableMotion: boolean;',
  '  onReady: () => Promise<void>;',
  '}',
  '',
  '// Good ideas deserve thoughtful execution.',
  'export async function bootstrap(options: WorkspaceOptions) {',
  '  const runtime = await createWorkspace({',
  '    developer: profile.name,',
  '    stack: [".NET", "React", "TypeScript"],',
  '    modules: projects.filter(project => project.featured),',
  '    motion: options.enableMotion,',
  '  });',
  '',
  '  await runtime.loadAssets();',
  '  const timeline = createTimeline({ ease: "power3.out" });',
  '  timeline.add(() => runtime.render(Portfolio));',
  '  await options.onReady();',
  '  return runtime.start();',
  '}',
];

const palette = { bg: '#1e1e1e', rail: '#333333', panel: '#252526', line: '#3d3d3d', text: '#d4d4d4', muted: '#808080', blue: '#569cd6', orange: '#ce9178', green: '#6a9955', purple: '#c586c0', cyan: '#4ec9b0', yellow: '#dcdcaa' };

export type MonitorPower = 'off' | 'booting' | 'on';

export function paintBootScreen(ctx: CanvasRenderingContext2D, width: number, height: number, mode: MonitorPower, progress: number) {
  ctx.save();
  ctx.scale(width / 1720, height / 1080);
  ctx.fillStyle = '#050506'; ctx.fillRect(0, 0, 1720, 1080);
  const reflection = ctx.createLinearGradient(0, 0, 1720, 1080);
  reflection.addColorStop(0, '#ffffff05'); reflection.addColorStop(1, '#ffffff00');
  ctx.fillStyle = reflection; ctx.fillRect(0, 0, 1720, 1080);
  if (mode === 'off') { ctx.restore(); return; }
  if (progress < 0.12) {
    ctx.fillStyle = '#dbf967'; ctx.fillRect(860 - progress * 3200, 539, progress * 6400, 2);
    ctx.restore(); return;
  }
  ctx.globalAlpha = Math.min(1, (progress - 0.12) * 5);
  ctx.textAlign = 'center';
  text(ctx, 'FARIZ / WORKSPACE', 860, 434, '#d4d1cc', 42);
  text(ctx, 'preparing portfolio resources', 860, 485, '#767c82', 23);
  ctx.fillStyle = '#25292a'; ctx.fillRect(510, 540, 700, 7);
  ctx.fillStyle = '#dbf967'; ctx.fillRect(510, 540, 700 * progress, 7);
  text(ctx, String(Math.round(progress * 100)).padStart(2, '0') + '%', 860, 600, '#9fac91', 24);
  const status = progress < 0.4 ? '[ load ] fetching portfolio data' : progress < 0.8 ? '[ load ] preparing fonts and visual assets' : progress < 1 ? '[ load ] finishing workspace preparation' : '[ ready ] workspace preparation complete';
  text(ctx, status, 860, 670, '#6d747c', 20);
  ctx.restore();
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, color = palette.text, size = 19) {
  ctx.fillStyle = color;
  ctx.font = size + 'px "Cascadia Code", Consolas, monospace';
  ctx.fillText(value, x, y);
}

function syntax(ctx: CanvasRenderingContext2D, value: string, x: number, y: number) {
  if (value.trimStart().startsWith('//')) { text(ctx, value, x, y, palette.green, 22); return; }
  const tokens = value.match(/"[^"\n]*"|'[^'\n]*'|\b\d+\b|[A-Za-z_$][\w$]*|\s+|./g) ?? [];
  ctx.font = '22px "Cascadia Code", Consolas, monospace';
  tokens.forEach((token, index) => {
    let color = palette.text;
    if (/^["']/.test(token)) color = palette.orange;
    else if (/^(import|from|interface|export|async|await|const|return|function)$/.test(token)) color = palette.purple;
    else if (/^(boolean|Promise|void|true|false)$/.test(token)) color = palette.blue;
    else if (/^[A-Z]/.test(token)) color = palette.cyan;
    else if (tokens[index + 1] === '(') color = palette.yellow;
    else if (/^[a-z]/.test(token)) color = '#9cdcfe';
    ctx.fillStyle = color; ctx.fillText(token, x, y); x += ctx.measureText(token).width;
  });
}

export function paintEditor(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
  ctx.save();
  ctx.scale(width / 1720, height / 1080);
  ctx.fillStyle = palette.bg; ctx.fillRect(0, 0, 1720, 1080);
  // Linux window decoration and VS Code menu.
  ctx.fillStyle = '#303030'; ctx.fillRect(0, 0, 1720, 42);
  text(ctx, '◈', 19, 29, '#4fa9e8', 25);
  ctx.textAlign = 'center'; text(ctx, 'ideas.tsx — fariz-workspace — Visual Studio Code', 860, 27, '#c0c0c0', 18); ctx.textAlign = 'left';
  text(ctx, '−', 1588, 28, '#bdbdbd', 23); text(ctx, '□', 1631, 27, '#bdbdbd', 18); text(ctx, '×', 1680, 29, '#bdbdbd', 26);
  ctx.fillStyle = '#252525'; ctx.fillRect(0, 42, 1720, 35);
  text(ctx, 'File   Edit   Selection   View   Go   Run   Terminal   Help', 19, 65, '#c8c8c8', 17);
  // Activity bar, explorer, open files and source-control indicators.
  ctx.fillStyle = palette.rail; ctx.fillRect(0, 77, 60, 976);
  ['▤', '⌕', '⑂', '▷', '▦'].forEach((icon, index) => text(ctx, icon, 16, 122 + index * 70, index === 0 ? '#eee' : '#999', 31));
  text(ctx, '⚙', 16, 1020, '#999', 27);
  ctx.fillStyle = '#ff6259'; ctx.fillRect(0, 87, 3, 48);
  ctx.fillStyle = palette.panel; ctx.fillRect(60, 77, 240, 976);
  text(ctx, 'EXPLORER', 81, 111, '#bbb', 16); text(ctx, '···', 265, 111, '#bbb', 19);
  text(ctx, '⌄ OPEN EDITORS', 74, 150, '#bbb', 16);
  const tree = [
    ['  TS  ideas.tsx', '#75b9f5'], ['  C#  PortfolioService.cs', '#9cce74'], ['  {}  launch.json', '#e8bd78'],
    ['', '#aaa'], ['⌄ FARIZ-WORKSPACE', '#ddd'], ['  ⌄ src', '#ddd'], ['    ⌄ app', '#ccc'],
    ['      TS  Portfolio.tsx', '#75b9f5'], ['    ⌄ experiences', '#ccc'], ['      TS  ideas.tsx  M', '#e6c17d'],
    ['    ⌄ motion', '#ccc'], ['      TS  timeline.ts', '#75b9f5'], ['    ⌄ services', '#ccc'], ['      C#  PortfolioService', '#9cce74'],
    ['    ⌄ data', '#ccc'], ['      {}  projects.json', '#e8bd78'], ['  ⌄ public', '#ccc'], ['    ◇  workstation.glb', '#c798d8'],
    ['  {}  package.json', '#e8bd78'], ['  ◇  pnpm-lock.yaml', '#dbb078'], ['  #  README.md', '#75b9f5'],
  ];
  tree.forEach(([label, color], index) => {
    const y = 185 + index * 29;
    if (index === 9) { ctx.fillStyle = '#37373d'; ctx.fillRect(60, y - 21, 240, 29); }
    text(ctx, label, 75, y, color, 15);
  });
  text(ctx, '› OUTLINE', 75, 996, '#aaa', 15); text(ctx, '› TIMELINE', 75, 1030, '#aaa', 15);
  // Tabs, breadcrumbs and editor split.
  ctx.fillStyle = '#2d2d2d'; ctx.fillRect(300, 77, 1420, 49);
  ctx.fillStyle = palette.bg; ctx.fillRect(300, 77, 234, 49);
  text(ctx, 'TS  ideas.tsx    ●  ×', 320, 108, '#e1bf8b', 18);
  text(ctx, 'C#  PortfolioService.cs  ×', 555, 108, '#aaa', 17);
  text(ctx, '{}  launch.json  ×', 875, 108, '#aaa', 17);
  text(ctx, 'src  ›  experiences  ›  ideas.tsx  ›  bootstrap', 321, 151, '#999', 16);
  // Dense, syntax-highlighted source remains populated from the first frame.
  source.forEach((line, index) => {
    const y = 187 + index * 23;
    if (index === 16) { ctx.fillStyle = '#343326'; ctx.fillRect(301, y - 19, 1030, 24); }
    text(ctx, String(index + 1), 321, y, index === 16 ? '#efdf91' : '#737373', 18);
    const animated = index === 24 ? line.slice(0, Math.min(line.length, 9 + Math.floor(time * 8))) : line;
    syntax(ctx, animated, 378, y);
    if (index > 10 && index < 25) { ctx.strokeStyle = '#3c3c3c'; ctx.beginPath(); ctx.moveTo(391, y + 4); ctx.lineTo(391, y - 18); ctx.stroke(); }
  });
  ctx.fillStyle = '#e15c58'; ctx.beginPath(); ctx.arc(308, 187 + 16 * 23 - 7, 6, 0, Math.PI * 2); ctx.fill();
  text(ctx, '▶', 341, 187 + 16 * 23, '#edc96f', 18);
  if (Math.floor(time * 2) % 2 === 0) { ctx.fillStyle = '#ddd'; ctx.fillRect(378 + 24 * 13.2, 187 + 24 * 23 - 18, 2, 22); }
  // Minimap and debugger inspection pane.
  ctx.fillStyle = '#202020'; ctx.fillRect(1331, 126, 389, 655);
  text(ctx, 'RUN AND DEBUG', 1350, 154, '#bbb', 16);
  text(ctx, '⌄ VARIABLES', 1345, 196, '#ccc', 16);
  const variables = [['runtime', '{ … }'], ['  mode', '"development"'], ['  modules', 'Array(4)'], ['  ready', 'true'], ['profile.name', '"Muhammad Fariz"'], ['timeline', 'Timeline { … }']];
  variables.forEach(([name, value], index) => { text(ctx, name, 1353, 228 + index * 30, '#9cdcfe', 16); text(ctx, value, 1520, 228 + index * 30, index === 3 ? palette.blue : palette.orange, 15); });
  text(ctx, '⌄ WATCH', 1345, 442, '#ccc', 16); text(ctx, 'projects.length: 4', 1353, 475, '#b5cea8', 17);
  text(ctx, 'runtime.ready: true', 1353, 505, '#9cdcfe', 17);
  text(ctx, '⌄ CALL STACK', 1345, 555, '#ccc', 16); text(ctx, '› bootstrap      ideas.tsx:17', 1353, 591, '#e6c17d', 16); text(ctx, '  startWorkspace  runtime.ts:42', 1353, 621, '#aaa', 15);
  text(ctx, '⌄ BREAKPOINTS', 1345, 677, '#ccc', 16); text(ctx, '● ideas.tsx : 17', 1353, 712, '#d7796d', 17);
  ctx.fillStyle = '#343434'; ctx.fillRect(1020, 132, 284, 40);
  text(ctx, '▶   ↷   ↓   ↑   ↻   ■', 1038, 159, '#8ed0e6', 22);
  // Integrated terminal / debug console with timestamps and changing diagnostics.
  ctx.fillStyle = '#181818'; ctx.fillRect(300, 794, 1420, 259);
  ctx.fillStyle = '#3d3d3d'; ctx.fillRect(300, 794, 1420, 1);
  text(ctx, 'PROBLEMS  0     OUTPUT     DEBUG CONSOLE     TERMINAL', 323, 826, '#a8a8a8', 17);
  ctx.fillStyle = '#ff6259'; ctx.fillRect(637, 837, 148, 2);
  text(ctx, '●  Launch Portfolio (Node.js)                       +   ⋮   ×', 1100, 826, '#999', 14);
  const diagnostics = [
    ['[debug] debugger attached · node --inspect', '#b8b8b8'],
    ['[trace] resolving workspace / src / experiences', '#7d9cae'],
    ['[debug] bootstrap() → register routes → prepare timeline', '#b8b8b8'],
    ['[watch] ideas.tsx modified · incremental build', '#cfb478'],
    [Math.floor(time / 2) % 2 ? '[ready] workspace compiled · waiting for pnpm dev' : '[trace] assets loaded · scene graph ready', '#93c7a5'],
  ];
  diagnostics.forEach(([line, color], index) => { text(ctx, '16:42:' + String(10 + index + Math.floor(time / 8) % 40).padStart(2, '0'), 323, 874 + index * 32, '#656565', 17); text(ctx, line, 445, 874 + index * 32, color, 18); });
  // Status bar.
  ctx.fillStyle = '#9b4e3f'; ctx.fillRect(0, 1053, 1720, 27);
  text(ctx, '⑂ main*   ↻   ⓧ 0  ⚠ 0     ◉ Debugging', 16, 1072, '#fff2e7', 15);
  text(ctx, 'Ln 17, Col 42    Spaces: 2    UTF-8    LF    TypeScript React    Prettier', 920, 1072, '#fff2e7', 15);
  ctx.restore();
}
