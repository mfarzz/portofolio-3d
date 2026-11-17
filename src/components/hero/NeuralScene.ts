import * as THREE from 'three';
import { gsap } from 'gsap';
import type { NeuralMarkerId } from '../../app/data/neural';

type Options = {
  onReady: () => void;
  onFallback: () => void;
  onHover: (id: NeuralMarkerId | null) => void;
  onSelect: (id: NeuralMarkerId, layer?: number, point?: { x: number; y: number }) => void;
  project: (id: NeuralMarkerId, x: number, y: number, visible: boolean) => void;
  projectLayer: (layer: number, left: number, top: number, width: number, height: number) => void;
  photoUrl?: string;
  onActiveLayer: (label: string) => void;
};
export type NeuralController = {
  dispose: () => void;
  setProgress: (progress: number) => void;
  setHovered: (id: NeuralMarkerId | null) => void;
  setLayerHovered: (layer: number | null) => void;
  setPaused: (paused: boolean) => void;
};

/** Procedural geometry keeps every sheet and node independently interactive. */
export function mountNeuralScene(host: HTMLElement, options: Options): NeuralController {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x252423, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-9, 9, 6, -6, 0.1, 80);
  const model = new THREE.Group();
  scene.add(model);
  scene.add(new THREE.AmbientLight(0xffe6cf, 2));
  const key = new THREE.DirectionalLight(0xffeee2, 3); key.position.set(-5, 7, 10); scene.add(key);
  const rim = new THREE.DirectionalLight(0xdbf967, 1.5); rim.position.set(5, 3, -4); scene.add(rim);
  const pickable: THREE.Object3D[] = [];
  const textures = new Set<THREE.Texture>();
  const stacks: { group: THREE.Group; sheets: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[]; depth: number; action: NeuralMarkerId; phase: number; label: string; patch: THREE.Object3D }[] = [];
  const anchors = new Map<NeuralMarkerId, THREE.Object3D>();
  const edges: { from: THREE.Object3D; to: THREE.Object3D; curve: THREE.QuadraticBezierCurve3; line: THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>; phase: number; fan?: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial>; arrow?: THREE.Mesh }[] = [];
  let disposed = false;
  let paused = false;
  let visible = false;
  let running = false;
  let progress = 0;
  let hovered: NeuralMarkerId | null = null;
  let hoveredStack: number | null = null;
  let clock = 0;
  let lastTime = 0;
  let frameWidth = 1;
  let frameHeight = 1;
  let activeLabel = '';

  const featureTexture = (seed: number, input = false) => {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = input ? '#34312d' : '#fff4db'; ctx.fillRect(0, 0, 256, 256);
    if (input) {
      ctx.strokeStyle = '#9b927d'; ctx.lineWidth = 1; ctx.strokeRect(16, 16, 224, 224);
      ctx.fillStyle = '#dbf967'; ctx.textAlign = 'center'; ctx.font = 'bold 80px Arial'; ctx.fillText('MF', 128, 144);
      ctx.fillStyle = '#e0d9c9'; ctx.font = '11px monospace'; ctx.fillText('THE HUMAN / INPUT', 128, 185);
      ctx.fillStyle = '#9b927d'; ctx.font = '10px monospace'; ctx.fillText('PHOTO / 01', 128, 215);
    } else {
      for (let row = 0; row < 8; row++) for (let column = 0; column < 8; column++) {
        const n = (Math.sin((row * 8 + column + seed * 11) * 12.9898) * 43758.5453) % 1;
        ctx.fillStyle = Math.abs(n) > 0.55 ? '#4d594d66' : '#4d594d10';
        ctx.fillRect(column * 32 + 2, row * 32 + 2, 28, 28);
      }
      ctx.strokeStyle = '#ff6259'; ctx.lineWidth = 3; ctx.strokeRect((seed % 4 + 1) * 32, (seed % 3 + 2) * 32, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture); return texture;
  };
  const stack = (x: number, size: number, count: number, color: number, depth: number, action: NeuralMarkerId, phase: number, seed: number, label: string) => {
    const group = new THREE.Group(); group.position.x = x; group.rotation.y = -0.28; model.add(group);
    const sheets: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>[] = [];
    const geometry = new THREE.BoxGeometry(size, size, 0.035);
    const outline = new THREE.EdgesGeometry(geometry);
    const texture = featureTexture(seed, action === 'input');
    for (let index = 0; index < count; index++) {
      const material = new THREE.MeshStandardMaterial({ color, ...(index === count - 1 ? { map: texture } : {}), transparent: true, opacity: index === count - 1 ? 0.97 : 0.33, metalness: 0.18, roughness: 0.52, depthWrite: false, side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.04 });
      const sheet = new THREE.Mesh(geometry, material);
      sheet.position.z = (index - (count - 1) / 2) * depth;
      sheet.userData.action = action; sheet.userData.stack = stacks.length; group.add(sheet); sheets.push(sheet); pickable.push(sheet);
      const wire = new THREE.LineSegments(outline, new THREE.LineBasicMaterial({ color: 0xe4d4b4, transparent: true, opacity: 0.55 })); sheet.add(wire);
    }
    const front = sheets[count - 1];
    const patch = new THREE.Object3D();
    const patchSize = size / 4;
    patch.position.set(action === 'input' ? -size * 0.23 : ((seed % 4 + 2) / 8 - 0.5) * size, action === 'input' ? size * 0.23 : (0.5 - (seed % 3 + 3) / 8) * size, 0.03);
    patch.userData.patchSize = patchSize;
    front.add(patch);
    if (action === 'input') {
      const border = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-patchSize / 2, -patchSize / 2), new THREE.Vector3(patchSize / 2, -patchSize / 2), new THREE.Vector3(patchSize / 2, patchSize / 2), new THREE.Vector3(-patchSize / 2, patchSize / 2)]), new THREE.LineBasicMaterial({ color: 0xff6259, depthTest: false })); patch.add(border);
    }
    const endpoint = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff6259, depthTest: false })); patch.add(endpoint);
    stacks.push({ group, sheets, depth, action, phase, label, patch });
    return sheets[count - 1];
  };
  const input = stack(-7.6, 2.35, 3, 0xf1b391, 0.3, 'input', 0, 0, 'IMAGE INPUT');
  stack(-4.5, 2.45, 7, 0xff8176, 0.25, 'features', 0.23, 1, 'CONVOLUTION / 01');
  stack(-1.6, 1.55, 4, 0xdbf967, 0.25, 'features', 0.36, 2, 'POOLING / 01');
  stack(1.0, 1.75, 6, 0xffaa8e, 0.22, 'features', 0.47, 3, 'CONVOLUTION / 02');
  stack(3.2, 1.05, 4, 0xdbf967, 0.23, 'features', 0.59, 4, 'POOLING / 02');
  const inputLabel = new THREE.Object3D(); inputLabel.position.set(0, 1.7, 0.3); stacks[0].group.add(inputLabel); anchors.set('input', inputLabel);

  const barMaterial = new THREE.MeshStandardMaterial({ color: 0xffd7a5, metalness: 0.4, roughness: 0.4 });
  barMaterial.transparent = true;
  const bars = new THREE.Group(); bars.position.set(4.9, 0, 0); bars.rotation.z = 0.15; model.add(bars);
  for (let index = 0; index < 14; index++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.7, 0.065), barMaterial); bar.position.z = (index - 6.5) * 0.1; bars.add(bar);
  }

  const nodeGeometry = new THREE.SphereGeometry(0.105, 14, 10);
  const network = new THREE.Group(); network.position.x = 7.6; model.add(network);
  const networkLayers: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>[][] = [];
  [5, 4, 3].forEach((count, layer) => {
    const nodes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>[] = [];
    for (let index = 0; index < count; index++) {
      const id: NeuralMarkerId = layer === 2 ? (['rintas', 'ally', 'tangkapin'] as const)[index] : 'network';
      const node = new THREE.Mesh(nodeGeometry, new THREE.MeshStandardMaterial({ color: layer === 2 ? 0xdbf967 : 0xffeee0, emissive: layer === 2 ? 0xdbf967 : 0xff6259, emissiveIntensity: 0.2, metalness: 0.3, roughness: 0.3, transparent: true }));
      node.position.set(6.3 + layer * 1.3 - 7.6, ((count - 1) / 2 - index) * 0.78, (index % 2) * 0.12);
      if (layer === 2) {
        node.scale.setScalar(1.7);
        const anchor = new THREE.Object3D(); anchor.position.x = 0.63; node.add(anchor); anchors.set(id, anchor);
      }
      node.userData.action = id; network.add(node); nodes.push(node); pickable.push(node);
    }
    networkLayers.push(nodes);
  });
  const connect = (from: THREE.Object3D, to: THREE.Object3D, phase: number, featureFlow = false) => {
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(21 * 3), 3));
    const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: featureFlow ? 0xff8c76 : 0xc2b49c, transparent: true, opacity: featureFlow ? 0.7 : 0.22, depthTest: !featureFlow }));
    let fan: THREE.LineSegments<THREE.BufferGeometry, THREE.LineBasicMaterial> | undefined;
    let arrow: THREE.Mesh | undefined;
    if (featureFlow) {
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24), 3));
      fan = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xffb299, transparent: true, opacity: 0.4, depthTest: false })); model.add(fan);
      arrow = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 6), new THREE.MeshBasicMaterial({ color: 0xff8c76, depthTest: false })); model.add(arrow);
    }
    model.add(line); edges.push({ from, to, curve, line, phase, fan, arrow });
  };
  for (let index = 0; index < networkLayers.length - 1; index++) for (const from of networkLayers[index]) for (const to of networkLayers[index + 1]) connect(from, to, 0.78 + index * 0.14);
  for (let index = 0; index < stacks.length - 1; index++) connect(stacks[index].patch, stacks[index + 1].patch, (stacks[index].phase + stacks[index + 1].phase) / 2, true);
  connect(stacks[stacks.length - 1].patch, bars, 0.64, true);
  for (const node of networkLayers[0]) connect(bars, node, 0.72);
  const featureEdges = edges.filter(edge => !!edge.fan);
  const pulses = Array.from({ length: 18 }, (_, index) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: index % 3 === 0 ? 0xff6259 : 0xdbf967 })); model.add(mesh); return mesh;
  });

  if (options.photoUrl) {
    new THREE.TextureLoader().load(options.photoUrl, texture => {
      if (disposed) { texture.dispose(); return; }
      texture.colorSpace = THREE.SRGBColorSpace; textures.add(texture); input.material.map = texture; input.material.needsUpdate = true; renderFrame();
    }, undefined, () => {});
  }

  const projection = new THREE.Vector3();
  const layerBounds = new THREE.Box3();
  const corner = new THREE.Vector3();
  const point = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const inModel = (object: THREE.Object3D, target: THREE.Vector3, x = 0, y = 0) => model.worldToLocal(target.set(x, y, 0).applyMatrix4(object.matrixWorld));
  const weight = (travel: number, phase: number) => Math.exp(-Math.pow((travel - phase) / 0.095, 2));
  const renderFrame = () => {
    if (disposed) return;
    const expand = THREE.MathUtils.smoothstep(progress, 0, 0.25);
    const fit = Math.min(1, Math.max(0.65, (frameHeight - 300) / (frameWidth / 23 * 5)));
    const lift = THREE.MathUtils.clamp((760 - frameHeight) / 160, 0, 1) * 0.7;
    const travel = THREE.MathUtils.clamp((progress - 0.25) / 0.75, 0, 1);
    const focus = THREE.MathUtils.smoothstep(progress, 0.23, 0.32);
    model.position.set(4.9 * (1 - expand), -0.1 + lift * expand, 0);
    model.scale.setScalar(0.5 + expand * (fit - 0.5));
    model.rotation.set(-0.02 + expand * 0.03, -0.24 * (1 - expand), -0.04 * (1 - expand));
    camera.position.set(4.1 - expand * 1.2, 3.6 - expand * 1.1, 20);
    camera.lookAt(0, 0.15, 0);
    const layers = [...stacks.map(item => ({ phase: item.phase, label: item.label })), { phase: 0.68, label: 'FLATTEN' }, { phase: 0.8, label: 'NEURAL NETWORK' }, { phase: 0.96, label: 'PROJECT OUTPUT' }];
    const nearest = layers.reduce((best, item) => Math.abs(travel - item.phase) < Math.abs(travel - best.phase) ? item : best);
    if (nearest.label !== activeLabel) { activeLabel = nearest.label; host.dataset.activeLayer = activeLabel; options.onActiveLayer(activeLabel); }
    for (const [stackIndex, item] of stacks.entries()) {
      const active = weight(travel, item.phase);
      const target = 1 + ((0.82 + active * 0.46) - 1) * focus;
      item.group.scale.setScalar(THREE.MathUtils.lerp(item.group.scale.x, target, paused ? 1 : 0.16));
      const brightness = 1 - focus * (1 - (0.34 + active * 0.66));
      item.sheets.forEach((sheet, index) => {
        const open = hoveredStack === stackIndex || (hoveredStack === null && hovered === 'input' && item.action === 'input') ? 1.6 : 1;
        sheet.position.z = THREE.MathUtils.lerp(sheet.position.z, (index - (item.sheets.length - 1) / 2) * item.depth * open, paused ? 1 : 0.12);
        sheet.material.opacity = (index === item.sheets.length - 1 ? 0.97 : 0.33) * brightness;
        sheet.material.emissiveIntensity = 0.035 + active * focus * 0.18 + (hovered === item.action ? 0.08 : 0);
        sheet.children.forEach(child => { if (child instanceof THREE.LineSegments && child.material instanceof THREE.LineBasicMaterial) child.material.opacity = 0.55 * brightness; });
      });
    }
    const flattenWeight = weight(travel, 0.68);
    bars.scale.setScalar(1 + ((0.82 + flattenWeight * 0.46) - 1) * focus);
    barMaterial.opacity = 1 - focus * (1 - (0.34 + flattenWeight * 0.66));
    const networkWeight = Math.max(weight(travel, 0.8), weight(travel, 0.96));
    network.scale.setScalar(1 + ((0.9 + networkWeight * 0.12) - 1) * focus);
    networkLayers.forEach(layer => layer.forEach(node => { node.material.opacity = 1 - focus * (1 - (0.32 + networkWeight * 0.68)); node.material.emissiveIntensity = hovered === node.userData.action ? 1.1 : 0.12 + networkWeight * 0.45; }));
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    edges.forEach(edge => {
      inModel(edge.from, edge.curve.v0); inModel(edge.to, edge.curve.v2);
      edge.curve.v1.copy(edge.curve.v0).lerp(edge.curve.v2, 0.5); edge.curve.v1.z += edge.fan ? 0.2 : -0.08;
      const positions = edge.line.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let index = 0; index <= 20; index++) { edge.curve.getPoint(index / 20, point); positions.setXYZ(index, point.x, point.y, point.z); }
      positions.needsUpdate = true; edge.line.geometry.computeBoundingSphere();
      const active = weight(travel, edge.phase);
      edge.line.material.opacity = edge.fan ? 0.35 + active * 0.6 : 0.08 + networkWeight * 0.22;
      if (edge.fan) {
        const fan = edge.fan.geometry.getAttribute('position') as THREE.BufferAttribute;
        const fromSize = (edge.from.userData.patchSize || 0.2) / 2;
        const toSize = (edge.to.userData.patchSize || 0.12) / 2;
        for (let corner = 0; corner < 4; corner++) {
          const x = corner % 2 ? 1 : -1, y = corner < 2 ? -1 : 1;
          inModel(edge.from, point, x * fromSize, y * fromSize); fan.setXYZ(corner * 2, point.x, point.y, point.z);
          inModel(edge.to, point, x * toSize, y * toSize); fan.setXYZ(corner * 2 + 1, point.x, point.y, point.z);
        }
        fan.needsUpdate = true; edge.fan.geometry.computeBoundingSphere(); edge.fan.material.opacity = 0.15 + active * 0.3;
      }
      if (edge.arrow) { edge.curve.getPoint(0.68, edge.arrow.position); edge.arrow.quaternion.setFromUnitVectors(up, edge.curve.getTangent(0.68, point).normalize()); }
    });
    pulses.forEach((pulse, index) => {
      const edge = index < featureEdges.length ? featureEdges[index] : edges[(index * 3) % edges.length];
      pulse.position.copy(edge.curve.getPoint((clock * 0.18 + index / pulses.length + travel * 0.65) % 1));
      pulse.visible = hovered !== 'input';
    });
    renderer.render(scene, camera);
    for (const [id, anchor] of anchors) {
      anchor.getWorldPosition(projection); projection.project(camera);
      options.project(id, (projection.x + 1) * frameWidth / 2, (1 - projection.y) * frameHeight / 2, projection.z > -1 && projection.z < 1 && Math.abs(projection.x) < 1.05);
    }
    stacks.forEach((item, index) => {
      layerBounds.setFromObject(item.group);
      let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
      for (let i = 0; i < 8; i++) {
        corner.set(i & 1 ? layerBounds.max.x : layerBounds.min.x, i & 2 ? layerBounds.max.y : layerBounds.min.y, i & 4 ? layerBounds.max.z : layerBounds.min.z).project(camera);
        const x = (corner.x + 1) * frameWidth / 2, y = (1 - corner.y) * frameHeight / 2;
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      options.projectLayer(index, left, top, right - left, bottom - top);
    });
  };
  const tick = (time: number, delta: number) => {
    if (time - lastTime < 1 / 30) return;
    lastTime = time; clock += Math.min(delta, 70) / 1000;
    for (const item of stacks) {
      item.group.position.y = Math.sin(clock * 0.55 + item.phase * 8) * 0.035;
    }
    renderFrame();
  };
  const sync = () => {
    const next = visible && !paused && !document.hidden && !disposed;
    if (next === running) return;
    running = next; host.dataset.running = String(next);
    if (next) gsap.ticker.add(tick); else gsap.ticker.remove(tick);
  };
  const resize = () => {
    if (disposed) return;
    const bounds = host.getBoundingClientRect();
    frameWidth = Math.max(1, bounds.width); frameHeight = Math.max(1, bounds.height);
    const halfHeight = 11.5 / (frameWidth / frameHeight);
    camera.left = -11.5; camera.right = 11.5; camera.top = halfHeight; camera.bottom = -halfHeight; camera.updateProjectionMatrix();
    renderer.setSize(frameWidth, frameHeight, false); renderFrame();
  };
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hit = (event: PointerEvent | MouseEvent) => {
    const bounds = host.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(pickable, false)[0]?.object;
  };
  const hover = (event: PointerEvent) => {
    const object = hit(event);
    const id = object?.userData.action as NeuralMarkerId | undefined || null;
    hoveredStack = typeof object?.userData.stack === 'number' ? object.userData.stack : null;
    if (id !== hovered) { hovered = id; options.onHover(id); renderer.domElement.style.cursor = id ? 'pointer' : 'default'; }
  };
  const leave = () => { hovered = null; hoveredStack = null; options.onHover(null); };
  const click = (event: MouseEvent) => { const object = hit(event); const id = object?.userData.action as NeuralMarkerId | undefined; if (id) options.onSelect(id, object?.userData.stack, { x: event.clientX, y: event.clientY }); };
  renderer.domElement.addEventListener('pointermove', hover, { passive: true });
  renderer.domElement.addEventListener('pointerleave', leave);
  renderer.domElement.addEventListener('click', click);
  const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; sync(); }, { threshold: 0.01 }); observer.observe(host);
  const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(host);
  document.addEventListener('visibilitychange', sync);
  const lost = (event: Event) => { event.preventDefault(); options.onFallback(); };
  renderer.domElement.addEventListener('webglcontextlost', lost);
  resize(); options.onReady();
  return {
    setProgress(value) { progress = value; renderFrame(); },
    setHovered(id) { if (id !== hovered) hoveredStack = null; hovered = id; if (!running) renderFrame(); },
    setLayerHovered(layer) { hoveredStack = layer; hovered = layer === null ? null : layer === 0 ? 'input' : 'features'; if (!running) renderFrame(); },
    setPaused(value) { paused = value; sync(); },
    dispose() {
      if (disposed) return;
      disposed = true; gsap.ticker.remove(tick); observer.disconnect(); sizeObserver.disconnect(); document.removeEventListener('visibilitychange', sync);
      renderer.domElement.removeEventListener('pointermove', hover); renderer.domElement.removeEventListener('pointerleave', leave); renderer.domElement.removeEventListener('click', click); renderer.domElement.removeEventListener('webglcontextlost', lost);
      const geometries = new Set<THREE.BufferGeometry>(); const materials = new Set<THREE.Material>();
      scene.traverse(object => { if (object instanceof THREE.Mesh || object instanceof THREE.Line) { geometries.add(object.geometry); (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => materials.add(material)); } });
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose()); textures.forEach(texture => { if (texture.image instanceof HTMLCanvasElement) { texture.image.width = 1; texture.image.height = 1; } texture.dispose(); });
      renderer.dispose(); if (!renderer.getContext().isContextLost()) renderer.forceContextLoss(); renderer.domElement.remove(); host.dataset.running = 'false';
    },
  };
}
