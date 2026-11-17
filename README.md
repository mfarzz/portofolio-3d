# Fariz — Developer Portfolio

The current entry is an interactive Linux workspace: type `pnpm dev` in the terminal on the second monitor to enter the portfolio. The first monitor shows a VS Code-inspired editor with source, debugger and live console. See `docs/WORKSPACE-INTRO.md` for commands, implementation and verification. On mobile/reduced-motion the same entry works as a flat, accessible workspace.

Versi baru portofolio Muhammad Fariz dengan model Blender asli, pembuka Three.js, dan animasi GSAP. Tahap 1–4 selesai dan pemeriksaan browser utama sudah dijalankan pada build produksi. Lihat `docs/PHASE-2-4.md` untuk hasil dan batas verifikasi.

## Arah visual

Mengikuti arahan pengguna dari referensi [Anime.js](https://animejs.com/): huruf besar dan tebal, ruang visual luas, sedikit teks, dan satu objek utama. Identitas yang digunakan: Barlow, charcoal, coral, lime, serta patung simbol kode. Tidak memakai font, logo, ilustrasi, atau kode sumber Anime.js.

Tidak ada daftar repository GitHub atau statistik profil. GitHub hanya menjadi tautan biasa pada footer. Konten profesional mengikuti CV MII yang disediakan pengguna; kontak tetap dari versi sebelumnya. Empat proyek terbaru memakai ilustrasi editorial dan delapan proyek lainnya tersedia dalam daftar ringkas. Lihat `docs/CONTENT.md`.

GSAP mengatur koreografi sepanjang halaman: reveal tipografi, parallax karya, pita transisi, orbit tentang, daftar teknologi, pencapaian, timeline, dan kontak. Reduced motion mengembalikan konten statis. Lihat `docs/PAGE-CHOREOGRAPHY.md` untuk rincian serta hasil pengujian.

## Menjalankan

Memerlukan Node.js 22.12+ atau Node.js 24 LTS dan npm.

```powershell
cd 'D:\tes share\portofolio-3d'
npm ci
npm run dev
```

Preview pengembangan: http://127.0.0.1:5174/

```powershell
npm run typecheck
npm run build
npm run preview
```

Build tersedia di `dist/`; preview build memakai port 4174. Konfigurasi base relatif mendukung penempatan pada subdirektori. Tidak ada domain atau deployment produksi yang dikonfigurasi pada tahap ini.

## Struktur

- `src/app/data/portfolio.ts`: profil dan konten proyek/pengalaman.
- `src/app/App.tsx`: susunan halaman.
- `src/components/hero/`: pembuka dan poster sementara.
- `src/components/sections/`: karya, tentang, pengalaman, kontak.
- `src/styles/index.css`: font, token warna, layout, breakpoint, reduced motion.
- `public/images/`: poster SVG dan screenshot proyek.
- `assets-source/concepts/`: konsep workstation awal, disimpan sebagai arsip desain.
- `docs/`: asal aset, keputusan konten, dan hasil verifikasi.

## Pembuka 3D

Konsep `code-sculpture.svg` sudah diwujudkan sebagai sumber Blender `assets-source/code-sculpture.blend`, model GLB, dan poster WebP hasil render. Dependensi sudah tercatat di package.json serta package-lock.json; gunakan `npm ci` untuk instalasi ulang.

Model masuk dengan GSAP, merespons pointer pada desktop, bergerak halus saat idle dan scroll, serta dapat dijeda. Render berhenti ketika hero tidak terlihat atau tab tersembunyi. Reduced motion memakai poster statis tanpa menginisialisasi Three.js. Kegagalan model dan WebGL juga memakai poster.

Font Barlow dimuat dari Google Fonts dengan `display=swap`; Arial menjadi fallback ketika layanan font tidak dapat diakses. Screenshot asli disalin tanpa kompresi tambahan agar tidak mengurangi kualitas sebelum layout disetujui.

Dalam sesi pengembangan ini, dependensi runtime digunakan ulang dari instalasi lokal proyek lama. Definisi tipe React dan paket TypeScript resmi diambil dari registry npm melalui jaringan browser karena jaringan shell terbatas. Lockfile memakai metadata registry; pemeriksaan lockfile offline dan dry-run `npm ci` berhasil. Instalasi bersih penuh dari registry belum dijalankan pada lingkungan ini.

Proyek `../portofolio` dan `../portofolio-pages` tetap terpisah. Halaman Rintas, domain, dan migrasi hosting baru ditangani pada tahap publikasi.
