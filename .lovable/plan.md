## Tujuan
Ganti palet "pelangi" (terracotta + peach + sage + warna hangat campur) menjadi identitas brand tunggal: **Forest & Sand** — hijau hutan dalam sebagai warna utama, krem pasir sebagai latar, dan clay/sand sebagai aksen halus. Cocok untuk app qurban: tenang, organik, terpercaya, premium.

## Palet Final

| Token | HSL | Hex | Pakai untuk |
|---|---|---|---|
| `--background` | `40 33% 97%` | `#faf8f5` | Latar utama (krem pasir) |
| `--foreground` | `140 25% 12%` | `#172a1f` | Teks utama (hampir hitam-hijau) |
| `--primary` | `140 38% 17%` | `#1a3c2a` | Brand utama (forest deep) |
| `--secondary` | `140 33% 26%` | `#2d5a3d` | Sekunder (forest mid) |
| `--accent` | `36 30% 70%` | `#c9b99a` | Aksen pasir/clay |
| `--muted` | `40 20% 93%` | `#efece6` | Surface lembut |
| `--forest` | `140 22% 22%` | `#2b4733` | Logo gradient pair |
| `--peach-soft` *(rename in-place, keep class name)* | `36 35% 94%` | `#f1ebe0` | Card lembut → jadi sand-soft |
| `--terracotta-soft` *(rename in-place)* | `40 30% 93%` | `#efeae0` | Highlight halus |
| `--sage-soft` | `140 18% 93%` | `#e8eee8` | Kartu segar hijau muda |
| `--border` / `--input` | `40 18% 88%` | `#e3ddd0` | Garis halus pasir |
| `--ring` | `140 38% 17%` | forest | Focus ring |
| `--wa-green` | tetap `142 70% 35%` | — | Tombol WhatsApp (kontekstual, jangan diubah) |
| `--destructive` | `0 55% 45%` | — | Sedikit lebih kalem |

**Dark mode**: latar `140 18% 7%`, primary jadi sage terang `140 30% 55%`, accent sand `36 25% 60%`. Konsisten dengan vibe forest.

## Yang Diubah

1. **`src/index.css`** — overwrite seluruh blok `:root` dan `.dark` dengan token di atas. `--shadow-warm` dihitung ulang pakai forest hue agar bayangan jadi hijau lembut, bukan oranye.
2. **`index.html`** — `<meta name="theme-color">` dari `#c4654a` → `#1a3c2a`.
3. **`public/manifest.json`** — `theme_color` dari `#c4654a` → `#1a3c2a`. `background_color` disesuaikan ke `#faf8f5` (kalau saat ini cream lama).

## Yang TIDAK Diubah
- Tidak menyentuh komponen `.tsx` apa pun — semua class (`bg-primary`, `bg-peach-soft`, `bg-terracotta-soft`, `text-accent-foreground`, dst.) tetap, hanya nilai tokennya yang berganti. Nama class `peach-soft` / `terracotta-soft` dipertahankan agar tidak rebuild ulang setiap pemakaian — sekarang merepresentasikan nuansa sand/clay.
- `--wa-green` tetap hijau WhatsApp (warna fungsional brand pihak ketiga).
- Tipografi (Fraunces + Figtree + Outfit) tidak berubah.
- Layout, ikon, struktur halaman tidak berubah.

## Hasil Visual
- Logo gradient (`from-primary to-forest`) jadi gradien forest dalam → forest sedang, jauh lebih branded.
- BottomNav pill jadi hijau hutan elegan, bukan terracotta.
- Card kalkulator (`bg-peach-soft`) jadi krem pasir halus.
- Tombol WhatsApp tetap hijau khasnya, kontras enak di latar krem.

## Verifikasi setelah build
- Buka `/`, `/kalkulator`, `/edukasi`, `/pengingat`, `/tabungan` — pastikan semua surface terbaca, kontras AA aman, tidak ada warna oranye nyasar.
- Cek dark mode toggle (kalau ada di app).
- Validasi `theme-color` di tab browser & install prompt PWA jadi hijau hutan.
