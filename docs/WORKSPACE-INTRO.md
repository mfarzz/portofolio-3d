# Interactive Linux workspace intro

## Current experience

Opening the root URL first shows two warm Blender monitors facing directly forward and filling almost the full viewport width. Both displays begin black, then show a synchronized loading screen before the editor and terminal appear. The boot sequence begins after the model is ready, so a slower model download does not skip it. Intro mouse tilt and floating rotation are disabled for readability. The left monitor contains an original VS Code / Linux-inspired editor. The right monitor contains a real HTML terminal form projected onto the Blender screen using Three.js CSS3DRenderer.

Typing `pnpm dev` and pressing Enter opens a Linux-inspired browser window on the left monitor. Its content is only the centered word WELCOME on the warm dark background. There is no iframe or embedded portfolio preview. The decorative window is inert and hidden from assistive technology. GSAP moves the camera straight into it while its tab and address bars collapse. A short warm fade leads into the live portfolio.

The live page then assembles its navigation, developer labels and headline. The workstation is exclusive to this intro; Hero now uses the shared CNN scene described in `NEURAL-EXPERIENCE.md`, which expands into the pinned second section. Small or coarse-pointer devices omit all 3D artwork, and expose an ordinary personal-gallery button. `npm run dev` and `pnpm run dev` are also accepted. After launch, focus moves to main content and scroll starts at zero. Mobile gets the flat welcome browser without the camera zoom; reduced-motion skips these movement sequences.

This is a browser interaction, not an operating-system shell. Commands never invoke a process, execute user code, or access the visitor's computer. The terminal supports an allowlist: `help`, `clear`, `ls`, `ls -la`, `pwd`, `whoami`, `uname`, `uname -a`, and `cat README.md`, in addition to the launch command. Tab completes known command prefixes; arrow keys recall the last command; Ctrl+L clears the output.

The skip button remains available. Direct links with a section hash open the portfolio immediately. Mobile and reduced-motion use a legible flat workspace with the same functional terminal; no WebGL renderer is created for that intro.

## Editor design

`EditorSurface.ts` draws a 1720 × 1080 code-native editor texture: Linux window decoration, menu bar, activity bar, project explorer, open-file tabs, breadcrumbs, line numbers, syntax-highlighted TypeScript, breakpoint, active debug line, variables, watch expressions, call stack, debug toolbar, integrated debug console, and status bar.

Most code is already visible at the first frame. A small portion types progressively; the caret and debug diagnostics change while the scene runs. This is illustrative code and debugger output, not an actual IDE or a claim about a running backend. `EditorPreview.tsx` uses the same painter for the mobile/reduced-motion editor, without importing Three.js.

The terminal uses GNOME-style window controls, menu and tab bars, a bash-style colored prompt, monospace text, styled output, scrollback, keyboard history, and completion. Decorative window menus are not presented as working buttons.

## 3D source and integration

- `assets-source/workstation.blend`: source Blender scene with two monitors and a light keyboard/trackpad accent.
- `public/models/workstation.glb`: mesh exported through Blender Lab MCP.
- `scripts/create-boot-workstation.py`: source generation script, separate from the earlier rigid workstation concept.
- `WorkstationScreens.ts`: live screen textures.
- `SculptureScene.ts`: renderer lifecycle, projected terminal surface, floating motion and camera launch transition.
- `BootIntro.tsx`: browser terminal commands and entry state.

The screen geometry in the exported GLB lies on local XZ, so the CSS3D terminal applies a local rotation before scaling its native 1000 × 700 surface. Logical part matching tolerates Blender's numeric suffixes and glTF name sanitization. Material and geometry remain from Blender; the browser supplies animated screen content and interaction.

The coral code sculpture is now in About, replacing the previous CSS orbit-ring artwork. It loads when About approaches the viewport. Contact details and CV content remain unchanged.

## Power sequence and scrolling cable

The monitors remain off for approximately 650 ms, then show real resource preparation progress. They reveal the workspace after its data/assets are ready or their fallbacks are resolved; progress is no longer a fixed-duration timer. Reduced-motion skips the off/turn-on staging while still waiting for resource preparation. The mobile editor also faces forward. See `PREPARATION.md` for the queue, caches, timeouts and verification.

`scripts/face-workstation-forward.py` updates the Blender intro monitor orientations and camera. The portfolio's previous LAN cable is now replaced by `DataSignal.tsx`: a vertical optical data strand with red/coral light, a leading pulse and section junction nodes. GSAP ScrollTrigger drives its progress and scrolling back reverses it. Its path is remeasured when viewport or page height changes. Reduced-motion users get the complete static strand. The overlay is decorative, hidden from assistive technology, and does not intercept clicks.

## Verification

- TypeScript and production build pass.
- Desktop 1440 px: Blender intro is ready, native terminal is positioned on the second monitor, and input is not under an aria-hidden ancestor.
- `help` prints commands; `pn` + Tab completes to `pnpm dev`; Enter opens the portfolio after the camera transition.
- After launch the intro terminal is removed, focus is on `main`, and the About code sculpture loads correctly.
- Mobile emulation 390 px with reduced motion: rich editor preview and terminal fit without horizontal overflow; no intro WebGL canvas is created.
- An unknown command is handled safely without launching the portfolio.
- `pnpm dev` on mobile/reduced-motion opens the portfolio at scroll position zero, with no 3D canvas.
- No console errors or warnings were found in these checks.
- Desktop boot phases were observed in order: off, booting, on. The front-facing workspace and terminal remain readable without horizontal overflow.
- After `pnpm dev`, cable progress advanced from zero to approximately 0.51 mid-page and reached the Contact connection at the bottom.
- Mobile 390 px with reduced motion opens without WebGL, launches through the terminal, and displays the static complete cable without horizontal overflow.
- Updated welcome transition: desktop browser displays only WELCOME as content, with no iframe. The camera expands the browser before entering the live portfolio.
- Updated mobile 390 px with normal motion: both sculptures remain in poster mode, with zero WebGL canvases, no About model transform and no horizontal overflow. The cable follows its restored vertical route.

The scene chunk is still lazy-loaded and exceeds Vite's 500 KB uncompressed warning threshold. No full Lighthouse audit or physical-phone FPS benchmark is claimed. Changes remain local; hosting and domain were not changed.
