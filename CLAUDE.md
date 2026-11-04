# Konteks repo (untuk asisten AI)

- Video **"Satu Molekul, Tiga Tarian" — Kimia Kuantum: Spektroskopi Molekul** (S1 Kimia UNESA, RPS pertemuan 14, penutup seri setelah UTS) milik **Yayan** (Septian Anugrah). Mesin disalin dari `video-simetri-molekul` (syA–syD: molekul 3D, operasi simetri, mode getaran & dipol; vbC 3D). Video ini merangkum video sebelumnya (Partikel dalam Kotak, Sidik Jari Molekul, Gasing Kuantum, Simetri). Aturan umum & pelajaran teknis: repo `septiananugrah-ship-it/science-intro` → `CLAUDE.md`.
- Gaya seri kuantum Yayan: panggung gelap, aksen **emas–sian**, font Outfit + Source Serif 4 + JetBrains Mono, subtitle kata-per-kata. Tanpa nama di video (aturan video kuantum).
- Benang merah cerita: **JWST membaca CO₂ di atmosfer WASP-39b** → empat tangga energi (translasi, rotasi, vibrasi, elektronik) ↔ wilayah spektrum → Boltzmann & aturan seleksi → spektrum rotasi CO, vibrasi-rotasi HCl (P/R), Raman, Franck–Condon, Doppler → alat uji napas, astronomi radio, kembali ke exoplanet.
- **Kode warna**: translasi = abu-biru `C.muted`, rotasi = sian `C.cyan`, vibrasi = jingga `C.amber`, elektronik = ungu `C.violet`, foton/garis spektrum memakai warna panjang gelombangnya (`wlColor`, IR/gelombang mikro di luar tampak = merah tua/sian redup berlabel), populasi Boltzmann = emas `C.gold`, terlarang = merah `C.red`; atom CPK. Molekul 3D berputar/bergetar sesuai fisika (rotasi makin cepat untuk J lebih tinggi, getaran pusat massa tetap).
- Diagram MO: dua kolom orbital atom di kiri/kanan, MO di tengah, garis putus-putus penghubung, elektron sebagai panah ↑↓ yang diisi bergiliran (Aufbau, Pauli, Hund); energi kualitatif (tidak berskala).
- **Semua adegan harus terus bergerak** (elektron di kotak orbital, vektor L/S berpresesi, tabel mikrostatus yang terkelupas, garis spektrum menyala).
- **Claude tidak menjalankan workflow GitHub Actions.** Setelah merge ke `main`, minta pengguna menekan *Run workflow*.
- Narasi menyusul. Selalu sediakan versi tanpa narasi.

## Aturan konten & tata letak
- Rumus/simbol term utama ≥ 56 px (`Formula`), satu kartu per momen; zona subtitle (bawah 180 px) bebas; margin ≥ 80 px. Komponen HTML di luar `<Stage>`.
- Rumus kimia & hibrida ditulis dengan subskrip/superskrip benar (H₂, sp³; `Sup`/`Sub` di HTML, `tspan baselineShift` di SVG). Orbital 3D digambar dengan proyeksi sederhana dan rotasi pelan. Angka dicek di `naskah/AUDIT.md`.
- Teks TTS terpisah dari subtitle (`tts:` per baris; huruf tunggal dieja di `src/tts.ts`).
- Kemulusan: `EASE` lembut, fade keluar `EASE_IN_OUT`; tanpa ganti berdasarkan ambang (silang-pudar); tanpa CSS blur; tanpa filter pada garis lurus.

## QA
- `CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell node scripts/qa-lines.mjs out/x <adegan...>` lalu `python3 scripts/contact.py out/x out/x-s 9`.
- `npm run check` (cek kata `wordOf`), uji kemulusan `node scripts/qa-film.mjs out/a.mp4 0 99999 0.25` lalu `python3 scripts/qa-glitch.py out/a.mp4 0`.
