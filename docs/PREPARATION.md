# Preparing the portfolio during monitor boot

The root intro now starts a shared preparation run in `src/app/preparation.ts`. Monitor progress is based on completed resource tasks instead of a fixed progress timer. The short off/turn-on staging is retained, but the terminal is only revealed after preparation completes. `pnpm dev` and “Lewati intro” both await the same run; skipping omits the cinematic transition without bypassing resource readiness.

## Prepared resources

- Portfolio text/data is already included in the app bundle.
- Barlow weights used by the page are requested through the Font Loading API.
- GitHub contribution data is fetched and validated before entry.
- Motion modules are imported for layouts that use motion.
- Eligible desktop devices preload the CNN and sculpture modules, About model bytes, its fallback poster, and the CNN fallback image.
- Configured project screenshots and personal photos are preloaded and decoded. Existing placeholder-only entries cause no image request.
- Mobile/coarse-pointer devices never prepare Three.js, GLB models or CNN assets. Reduced-motion desktop only prepares its static About poster.

Downloads such as the CV and outbound repository pages are not fetched during boot. Renderer creation, shader initialization and DOM mounting still happen when the corresponding scene is used; this is preparation of data/assets, not a claim of zero runtime rendering cost.

Preparation uses three concurrent workers. Individual tasks have a timeout of at most 12 seconds, within a 15-second overall preparation budget. Progress reflects settled tasks. If a task fails or times out, the final state is explicitly `fallback` and the terminal reports unavailable GitHub data or fallback visuals. Thus 100% means preparation has finished, including handling failures; it does not falsely claim that a failed external service returned data.

## Shared caches

`src/app/data/githubActivity.ts` owns validation, one-hour memory/session caches and one in-flight request. Intro and calendar use this same service, including React StrictMode. An intro failure is remembered for the current visit: About shows its retry state rather than silently making a second request. The explicit Retry action can request the service again.

`src/app/assetCache.ts` caches model bytes for the visit and decoded images. `SculptureScene.ts` uses the same model-byte cache as preparation, so loading About does not download its model again. Renderers still dispose their own geometry, textures and contexts; cached GLB bytes are independent of GPU resources.

Direct section links continue to bypass the intro. Their components use the same data/cache loaders as needed. Eligibility changes select the matching preparation run, and gallery configuration is read from the existing data files.

## Verification

- With GitHub artificially delayed, desktop boot stayed at 7/8 resources (88%), showed “github / daily activity”, and kept terminal input disabled.
- Once the delayed response completed, state changed to 8/8 ready and the terminal unlocked.
- Entering with `pnpm dev` reached the ready CNN Hero. Scrolling to the calendar and About model kept GitHub and About-model request counts at one each.
- A simulated GitHub failure completed as `fallback`, reported the issue in the terminal and showed About's retry state. Retry restored the real calendar.
- Mobile prep used three tasks, requested no GLB models and loaded no Three.js or neural chunks. Clicking Skip while GitHub was gated showed “Menyiapkan…” and retained the intro until that response was released.
- No page overflow or console errors/warnings occurred during normal checks. No measured Lighthouse/FPS improvement is claimed; the verified improvement is reuse of preloaded data and removal of late duplicate requests.
