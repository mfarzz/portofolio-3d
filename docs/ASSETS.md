# Aset portofolio

## Workstation pembuka terbaru

Hero kini menggunakan scene CNN prosedural dari `NeuralScene.ts`, bukan workstation. Scene mengikuti referensi `cnn.png` milik pengguna dan berbagi satu renderer dengan section workflow kedua. Workstation Blender tetap untuk intro terminal. Detail interaksi, placeholder foto personal, dan jalur fiber optik merah ada di `NEURAL-EXPERIENCE.md`.

`assets-source/workstation.blend` dan `public/models/workstation.glb` dibuat menggunakan Blender Lab MCP melalui `scripts/create-boot-workstation.py`. Model menggunakan dua monitor besar yang melayang, material charcoal hangat, serta aksen coral/lime. Terminal dan editor pada layar adalah surface browser sehingga dapat menampilkan kode, debug, serta input keyboard secara langsung. `EditorSurface.ts` menyediakan desain VS Code/Linux original tanpa screenshot atau data internal.

Patung simbol kode tetap tersedia dan sekarang ditampilkan di About untuk menggantikan orbit ring CSS. Rincian perilaku dan verifikasi terbaru ada di `WORKSPACE-INTRO.md`.

## Aset Blender yang sudah dibuat

Sumber final saat ini: `assets-source/code-sculpture.blend`. Model runtime: `public/models/code-sculpture.glb` (153.376 byte, 3.056 triangle). Poster: `public/images/code-sculpture-poster.webp` (33.556 byte, transparan, 960 × 960 px).

Semua objek dan material dibuat khusus melalui Blender Lab MCP. Tidak menggunakan model eksternal, tekstur berbayar, atau generator 3D berbayar. Lihat `PHASE-2-4.md` untuk rincian proses dan status integrasi.

## Konsep SVG tahap 1

`public/images/code-sculpture.svg` dibuat dari kode SVG untuk proyek ini. Bentuk bracket, slash, kubus, dan bola menggunakan bidang perspektif serta gradient. Tidak menggunakan aset milik Anime.js.

Poster SVG tidak memiliki animasi atau kebutuhan WebGL. Bentuk ini menjadi acuan pembuatan model Blender; versi WebP hasil render kini dipakai sebagai poster utama.

Konsep sebelumnya, `assets-source/concepts/workstation-poster.svg`, disimpan sebagai arsip dan tidak digunakan pada halaman atau build publik.

## Screenshot proyek

Pembaruan CV: screenshot berikut disimpan sebagai arsip, tetapi tidak dipakai lagi pada empat proyek pilihan. Visual terbaru dibuat dalam `src/components/sections/ProjectArtwork.tsx`: empat ilustrasi SVG original untuk Rintas, Recruitment System, Ally, dan MailBlast. Ilustrasi tersebut tidak mengklaim sebagai screenshot produk.

Disalin dari `../portofolio/public/`, tanpa perubahan pada sumber:

- `public/images/projects/portaltpb.png`: 1917 × 992 px; 299.255 byte.
- `public/images/projects/runup.png`: 385 × 872 px; 100.983 byte.
- `public/images/projects/heoc.png`: 1919 × 989 px; 449.063 byte.
- `public/images/projects/excamotion.png`: 1226 × 2559 px; 899.316 byte.

Kepemilikan screenshot mengikuti proyek dan bahan yang sudah disediakan pengguna. Bukan stok berlisensi bebas yang boleh diasumsikan dapat dibagikan ulang secara umum.

Screenshot dimuat secara lazy, dengan area preview berukuran tetap. Untuk screenshot web, preview boleh memotong bagian bawah; screenshot mobile memakai object-fit contain. Optimasi WebP/AVIF dan crop khusus diputuskan setelah arah visual disetujui.

## Font dan ikon

- Barlow melalui Google Fonts: https://fonts.google.com/specimen/Barlow — SIL Open Font License. Tidak menggunakan font DIN milik referensi.
- Ikon panah, menu, dan close dari lucide-react — ISC: https://lucide.dev/license.
- Favicon dibuat dari kode SVG untuk proyek ini.

Belum memakai model, tekstur, HDRI, atau layanan generasi 3D eksternal.
