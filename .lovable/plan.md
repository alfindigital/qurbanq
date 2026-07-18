Asumsi: app ini kalkulator + tabungan qurban personal (target muslim Indonesia, Jabodetabek-first), tanpa akun/backend transaksional — data lokal di localStorage, konversi via WhatsApp ke penyedia rekanan. Belum ada analytics event granular, belum ada auth/cloud sync.

## Critical (bug, data loss, security)
1. **Migrasi share-state versi lama** [P0 | S] — link share `patungan:boolean` lama masih beredar; `decodeCalcState` sekarang expect `persons`. Tambah fallback `patungan===true ? animal.maxPersons : 1` di `share-state.ts` supaya link lama tidak crash / salah hitung.
2. **Backup localStorage sebelum overwrite restore** [P0 | S] — di sistem backup/restore JSON, tulis snapshot `__backup_prev` sebelum apply supaya user bisa undo kalau salah file.
3. **Guard `JSON.parse` semua storage read** [P0 | S] — `storage.ts`, `order-history.ts`, `streak.ts` — bungkus try/catch + schema check zod-light; corrupt entry sekarang bikin white screen di Tabungan.
4. **Sanitasi input WA message** [P1 | S] — nama peserta di-encode ke `encodeURIComponent` tapi cek juga strip newline/`\r` untuk hindari WA link truncation.
5. **Race di ScrollToTop + anchor hash** [P1 | S] — `ScrollToTop.tsx` scroll ke 0 juga saat ada `#hash`, memblokir deep-link ke FAQ; skip kalau `hash` non-empty.
6. **Reset streak saat clock skew** [P2 | S] — `streak.ts` pakai `Date.now()` lokal; user ubah timezone bisa hilangkan streak. Simpan `lastDateISO` (yyyy-mm-dd zona Asia/Jakarta) bukan timestamp.

## UI
7. **Konsistensi radius & shadow token** [P1 | S] — beberapa card di `Index.tsx` masih `rounded-2xl` hardcoded, sedangkan sistem pakai `--radius`. Ganti ke `rounded-[var(--radius)]` atau util `rounded-card`.
8. **Empty state Tabungan** [P1 | S] — saat belum ada setoran, halaman kosong; tambah ilustrasi + CTA "Setor pertama".
9. **Skeleton loader carousel testimoni** [P2 | S] — `TestimonialSection` flash saat mount; tambah placeholder 3 kartu.
10. **Divider antar section Index terlalu tipis** [P3 | S] — di dark mode hampir invisible; naikkan opacity border-muted 20→35%.

## UX flow
11. **Sticky ringkasan hasil kalkulator** [P1 | M] — hasil "Total per orang" saat scroll ke bawah hilang; jadikan bar sticky di bawah header (di atas BottomNav) selama scroll di section peserta.
12. **Quick preset peserta (1 / 3 / 7)** [P1 | S] — chip cepat di atas input jumlah peserta hemat 2 tap.
13. **Konfirmasi sebelum ganti hewan** [P2 | S] — ganti hewan sekarang reset peserta diam-diam; tampilkan toast "Data peserta dipertahankan sampai limit baru".
14. **Deep-link ke section Edukasi** [P2 | S] — FAQ item terbuka via `?faq=slug`, memudahkan share jawaban spesifik.
15. **Progress indikator wizard onboarding** [P3 | S] — `OnboardingModal` sekarang tanpa dots; tambah step counter 1/3.

## Fitur core
16. **Kalkulator cicilan mingguan/bulanan** [P1 | M] — di Kalkulator, tampilkan "Rp X/minggu sampai Dzulhijjah" berdasarkan tanggal Idul Adha berikutnya di `qurban-data.ts`.
17. **Split biaya operasional (potong+kirim)** [P1 | S] — checkbox opsional +Rp 150k/ekor untuk biaya potong, tampil transparan di ringkasan.
18. **Perbandingan hewan side-by-side** [P2 | M] — pilih 2-3 hewan → tabel harga/orang, bobot, jatah daging.
19. **Kalkulator jatah daging (kg per mustahik)** [P2 | S] — pakai bobot karkas ±55% dari bobot hidup, bagi ke porsi 1/3.
20. **Multi-tahun perencanaan** [P3 | M] — target 2026, 2027, 2028 dengan asumsi inflasi 8%/th.

## Onboarding
21. **Skip + jangan tampilkan lagi** [P1 | S] — `OnboardingModal` selalu tampil sampai selesai; tambah "Nanti saja" yang set flag 7 hari.
22. **Onboarding kontekstual di Tabungan** [P2 | S] — first-visit Tabungan tampil coach-mark 2 langkah (set target, setor pertama) via popover shadcn.

## Data (persistence, export, backup)
23. **Namespaced storage version** [P1 | S] — prefix `qbk:v2:` di semua key + migrasi otomatis dari `v1`; mempermudah breaking change ke depan.
24. **Auto-backup mingguan ke IndexedDB** [P2 | M] — snapshot JSON ke IDB tiap Jumat, keep 4 terakhir; localStorage rentan hilang saat clear cache.
25. **Export PDF ringkasan kalkulator** [P2 | M] — via `jspdf` client-side, sertakan JSON-LD data + QR share link.
26. **Import dari WhatsApp text** [P3 | L] — paste pesan lama → parse regex → rekonstruksi peserta. Effort besar, low usage.

## Performance
27. **Code-split halaman berat** [P1 | S] — `Kalkulator`, `Tabungan`, `Edukasi` via `React.lazy`; bundle awal turun ~30%.
28. **Prefetch route saat hover BottomNav** [P2 | S] — mouse/touchstart di `NavLink` trigger `import()` route.
29. **Ganti recharts→uPlot di Tabungan** [P3 | M] — bila ada chart streak, recharts +80kb. Skip kalau belum pakai chart.

## Mobile/responsive
30. **Haptic feedback tombol +/- peserta** [P1 | S] — `navigator.vibrate(10)` saat tambah/kurang di iOS Safari (silent) & Android (aktif).
31. **Keyboard aware sticky bar** [P1 | S] — sticky ringkasan (#11) sembunyikan saat `visualViewport.height` menyusut (keyboard buka).
32. **BottomNav auto-hide saat scroll ke bawah** [P2 | S] — beri ruang konten di layar kecil; muncul lagi saat scroll up.
33. **Landscape phone: hero terlalu tinggi** [P3 | S] — max-height 100dvh dengan padding scale.

## Trust
34. **Sumber harga tercantum inline** [P1 | S] — tooltip "i" di list hewan → "Update Nov 2026 dari Kompas, Dompet Dhuafa, dombagarut.id" — sudah diverifikasi, tinggal exposed ke user.
35. **Testimoni dengan foto+lokasi verified** [P2 | M] — sekarang generik; tambah handle & tanggal.
36. **Halaman "Tentang & Metodologi"** [P2 | S] — jelaskan rumus, sumber, disclaimer non-transaksional.

## Monetisasi / konversi
37. **CTA WA dengan pre-filled paket rekomendasi** [P1 | S] — pesan WA sekarang generik; sertakan link balik ke share-URL kalkulator untuk penyedia verifikasi.
38. **A/B copy tombol "Pesan via WhatsApp" vs "Konsultasi hewan"** [P2 | S] — track via UTM di link WA.
39. **Affiliate slot penyedia per region** [P2 | M] — dropdown "Kirim ke: Jabodetabek / Bandung / Surabaya" → nomor WA berbeda.
40. **Lead capture opsional (nama+WA) sebelum share** [P3 | S] — beri "kirim ringkasan ke WA saya"; risiko friction.

## Retensi
41. **Reminder H-30/H-7/H-1 Idul Adha** [P1 | M] — extend `notifications.ts` + `Pengingat.tsx` supaya register 3 notif otomatis saat user set target.
42. **Streak weekly recap card** [P2 | S] — kartu "Minggu ini kamu setor Rp X, streak 4 minggu" di Beranda.
43. **PWA install prompt yang timing-aware** [P2 | S] — trigger setelah user selesai kalkulasi 1x + kunjungan ke-2, bukan langsung.

## Growth
44. **OG image dinamis per share-URL** [P1 | M] — edge function generate PNG "Qurban Sapi untuk 7 orang @ Rp 3.7jt/org" pakai satori; naikkan CTR share WA.
45. **Referral: share link + tag pengundang** [P2 | S] — param `?ref=` disimpan, ditampilkan "Diundang oleh Ahmad" di onboarding.
46. **Halaman kota: /qurban/jakarta, /qurban/bandung** [P2 | L] — SEO long-tail; effort konten besar.
47. **Sitemap ping otomatis via GitHub Action** [P3 | S] — sudah ada sitemap.xml; ping Google/Bing saat deploy.

## Teknis
48. **Zod schema semua storage payload** [P1 | S] — schema tunggal di `storage.ts`, dipakai semua modul; hindarkan drift antar versi.
49. **Feature flag ringan via localStorage** [P2 | S] — helper `useFlag('newSticky')` untuk rollout gradual A/B.
50. **Error boundary per-route** [P2 | S] — sekarang error di Kalkulator crash seluruh app; wrap tiap `<Route>` dengan boundary + fallback.
51. **CI: lighthouse budget check** [P3 | M] — GH Action gagal kalau perf < 90 atau bundle > 250kb.

---

## Top 10 urutan eksekusi lintas kategori
1. #1 Migrasi share-state versi lama (P0/S)
2. #3 Guard JSON.parse semua storage (P0/S)
3. #2 Backup sebelum restore (P0/S)
4. #48 Zod schema storage (P1/S) — pondasi #23
5. #23 Namespaced storage version (P1/S)
6. #27 Code-split route (P1/S)
7. #11 Sticky ringkasan kalkulator (P1/M)
8. #16 Kalkulator cicilan mingguan (P1/M)
9. #41 Reminder H-30/H-7/H-1 (P1/M)
10. #44 OG image dinamis (P1/M)

## 3 ide sengaja tidak disarankan
- **Auth + cloud sync akun**: user eksplisit menolak backend transaksional; localStorage cukup untuk use-case saat ini. Trade-off: kalau device hilang, data hilang — mitigasi dengan #24 (auto-backup IDB) + export JSON existing.
- **In-app payment / escrow qurban**: butuh legal, PSE, KYC penyedia; scope creep besar dan mengubah brand jadi marketplace. Trade-off: konversi via WA lebih rendah tapi menjaga fokus.
- **AI chatbot konsultasi fiqih**: risiko fatwa salah + biaya token; #16 (referensi kajian ustadz Sunnah) sudah menyediakan sumber otoritatif. Trade-off: kehilangan engagement Q&A instan.
