# Interactive neural workflow

The workstation remains exclusively in the terminal intro. After `pnpm dev`, Hero shows a procedural CNN scene inspired by the supplied `D:/tes share/cnn.png`: image input, convolution, pooling, convolution, pooling, flatten, dense nodes and project outputs. This is an interactive portfolio visualization; no inference request, model upload or visitor-photo processing is performed.

## Scene and scroll

`NeuralExperience.tsx` wraps Hero and the second section. One `NeuralScene.ts` renderer is reused while GSAP ScrollTrigger pins its full-viewport stage beneath the navigation. The scene starts small on the right, centers and expands during the initial scroll, then advances the processing focus. Scrolling back reverses the composition; after the second section the stage is released and normal project scrolling resumes.

Layer groups have visible gaps. Each selected feature patch connects to the next through a four-line receptive-field fan, a center path, direction arrow and traveling particles. Endpoints are recalculated from the animated layer transforms, so connections remain attached during hover and active-layer scaling.

Scroll focus moves through eight stages: input, convolution 01, pooling 01, convolution 02, pooling 02, flatten, network and output. The active layer grows; the other groups shrink and dim. Hover spreads only the picked stack's sheets. The footer names the current layer. The five colored box stacks have transparent, keyboard-accessible hit regions that follow their projected bounds, with chapter tooltips appearing only on hover/focus. There are no extra floating layer buttons. On narrower desktop screens output actions remain in the upper-right margin.

## Interactions

- Each of the five box stacks opens its own activity-photo chapter in `PersonalGallery.tsx`: beginnings, learning, people/collaboration, challenges/experiences, and milestones. Each chapter has five independent placeholders. Cards fan out from the clicked layer into an upward arc. Choosing a card enlarges it centrally and dims the other cards.
- Clicking a red or lime stack opens its gallery directly, rather than merely scrolling the workflow. The underlying raycast callback also carries the stack index and click coordinates, while transparent HTML hit regions provide reliable pointer/keyboard access.
- Rintas and Ally outputs open their existing project dialogs.
- Tangkapin opens its archive row and moves focus to its summary after layout refresh.
- Footer stage buttons scroll to the corresponding phase. Pause stops idle movement while preserving scroll navigation. A skip link leads directly to Projects.
- Native dialogs contain keyboard focus, restore page scrolling and return focus to the trigger. In the activity gallery, Escape first collapses an enlarged photo back into the arc; a second Escape closes the popover. Arrow keys and previous/next buttons navigate photos. Project dialogs retain their single-Escape close behavior. Rendering pauses while a dialog is open.

## Add personal photos

Edit the corresponding chapter in `lifeGalleries` in `src/app/data/neural.ts`. The `personalPhotos` export is now derived from all chapters for resource preparation. Put files in `public/images/personal/<chapter-id>/`. To supply photos, replace that chapter's `photos: placeholders(...)` expression with an explicit array, for example:

```ts
photos: [
  { title: 'Hackathon', caption: 'Eksperimen, ide, dan kolaborasi.',
    src: 'images/personal/experiences/hackathon.webp',
    alt: 'Muhammad Fariz bersama tim saat hackathon' },
  // Add the remaining photos for this chapter here.
]
```

The first photo in the beginnings chapter is also used on the input image plane when available. All current entries are explicit placeholders; no stock photograph is presented as the user's photograph. Portrait or landscape images can be used: the arc uses a portrait crop, while the enlarged view contains the complete photo. Actual image failures fall back to the placeholder. The chapter selector inside the popover makes every gallery available on mobile without a 3D scene.

The popover uses CSS transforms and a short staggered entrance instead of another 3D renderer or gallery dependency. Its entry originates at the input/gallery trigger. Mobile uses the same 2D arc with smaller cards; reduced-motion omits the unfold animation. Both keep access through the ordinary “Beyond the screen” button and do not create any 3D scene.

## Mobile and fallback

The scene is enabled only above 900 px with a fine hover-capable pointer and no reduced-motion preference. Otherwise the whole neural stage and scroll section are omitted, not merely hidden, and no neural chunk/renderer is loaded. Hero exposes a normal “Beyond the screen” button for the gallery. All other 3D artwork is also omitted on small/coarse-pointer devices, including landscape phones. Reduced-motion desktop keeps a readable, unpinned Hero.

If WebGL fails, a lightweight SVG illustration preserves the section and ordinary gallery/project actions. If the scene's dynamic imports fail, the extra scroll section is omitted. Observers, listeners, GSAP context, GPU resources and textures are disposed on unmount or eligibility changes. The render loop stops outside the viewport, when the document is hidden, when paused, or while a dialog is open.

## Red optical data signal

`DataSignal.tsx` and `data-signal.css` replace the previous physical LAN/power cable. A thin translucent strand carries red/coral light and a white-hot leading pulse down the right gutter. Small trailing packets follow the leading pulse, and section junctions illuminate as it passes. Source and final contact node use concentric light points; there is no RJ45 connector or copper-colored sheath. The route stays mostly vertical with small softened bends.

GSAP ScrollTrigger controls the illuminated length, pulse and nodes. Page/viewport height changes remeasure the SVG path. Long paths use layered vector strokes rather than a full-page blur filter; only the small leading pulse has a local blur. Reduced-motion uses the complete static strand without moving packets.

## Verification

- TypeScript and production build pass. The existing lazy Three.js module retains Vite's chunk-size warning; no new dependency was added.
- Desktop: one CNN canvas and one `neural-story` trigger; scroll samples matched all eight active-layer labels.
- Desktop 1024 × 740 and 1877 × 865: floating actions did not overlap the footer. Gallery hover, project dialogs, Pause, and reverse scroll were checked.
- Modal open paused rendering; Escape resumed it. Tangkapin opened and focused the archive, releasing the pinned canvas and stopping its loop.
- Explicit ScrollTrigger refresh preserved the current processing phase; returning to the top restored the readable Hero.
- Mobile 390 × 844: no CNN section, no sculpture, no neural chunk request, no overflow; the personal gallery opened from its ordinary button. Landscape touch 932 × 430 also had no 3D artwork.
- Reduced motion: no pinned scene or extra scroll section. Simulated missing WebGL: SVG fallback and personal gallery remained available.
- Full `pnpm dev` intro flow reached the new Hero with no workstation artwork in Hero, focus on main, and no console warnings/errors.
- Activity arc: five curved cards were visible on desktop and mobile 390 px. Expanding a card, keyboard navigation, two-stage Escape and return focus were verified. At mobile 320 px with reduced motion, both arc and enlarged image fit without horizontal overflow and no 3D renderer was present.
- Per-layer galleries: actual UI clicks on the red and lime hit regions opened different chapters with different photo titles. All five stack mappings were checked in Hero. Mobile's native chapter selector switched to the milestones gallery without unlocking background scroll or creating 3D artwork.
- Data signal: no LAN elements remained; the red strand reached progress 1 with all five section nodes illuminated and the contact endpoint connected. Its light stroke was verified as red (`rgb(255, 79, 72)`). Mobile 320 px with reduced motion had no overflow, no 3D and a static complete strand.

No physical-device FPS benchmark or production Lighthouse score is claimed. Changes remain local.
