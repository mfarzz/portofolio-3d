import * as THREE from 'three';
import { paintBootScreen, paintEditor, type MonitorPower } from './EditorSurface';

export type ScreenMode = 'editor' | 'terminal';

export function findModelPart(model: THREE.Object3D, name: string) {
  let found: THREE.Object3D | undefined;
  model.traverse(object => { if (!found && object.name.replace(/[._]?\d+$/, '') === name) found = object; });
  return found;
}

function surface(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Screen canvas unavailable');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = 4;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return { canvas, context, texture };
}

type Surface = ReturnType<typeof surface>;

function chrome(screen: Surface, title: string) {
  const { context: ctx, canvas } = screen;
  ctx.fillStyle = '#1d1d1f'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#303034'; ctx.fillRect(0, 0, canvas.width, 52);
  ctx.font = '21px Consolas, monospace'; ctx.fillStyle = '#d1d1d6'; ctx.textAlign = 'left';
  ctx.fillText('>_', 22, 33);
  ctx.textAlign = 'center'; ctx.fillText(title, canvas.width / 2, 33);
  ctx.textAlign = 'right'; ctx.fillText('−   □   ×', canvas.width - 18, 33); ctx.textAlign = 'left';
}

function editor(screen: Surface, time: number) {
  paintEditor(screen.context, screen.canvas.width, screen.canvas.height, time);
}

function terminal(screen: Surface, time: number, compact = false) {
  chrome(screen, 'fariz@linux: ~/portfolio');
  const ctx = screen.context;
  ctx.fillStyle = '#26262b'; ctx.fillRect(0, 52, screen.canvas.width, 38);
  ctx.fillStyle = '#aeb0ba'; ctx.font = '19px Consolas, monospace';
  ctx.fillText('File   Edit   View   Search   Terminal   Help', 25, 77);
  const lines = ['fariz@linux:~/portfolio$ pnpm dev', '', '> portfolio@1.0.0 dev', '[vite] modules loaded', '[ready] portfolio is running', '', 'fariz@linux:~/portfolio$'];
  ctx.font = (compact ? '27' : '25') + 'px Consolas, monospace';
  lines.forEach((line, index) => {
    ctx.fillStyle = line.startsWith('fariz') ? '#99c8a0' : line.startsWith('[ready]') ? '#a8d99d' : '#c8c8d1';
    ctx.fillText(line, 32, 142 + index * 62);
  });
  if (Math.floor(time * 2) % 2 === 0) { ctx.fillStyle = '#a7cf91'; ctx.fillRect(32, 565, 15, 24); }
}

export function attachWorkstationScreens(model: THREE.Object3D) {
  const main = surface(1720, 1080);
  const floating = surface(1000, 700);
  const preview = surface(320, 624);
  const replaced = new Set<THREE.Material>();
  for (const [name, screen] of [['EditorScreen', main], ['TerminalScreen', floating], ['PreviewScreen', preview]] as const) {
    const mesh = findModelPart(model, name);
    if (!(mesh instanceof THREE.Mesh)) { if (name === 'PreviewScreen') continue; throw new Error('Workstation screen missing: ' + name); }
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(material => replaced.add(material));
    mesh.material = new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false });
  }
  replaced.forEach(material => material.dispose());
  chrome(preview, 'BUILD');
  const ctx = preview.context;
  ctx.fillStyle = '#284a48'; ctx.fillRect(25, 93, 270, 164);
  ctx.strokeStyle = '#7de2d1'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(48, 218); ctx.lineTo(106, 160); ctx.lineTo(167, 188); ctx.lineTo(260, 119); ctx.stroke();
  ctx.font = '27px Consolas, monospace'; ctx.fillStyle = '#cad9e2';
  ['WEB', 'DESKTOP', 'DATA'].forEach((line, index) => ctx.fillText(line, 32, 335 + index * 65));
  ctx.fillStyle = '#7de2d1'; ctx.fillRect(26, 535, 268, 51); ctx.fillStyle = '#14372e'; ctx.font = '22px Consolas, monospace'; ctx.fillText('KEEP BUILDING', 47, 568);
  preview.texture.needsUpdate = true;
  let lastTick = -1;
  let lastMode: ScreenMode | undefined;
  let power: MonitorPower = 'on';
  let bootProgress = 1;
  return {
    setPower(mode: MonitorPower, progress = 1) { power = mode; bootProgress = progress; lastTick = -1; },
    update(time: number, mode: ScreenMode, force = false) {
      const tick = Math.floor(time * 8);
      if (!force && tick === lastTick && mode === lastMode) return;
      lastTick = tick; lastMode = mode;
      if (power !== 'on') {
        paintBootScreen(main.context, main.canvas.width, main.canvas.height, power, bootProgress);
        paintBootScreen(floating.context, floating.canvas.width, floating.canvas.height, power, bootProgress);
      } else {
        if (mode === 'editor') editor(main, time); else terminal(main, time);
        terminal(floating, time, true);
      }
      main.texture.needsUpdate = true;
      floating.texture.needsUpdate = true;
    },
    dispose() { for (const screen of [main, floating, preview]) { screen.canvas.width = 1; screen.canvas.height = 1; } },
  };
}
