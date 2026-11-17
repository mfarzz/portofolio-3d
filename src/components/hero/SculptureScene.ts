import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { attachWorkstationScreens, findModelPart, type ScreenMode } from './WorkstationScreens';
import type { MonitorPower } from './EditorSurface';
import { createWorkspaceBrowser } from '../intro/WorkspaceBrowser';
import { loadModelBytes } from '../../app/assetCache';

gsap.registerPlugin(ScrollTrigger);

type SceneOptions = {
  hero: HTMLElement;
  modelUrl: string;
  onReady: () => void;
  onFallback: () => void;
  variant: 'workstation' | 'code';
  onScreenChange?: (mode: ScreenMode) => void;
  boot?: boolean;
  terminalElement?: HTMLElement;
};

export type SculptureController = {
  dispose: () => void;
  setPaused: (paused: boolean) => void;
  setScreenMode: (mode: ScreenMode) => void;
  launch: () => Promise<void>;
  setPower: (mode: MonitorPower, progress?: number) => void;
};

function disposeModel(model: THREE.Object3D) {
  model.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    }
  });
}

export function mountSculpture(host: HTMLElement, options: SceneOptions): SculptureController {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 761 ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  // Same orthographic composition as the Blender poster, converted from Z-up to Y-up.
  const workstation = options.variant === 'workstation';
  const halfView = workstation ? options.boot ? 2.9 : 4.5 : 3.6;
  const camera = new THREE.OrthographicCamera(-halfView, halfView, halfView, -halfView, 0.1, 60);
  camera.position.set(options.boot ? -0.24 : workstation ? -0.3 : 4.8, options.boot ? 1.65 : workstation ? 4.9 : 5, workstation ? 12 : 10);
  camera.lookAt(options.boot ? -0.24 : workstation ? 0 : 0.1, options.boot ? 1.65 : workstation ? 1.45 : 0, 0);
  const scrollGroup = new THREE.Group();
  const introGroup = new THREE.Group();
  const tiltGroup = new THREE.Group();
  scene.add(scrollGroup);
  scrollGroup.add(introGroup);
  introGroup.add(tiltGroup);
  scene.add(new THREE.HemisphereLight(0xffedcf, 0x49403a, workstation ? 1.2 : 2));
  const lights: [number, number, number, number, number][] = [
    [0xffdfc5, workstation ? 2.3 : 3.8, -4, 7, 5],
    [workstation ? 0xff9170 : 0xc7dcff, workstation ? 1 : 2, 5, 3, 2],
    [workstation ? 0xe2f79b : 0xff9a65, workstation ? 1.8 : 3, 1, 5, -4],
  ];
  for (const [color, intensity, x, y, z] of lights) {
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(x, y, z);
    scene.add(light);
  }

  let disposed = false;
  let ready = false;
  let paused = false;
  let visible = false;
  let running = false;
  let elapsed = 0;
  let model: THREE.Object3D | undefined;
  let environment: THREE.WebGLRenderTarget | undefined;
  let animationContext: gsap.Context | undefined;
  let intro: gsap.core.Timeline | undefined;
  let scroll: gsap.core.Timeline | undefined;
  let screens: ReturnType<typeof attachWorkstationScreens> | undefined;
  let screenMode: ScreenMode = 'editor';
  let floatingTerminal: THREE.Object3D | undefined;
  let terminalHeight = 0;
  let powerMode: MonitorPower = options.boot ? 'off' : 'on';
  let powerProgress = options.boot ? 0 : 1;
  let cssRenderer: CSS3DRenderer | undefined;
  let cssScene: THREE.Scene | undefined;
  let terminalObject: CSS3DObject | undefined;
  let terminalMesh: THREE.Mesh | undefined;
  let launchTween: gsap.core.Timeline | undefined;
  let finishLaunch: (() => void) | undefined;
  let browserObject: CSS3DObject | undefined;
  let browserMesh: THREE.Mesh | undefined;
  let browserElement: HTMLElement | undefined;
  const browserScale = new THREE.Matrix4();
  const terminalScale = new THREE.Matrix4();
  const renderFrame = () => {
    renderer.render(scene, camera);
    if (cssRenderer && cssScene && terminalObject && terminalMesh) {
      terminalObject.matrix.copy(terminalMesh.matrixWorld).multiply(terminalScale);
      terminalObject.matrixWorldNeedsUpdate = true;
      if (browserObject && browserMesh) {
        browserObject.matrix.copy(browserMesh.matrixWorld).multiply(browserScale);
        browserObject.matrixWorldNeedsUpdate = true;
      }
      cssRenderer.render(cssScene, camera);
    }
  };
  const request = new AbortController();
  const pointer = { x: 0, y: 0 };
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const render = (_time: number, delta: number) => {
    if (disposed) return;
    elapsed += Math.min(delta, 50) / 1000;
    const damp = 1 - Math.exp(-Math.min(delta, 50) / 100);
    const typing = options.terminalElement?.contains(document.activeElement);
    if (!typing && !options.boot) {
      tiltGroup.rotation.x += (pointer.y - tiltGroup.rotation.x) * damp;
      tiltGroup.rotation.y += (pointer.x - tiltGroup.rotation.y) * damp;
      tiltGroup.position.y = Math.sin(elapsed * 0.8) * 0.055;
    }
    const satellite = model && findModelPart(model, 'SatelliteCube');
    if (satellite) satellite.rotation.y += Math.min(delta, 50) * 0.00018;
    if (floatingTerminal && !typing && !options.boot) floatingTerminal.position.y = terminalHeight + Math.sin(elapsed * 0.9) * 0.07;
    screens?.update(elapsed, screenMode);
    renderFrame();
  };

  const syncLoop = () => {
    const shouldRun = ready && visible && !document.hidden && !paused && !disposed;
    if (shouldRun === running) return;
    running = shouldRun;
    host.dataset.running = String(running);
    if (running) {
      intro?.resume();
      gsap.ticker.add(render);
    } else {
      intro?.pause();
      gsap.ticker.remove(render);
    }
  };

  const resize = () => {
    if (disposed) return;
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    const verticalHalf = options.boot ? Math.max(2, 4.05 / aspect) : halfView;
    camera.left = -verticalHalf * aspect;
    camera.right = verticalHalf * aspect;
    camera.top = verticalHalf;
    camera.bottom = -verticalHalf;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    cssRenderer?.setSize(width, height);
    if (ready) renderFrame();
  };

  const pointerMove = (event: PointerEvent) => {
    if (options.boot || !finePointer.matches || paused || options.terminalElement?.contains(document.activeElement)) return;
    const rect = options.hero.getBoundingClientRect();
    pointer.x = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 0.24, -0.12, 0.12);
    pointer.y = THREE.MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 0.16, -0.08, 0.08);
  };
  const pointerLeave = () => { pointer.x = 0; pointer.y = 0; };
  const clickScreen = (event: MouseEvent) => {
    if (!workstation || !model || options.boot) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const position = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(position, camera);
    const hit = raycaster.intersectObjects(model.children, true).some(item => ['EditorScreen', 'TerminalScreen', 'MonitorBezel', 'MonitorInset'].includes(item.object.name));
    if (hit) options.onScreenChange?.(screenMode === 'editor' ? 'terminal' : 'editor');
  };
  if (workstation) renderer.domElement.addEventListener('click', clickScreen);
  const observer = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    syncLoop();
  }, { threshold: 0.01 });
  observer.observe(options.hero);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  document.addEventListener('visibilitychange', syncLoop);
  options.hero.addEventListener('pointermove', pointerMove, { passive: true });
  options.hero.addEventListener('pointerleave', pointerLeave);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    request.abort();
    gsap.ticker.remove(render);
    host.dataset.running = 'false';
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener('visibilitychange', syncLoop);
    options.hero.removeEventListener('pointermove', pointerMove);
    options.hero.removeEventListener('pointerleave', pointerLeave);
    renderer.domElement.removeEventListener('click', clickScreen);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    animationContext?.revert();
    launchTween?.kill();
    finishLaunch?.();
    finishLaunch = undefined;
    browserElement?.remove();
    if (model) disposeModel(model);
    screens?.dispose();
    environment?.dispose();
    scene.environment = null;
    renderer.dispose();
    if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
    renderer.domElement.remove();
    cssRenderer?.domElement.remove();
  };

  const fallback = () => {
    if (disposed) return;
    dispose();
    options.onFallback();
  };
  const contextLost = (event: Event) => { event.preventDefault(); fallback(); };
  renderer.domElement.addEventListener('webglcontextlost', contextLost);

  resize();
  void (async () => {
    try {
      const bytes = await loadModelBytes(options.modelUrl);
      request.signal.throwIfAborted();
      const gltf = await new GLTFLoader().parseAsync(bytes, '');
      if (disposed) { disposeModel(gltf.scene); return; }
      model = gltf.scene;
      tiltGroup.add(model);
      if (workstation) {
        screens = attachWorkstationScreens(model);
        screens.setPower(powerMode, powerProgress);
        screens.update(0, screenMode, true);
        floatingTerminal = findModelPart(model, 'FloatingTerminal');
        terminalHeight = floatingTerminal?.position.y ?? 0;
      }
      const generator = new THREE.PMREMGenerator(renderer);
      const room = new RoomEnvironment();
      try { environment = generator.fromScene(room, 0.04); }
      finally { room.dispose(); generator.dispose(); }
      scene.environment = environment.texture;
      if (workstation) scene.environmentIntensity = 0.7;
      if (options.terminalElement) {
        const target = findModelPart(model, 'TerminalScreen');
        if (!(target instanceof THREE.Mesh)) throw new Error('Terminal screen unavailable');
        terminalMesh = target;
        terminalMesh.geometry.computeBoundingBox();
        const size = terminalMesh.geometry.boundingBox!.getSize(new THREE.Vector3());
        // Blender's glTF export stores this plane on local XZ; CSS surfaces use XY.
        terminalScale.identity();
        if (size.y < 0.001) terminalScale.makeRotationX(-Math.PI / 2);
        terminalScale.multiply(new THREE.Matrix4().makeScale(size.x / 1000, (size.y || size.z) / 700, 1));
        terminalObject = new CSS3DObject(options.terminalElement);
        terminalObject.matrixAutoUpdate = false;
        cssScene = new THREE.Scene();
        cssScene.add(terminalObject);
        cssRenderer = new CSS3DRenderer();
        cssRenderer.domElement.className = 'boot-css3d';
        host.append(cssRenderer.domElement);
        resize();
      }

      animationContext = gsap.context(() => {
        intro = gsap.timeline({ paused: true })
          .fromTo(introGroup.rotation, { y: options.boot ? 0 : -0.35, z: options.boot ? 0 : -0.06 }, { y: 0, z: 0, duration: 1.4, ease: 'power3.out' }, 0)
          .fromTo(introGroup.scale, { x: options.boot ? 1 : 0.88, y: options.boot ? 1 : 0.88, z: options.boot ? 1 : 0.88 }, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'power3.out' }, 0);
        if (workstation && !options.boot && model) {
          const pieces = [
            { name: 'EditorMonitor', x: -2, y: 0.8, z: -1.5 },
            { name: 'FloatingTerminal', x: 2, y: 0.4, z: -1 },
            { name: 'Keyboard', x: 0, y: -1.4, z: 1 },
            { name: 'FloatingTrackpad', x: 1.5, y: -0.9, z: 1 },
          ];
          pieces.forEach((piece, index) => {
            const part = findModelPart(model!, piece.name);
            if (!part) return;
            const position = part.position.clone();
            intro!.fromTo(part.position, { x: position.x + piece.x, y: position.y + piece.y, z: position.z + piece.z }, { x: position.x, y: position.y, z: position.z, duration: 1.15, ease: 'power3.out' }, 0.15 + index * 0.17);
          });
        }
        if (!options.boot) scroll = gsap.timeline({ scrollTrigger: { trigger: options.hero, start: 'top top', end: 'bottom top', scrub: 0.8 } })
          .to(scrollGroup.rotation, { y: 0.25, x: -0.1, ease: 'none' }, 0)
          .to(scrollGroup.position, { y: 0.3, ease: 'none' }, 0);
      });
      ready = true;
      renderFrame();
      options.onReady();
      syncLoop();
    } catch (error) {
      host.dataset.sceneError = error instanceof Error ? error.message : 'Scene unavailable';
      if (!disposed) fallback();
    }
  })();

  return {
    dispose,
    setPower(mode, progress = 1) {
      powerMode = mode; powerProgress = progress;
      host.dataset.monitorPower = mode;
      screens?.setPower(mode, progress);
      screens?.update(elapsed, screenMode, true);
      if (ready) renderFrame();
    },
    setPaused(value) {
      paused = value;
      if (paused) scroll?.scrollTrigger?.disable(false, false);
      else scroll?.scrollTrigger?.enable(false, false);
      syncLoop();
    },
    setScreenMode(value) {
      screenMode = value;
      host.dataset.screenMode = value;
      screens?.update(elapsed, value, true);
      if (ready) renderFrame();
    },
    async launch() {
      paused = true;
      syncLoop();
      scroll?.scrollTrigger?.disable(false, false);
      const editor = model && findModelPart(model, 'EditorScreen');
      const target = editor?.getWorldPosition(new THREE.Vector3()) ?? new THREE.Vector3(-1.58, 1.95, 0);
      const look = new THREE.Vector3(options.boot ? -0.24 : 0, options.boot ? 1.65 : 1.45, 0);
      screens?.update(999, 'editor', true);
      let browserWindow: HTMLElement | undefined;
      let zoom = 2.6;
      if (editor instanceof THREE.Mesh && cssScene) {
        const browser = createWorkspaceBrowser();
        browserElement = browser.element;
        browserWindow = browser.window;
        browserMesh = editor;
        editor.geometry.computeBoundingBox();
        const size = editor.geometry.boundingBox!.getSize(new THREE.Vector3());
        browserScale.identity();
        if (size.y < 0.001) browserScale.makeRotationX(-Math.PI / 2);
        browserScale.multiply(new THREE.Matrix4().makeScale(size.x / 1440, (size.y || size.z) / 904, 1));
        browserObject = new CSS3DObject(browser.element);
        browserObject.matrixAutoUpdate = false;
        cssScene.add(browserObject);
        gsap.set(browserWindow, { opacity: 0, scale: 0.7, y: 100, transformOrigin: '50% 85%' });
        renderFrame();
        await browser.loaded;
        if (disposed) return;
        // Fit the browser content, including its aspect ratio, rather than a fixed camera zoom.
        const worldSize = new THREE.Box3().setFromObject(editor).getSize(new THREE.Vector3());
        zoom = Math.max((camera.right - camera.left) / worldSize.x, (camera.top - camera.bottom) / worldSize.y) * 1.002;
      }
      return new Promise<void>(resolve => {
        finishLaunch = resolve;
        host.dataset.launchPhase = 'browser';
        launchTween = gsap.timeline({ id: 'workspace-entry', onComplete: resolve, onUpdate: () => { camera.lookAt(look); camera.updateProjectionMatrix(); renderFrame(); } });
        if (browserWindow) launchTween.to(browserWindow, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0);
        launchTween.call(() => { host.dataset.launchPhase = 'enter'; }, [], 1.25);
        if (browserWindow) {
          launchTween.to(browserWindow.querySelectorAll('.workspace-browser-tabs, .workspace-browser-address'), { height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, borderWidth: 0, duration: 0.65, ease: 'power2.inOut' }, 1.3)
            .to(browserWindow, { borderRadius: 0, duration: 0.65 }, 1.3);
        }
        launchTween.to(look, { x: target.x, y: target.y, z: target.z, duration: 1.65, ease: 'power3.inOut' }, 1.25)
          .to(camera.position, { x: target.x, y: target.y, duration: 1.65, ease: 'power3.inOut' }, 1.25)
          .to(camera, { zoom, duration: 1.65, ease: 'power3.inOut' }, 1.25)
          .to(options.hero.querySelectorAll('.boot-header, .boot-footer'), { opacity: 0, duration: 0.5 }, 1.4);
        // A brief warm fade bridges the projected browser and the assembling live page.
        launchTween.to(host, { opacity: 0, duration: 0.22 }, 2.82);
      });
    },
  };
}
