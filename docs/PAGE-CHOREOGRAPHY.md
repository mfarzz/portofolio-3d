# Koreografi seluruh halaman

Tanggal: 17 November 2026. Implementasi: `src/components/motion/usePageChoreography.ts` dan `src/styles/choreography.css`.

## Alur gerak

1. **Hero:** model Blender/Three.js dan intro GSAP yang sudah ada, dengan fokus web dan desktop sesuai CV.
2. **Proyek:** reveal judul per baris; empat visual editorial masuk bergantian dengan tilt ringan pada desktop; parallax pada lapisan artwork yang terpisah dari hover CSS.
3. **Eksplorasi:** delapan proyek tambahan masuk saat scroll, dengan detail yang dapat dibuka melalui mouse maupun keyboard.
4. **Transisi:** pita BUILD / TEST / SHIP / REPEAT bergerak mengikuti scroll untuk menghubungkan proyek dengan bagian tentang.
5. **Tentang:** reveal tipografi, orbit geometris, daftar teknologi yang bergerak melintasi viewport, serta reveal dua pencapaian.
6. **Pengalaman:** progres garis timeline mengikuti scroll; tiga pengalaman kerja masuk bertahap. Pelatihan, sertifikasi, dan organisasi tersedia dalam details.
7. **Kontak:** judul dan panah masuk, kontur lingkaran bergerak saat scroll, lalu email muncul. Teks dan tujuan tautan tetap sama.
8. **Keseluruhan:** indikator progres tipis di bagian atas; tidak ada scroll hijacking, intro yang memblokir halaman, atau section yang dipaksa pinned.

## Lifecycle dan aksesibilitas

GSAP dimuat secara dinamis dan hanya diinisialisasi setelah motion diizinkan. `gsap.matchMedia` menangani breakpoint dan reduced motion; context serta listener dibersihkan ketika konfigurasi berubah atau komponen dilepas. Layout details memicu penghitungan ulang ScrollTrigger agar titik animasi section setelahnya tetap benar.

Teks tetap berupa heading HTML; tidak dipecah menjadi karakter yang mengganggu pembaca layar. Transform reveal diterapkan pada wrapper, bukan lapisan hover. Reduced motion menampilkan konten statis, menghentikan koreografi, dan membuat seluruh teknologi tersusun wrap agar tidak terpotong.

## Verifikasi

- `npm run build` berhasil, termasuk TypeScript.
- Build produksi diperiksa melalui preview lokal pada port 4174.
- Sebanyak 41 ScrollTrigger aktif sebelum animasi sekali-jalan selesai; pemicu ada pada seluruh section, bukan hanya hero.
- Orbit berubah saat scroll; judul proyek berakhir pada transform identitas dan progres timeline berubah mengikuti posisi scroll.
- Detail NeoCentral menampilkan fakta dari CV; detail Rintas dapat dibuka dengan Enter.
- Empat proyek pilihan, delapan proyek tambahan, tiga pengalaman, dan lima entri kualifikasi tersedia.
- Email dan tujuan tautan GitHub/LinkedIn sama seperti sebelum perubahan.
- Desktop 1440 px serta mobile emulasi 390 dan 320 px tidak memiliki overflow horizontal.
- Lebar 320 px, termasuk ketika kualifikasi dibuka: tidak ada teks heading/kontak yang terpotong.
- Saat reduced motion aktif: nol ScrollTrigger aktif, seluruh mask heading direset, tidak ada canvas 3D, dan seluruh teknologi dapat terlihat.
- Tidak ditemukan error atau warning console pada pemeriksaan browser.

Pengujian ini bukan audit Lighthouse atau pengukuran FPS di perangkat mobile fisik. Deployment dan migrasi domain belum dilakukan.
