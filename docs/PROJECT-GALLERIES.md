# Project galleries and finishing

Four featured projects open a native modal dialog from the cover or “Di balik proyek” button. Each contains three clearly marked screenshot placeholders, a short problem/contribution/outcome summary based on the existing CV content, technologies, and available public links. No business metrics, testimonials, or demo URLs have been invented.

## Replace the placeholders

1. Put screenshots in `public/images/projects/<project-id>/`, for example `public/images/projects/rintas/01.webp`.
2. Edit the relevant `gallery` entry in `src/app/data/portfolio.ts` and add `src` and `alt`:

```ts
{ title: 'Tampilan utama', description: 'Workstation berbagi file Rintas.',
  src: 'images/projects/rintas/01.webp',
  alt: 'Jendela utama Rintas dengan daftar file dan pengaturan tautan' }
```

Paths are relative to the public directory and respect Vite's configured base path. Leave `src` absent to retain a placeholder. Missing images fall back to the placeholder. Landscape images around 1600 × 1000 are a useful starting point; original images remain contained without cropping. Images use explicit dimensions, lazy loading and asynchronous decoding.

Before using screenshots, use sample data or redact personal information. Placeholder text and captions can be edited in the same data file. To add a demo or repository, add a verified URL to the project's `links` array. An empty array omits external buttons entirely.

Verified public repositories:

- Rintas: https://github.com/mfarzz/rintas
- MailBlast Workspace: https://github.com/mfarzz/MBW

No confirmed public demo/repository was supplied for Recruitment System or Ally, so their link arrays remain empty.

## CV and social preview

`public/documents/Muhammad-Fariz-CV.pdf` is an unchanged copy of the supplied `CV MII - Muhammad Fariz.pdf`, with identical SHA-256. The About section links to it with a download filename. Site contact details remain unchanged.

`public/images/social-card.svg` is the editable original for the 1200 × 630 PNG social card. Open Graph and Twitter metadata reference `images/social-card.png`. The raster card is provided so sharing services need not render SVG or JavaScript.

This project remains local. When the final deployment URL is confirmed, set absolute `og:image`, `twitter:image`, `og:url` and canonical URLs for that host/base path and verify the published page with sharing debuggers. A live social preview cannot be validated against localhost, and no deployment or DNS change has been made.

## Verification

- Production build and TypeScript checks pass.
- The native dialog limits keyboard focus to its contents; Escape closes it and returns focus to the project trigger. Closing restores body scrolling.
- Gallery arrows, thumbnail selectors and keyboard left/right navigation are supported, including placeholders.
- Mobile dialog layout is single-column, scrolls internally and does not cause horizontal page overflow.
- CV is served as a valid PDF; social PNG is 1200 × 630; local section anchors resolve.
- No new image libraries, carousel dependencies or UI frameworks were added. Placeholder gallery assets use CSS and the existing icon library.
- Existing Three.js is lazy-loaded only on eligible desktop layouts; the pre-existing scene chunk size warning remains. No production Lighthouse score or physical-device benchmark is claimed.
