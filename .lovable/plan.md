## Tujuan

Mengganti tema gelap generik dengan identitas visual hangat khas Qurbanku: terracotta + sage, tipografi Outfit/Figtree, bentuk rounded organik, dan layout mobile-first yang nyaman untuk pengguna Indonesia.

## Yang akan diubah

### 1. Design system (fondasi)
- `src/index.css`: ganti seluruh token warna HSL untuk light & dark mode ke palet terracotta (#c4654a), peach (#e8a87c), sage (#87a878), forest (#4a6741), background krem (#fdfcfb), surface (#f4f1ed). Primary = terracotta, secondary = sage, accent = peach. Tambah radius lebih besar (rounded-2xl/3xl default) dan shadow lembut hangat.
- `tailwind.config.ts`: import font Outfit (heading) + Figtree (body) via Google Fonts, daftarkan sebagai `font-display` & `font-sans`. Hapus Playfair sebagai default.
- `index.html`: tambahkan preconnect + link Google Fonts Outfit/Figtree, set theme-color ke terracotta.

### 2. Layout & navigasi
- `src/components/Layout.tsx`: header brand baru (logo terracotta rounded-xl, wordmark Outfit hijau forest), background krem, dark-mode toggle jadi pill sage halus.
- `src/components/BottomNav.tsx`: bottom nav floating pill hijau forest dengan tombol tengah "+" terracotta menonjol (link ke /kalkulator) — mengikuti referensi prototipe.

### 3. Halaman Beranda (`src/pages/Index.tsx`)
- Hero countdown: card sage rounded-3xl dengan judul "{N} Hari Menuju Hari Raya Idul Adha 1447 H", chip "Mulai Persiapan Sekarang", aksen lingkaran dekoratif.
- Pemilih hewan: 4 kartu putih border tipis, kartu aktif border terracotta + shadow.
- Kalkulator terintegrasi: card peach lembut (`#fef7f1`) berisi toggle Mandiri/Patungan, jumlah peserta, estimasi biaya besar berwarna terracotta, tombol simpan terracotta. Tetap pakai logika kalkulator existing — hanya restyle.
- Quick actions: 3 kartu putih (Tabungan, Edukasi, Pengingat) dengan ikon bulat berwarna khas masing-masing.

### 4. Halaman lain (konsistensi)
- `Kalkulator.tsx`, `Tabungan.tsx`, `Edukasi.tsx`, `Pengingat.tsx`: ganti aksen warna ke token semantik baru (primary/secondary/accent) — tidak ada perubahan logic, hanya pemakaian kelas warna agar selaras dengan tema baru. Card countdown di Pengingat ikut jadi sage.

### 5. Mobile responsive
- Semua halaman: pertahankan `max-w-lg` container, tambah padding aman untuk bottom nav floating (`pb-32`), pastikan tap target ≥44px, font size mobile-friendly.

## Yang tidak diubah
- Logika kalkulator, tabungan, notifikasi, data qurban.
- Routing & komponen shadcn (cukup re-themed via tokens).
- SEO components.

## Catatan teknis
- Semua warna dimasukkan sebagai HSL di `index.css`, komponen hanya pakai class semantik (`bg-primary`, `text-foreground`, dst). Tidak ada hex hardcoded di JSX.
- Dark mode tetap didukung dengan versi gelap dari palet hangat (background coklat tua, primary terracotta cerah).