# Implementasi aset dan pembuka 3D

Tanggal: 17 November 2026.

## Blender MCP dan aset

Blender Lab MCP pada `http://127.0.0.1:9191/` berhasil digunakan untuk membuat scene, mengekspor GLB, menyimpan sumber Blender, dan merender poster. Model dibuat melalui MCP yang aktif pada komputer pengguna; bukan pengganti geometri buatan browser.

Scene `Fariz Portfolio Sculpture` dibuat terpisah. Scene pengguna yang sudah ada tidak dihapus. Ekspor dibatasi pada scene aktif dan objek patung; kamera dan lampu tidak diekspor ke GLB.

- `assets-source/code-sculpture.blend`: sumber model, kamera, material, dan lighting.
- `public/models/code-sculpture.glb`: 153.376 byte, enam mesh, 3.056 triangle, tanpa file eksternal.
- `public/images/code-sculpture-poster.webp`: 33.556 byte, 960 × 960 px, transparan; dirender dengan Cycles, 24 samples dan denoising.
- `scripts/create-sculpture.py`: langkah pembuatan yang dapat dijalankan kembali melalui MCP.
- `scripts/mcp-call.mjs`: transport HTTP lokal untuk menjalankan skrip Blender, tanpa API key atau model LLM tambahan.

Objek model: `LeftBracket`, `RightBracket`, `Slash`, `SatelliteSphere`, `SatelliteCube`, `Orbit`, dan grup `SculptureRoot`. Semua material prosedural; tidak ada tekstur atau aset berbayar.

## Integrasi yang ditulis

- `Sculpture.tsx`: poster, pemuatan modul terpisah, preference reduced motion, dan tombol pause/play.
- `SculptureScene.ts`: GLB loader, kamera orthographic, lighting, material environment, gerak masuk GSAP, tilt pointer, idle, dan ScrollTrigger.
- `useHeroIntro.ts`: gerak teks singkat tanpa menyembunyikan konten atau mengunci navigasi.

Poster tetap tampil selama model dimuat. Kegagalan WebGL, GLB, atau konteks grafis mengembalikan tampilan poster. Reduced motion menghindari inisialisasi renderer 3D. Render loop dilepas saat hero tidak terlihat, tab tersembunyi, atau pengguna menjeda. Listener, request, GSAP context, scene resource, environment, dan renderer dibersihkan saat komponen dilepas.

Kamera browser mengikuti posisi kamera Blender yang sudah dikonversi ke sistem Y-up. Transform untuk intro, scroll, dan tilt memakai grup berbeda agar tidak saling menimpa.

## Status verifikasi

Pembuatan Blender, ekspor GLB, sumber `.blend`, dan render poster berhasil. Header GLB, daftar scene, nama node, jumlah triangle, ukuran, serta tidak adanya URI eksternal diperiksa dari file hasil ekspor. Poster telah dilihat untuk pemeriksaan komposisi.

Dependensi Three.js, GSAP, dan tipe Three.js sudah dipasang oleh pengguna. `npm run build` berhasil, termasuk TypeScript. Kode renderer berada dalam chunk terpisah dari halaman utama.

Pemeriksaan pada build produksi lokal:

- Desktop 1440 px dan mobile emulasi 390 px: model siap, satu canvas, tidak ada overflow horizontal.
- Pause menghentikan draw call; play melanjutkannya.
- Ketika hero keluar viewport, draw call berhenti dan berjalan kembali saat terlihat.
- Simulasi tab tersembunyi menghentikan draw call; saat kembali terlihat render berlanjut.
- Reduced motion: poster tampil, canvas dilepas, dan reload halaman tidak meminta GLB atau chunk scene.
- Simulasi respons GLB HTTP 404: fallback poster, tanpa canvas, CTA tetap tersedia.
- Simulasi kehilangan konteks WebGL: kembali ke poster dan resource dilepas. Cleanup diperbaiki agar tidak mencoba menghilangkan konteks yang sudah hilang.
- Uji ulang kehilangan konteks pada build terakhir: fallback berhasil, tanpa error atau warning console.
- Lebar mobile 320 px: tidak ada overflow horizontal; semua anchor internal memiliki target.

Ukuran build awal: entry JavaScript sekitar 161 KB (gzip 52 KB), GSAP sekitar 70 KB (gzip 28 KB), dan chunk scene sekitar 622 KB (gzip 166 KB). Vite memberikan warning ukuran chunk scene; chunk ini sudah dimuat terpisah dan tidak dibutuhkan untuk membaca atau memakai konten utama. Angka ini tidak termasuk GLB, poster, screenshot, dan font eksternal.

Pengujian FPS pada perangkat mobile fisik serta audit Lighthouse belum dilakukan. Pemeriksaan browser mobile adalah emulasi, bukan bukti performa semua perangkat.

Belum melakukan deployment atau migrasi domain.
