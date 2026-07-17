
**Konteks & asumsi (agent):** Qurbanku = PWA mobile-first (React+Vite, TS, Tailwind, tanpa backend) untuk kalkulator patungan, tabungan, edukasi, dan pengingat qurban Idul Adha. Target user muslim Indonesia yang cari referensi harga + koordinasi patungan, konversi utamanya klik WhatsApp ke satu nomor penjual (`6289619093961`). Semua state di localStorage, ada notifikasi browser, tidak ada auth/DB. Asumsi: nomor WA milik satu penyedia (bukan marketplace), harga hewan hardcoded, dan monetisasi = lead ke WA.

---

## Critical (bug, data loss, security)

**1. [P0 | S] Duplikasi kalkulator Beranda vs Kalkulator page**
`Index.tsx` dan `Kalkulator.tsx` punya state `qurbanku-kalkulator` vs `qurbanku-patungan` terpisah + logika hampir identik. User yang isi di Beranda tidak lihat di /kalkulator dan sebaliknya → data "hilang". Ekstrak ke hook `useQurbanCalculator` + satu storage key.

**2. [P0 | S] `shareToParticipant`/`shareToAll` di Kalkulator.tsx pakai `validParticipants` sebelum dideklarasi**
Baris 82 & 90 mereferensi `validParticipants` yang baru dideklarasi di baris 126 (TDZ). Kalau tombol Share diklik saat belum ada partisipan valid, akan ReferenceError. Pindahkan deklarasi ke atas komponen.

**3. [P0 | S] Data Idul Adha 2025 sudah expired & tahun Hijriah salah**
`getNextIdulAdha` masih list 7 Juni 2025. Sekarang 17 Juli 2026 → tanggal terdekat = 17 Mei 2027 (1448 H) padahal hero Beranda hardcode "1447 H". Fetch tanggal per tahun dari lookup yang sudah dikonversi + derive hijri year dari target aktif, jangan hardcode string.

**4. [P1 | S] `hijriYear = targetDate.getFullYear() - 579` tidak akurat**
Pengingat.tsx baris 22 pakai heuristik yang bisa meleset 1 tahun untuk Idul Adha (bulan Dzulhijjah dekat pergantian tahun Hijriah). Simpan pasangan `{date, hijriYear}` di lookup table qurban-data.

**5. [P1 | S] `checkAndTriggerReminders` hanya jalan on mount → notifikasi terlewat**
Kalau user tidak buka app di hari H-30, notifikasi tidak pernah muncul. Butuh Service Worker + Web Push, atau setidaknya schedule via `showTrigger` Notification API (dengan fallback disclaimer).

**6. [P2 | S] Harga hardcoded → misinformasi**
`animalOptions` hardcode harga (Sapi Limosin 30jt). Kalau harga naik user komplain. Tambahkan field `updatedAt` yang tampil di UI ("harga per Juli 2026") + CTA "konfirmasi harga terbaru via WA".

## UI

**7. [P1 | S] Beranda hero "1447 H" hardcoded** — Ganti ke `getHijriYearFor(targetDate)` supaya sinkron pasca Mei 2027.
**8. [P1 | S] Ikon 4 jenis hewan (Kambing/Domba) mirip di grid 4 kolom** — Beri warna badge berbeda per jenis atau tambahkan foto asli 40px agar mudah dibedakan sekilas di mobile.
**9. [P2 | M] Section Beranda terlalu panjang tanpa progress indicator** — Tambahkan mini TOC sticky (chip: Simulasi · Layanan · Edukasi · FAQ) di bawah hero untuk anchor scroll.
**10. [P2 | S] Card hasil patungan (`summaryRef`) & card simulasi berjauhan** — Saat mode patungan, hasil peserta di bawah setelah "Layanan Kami". Pindahkan segmen ringkasan tepat di bawah kalkulator agar user tidak scroll balik.
**11. [P3 | S] `Progress` di Tabungan tanpa milestone marker** — Tambahkan tick 25/50/75/100% + emoji pencapaian per milestone.

## UX flow

**12. [P0 | S] Reset pilihan hewan saat ganti jenis menghapus daftar peserta patungan**
Handler `onClick` di grid jenis reset `participants` ke `[""]`. User yang sudah input 6 nama untuk sapi lalu iseng klik "Unta" kehilangan semuanya tanpa konfirmasi. Tambahkan `AlertDialog` konfirmasi jika `validParticipants.length > 0`.

**13. [P1 | S] Toggle Mandiri/Patungan reset input jumlah orang** — Simpan state `persons` dan `participants` terpisah supaya switch bolak-balik non-destruktif.

**14. [P1 | M] Tidak ada "urutan" antar peserta patungan (siapa sudah bayar)** — Tambahkan status per peserta: Belum Transfer / Sudah Transfer, disimpan di localStorage, plus badge visual.

**15. [P2 | S] CTA "Pesan via WhatsApp" pakai satu nomor tapi tidak jelas ke siapa** — Tampilkan chip nama penjual + rating/label ("Penyedia rekanan") di dekat tombol agar user tahu ke mana pesan dikirim.

**16. [P2 | M] Alur Tabungan tidak punya log setoran** — Sekarang cuma input angka total "sudah ditabung". Tambahkan mini ledger "+Rp 200.000 · 10 Juli" agar user termotivasi lihat progress harian.

## Fitur core

**17. [P1 | M] Bagi tagihan otomatis dengan link unik per peserta**
Setelah share ke peserta lewat WA, mereka klik link → landing `/patungan/:id` yang tampilkan nama mereka + amount + tombol "Saya sudah transfer". State disimpan lokal + query param (karena tanpa backend, encode di URL base64).

**18. [P1 | S] Kalkulator sedekah/aqiqah alternatif** — Banyak yang bingung beda qurban vs aqiqah. Section terpisah "Aqiqah (2 kambing bayi lk / 1 pr)" dengan kalkulator ringan reuse `animalOptions`.

**19. [P2 | M] Peta lokasi peternak / penyaluran daging** — Menu baru "Cari Peternak Terdekat" pakai list statis (lat/lng) + Leaflet, filter by kota. Konversi ke lead WA per peternak.

**20. [P2 | L] Ustadz Q&A / jadwal kajian Idul Adha** — Section "Kajian Live" embed jadwal YouTube/kajian, satu card per hari 1-10 Dzulhijjah.

**21. [P3 | M] Simulasi "kalau nabung Rp X/hari sekarang, dapat hewan apa di 2027?"** — Reverse calculator: input nominal harian → tampilkan hewan yang muat.

## Onboarding

**22. [P1 | S] Tidak ada penjelasan pertama kali buka**
Hero langsung tampil countdown tanpa konteks "Apa itu Qurbanku". Tambahkan 3-slide onboarding modal (skip-able, disimpan `qurbanku-onboarded=true`): 1) Hitung Patungan 2) Nabung Terarah 3) Pengingat.

**23. [P2 | S] Empty state Tabungan minim** — Jika `selectedAnimal` kosong, tampilkan ilustrasi + copy "Pilih hewan target dulu untuk lihat rencana nabung", bukan cuma form kosong.

**24. [P3 | S] Onboarding lokasi kota** — Minta user pilih kota (Jakarta/Bandung/Surabaya) untuk personalisasi harga & lokasi peternak di masa depan.

## Data

**25. [P0 | S] Tidak ada export/backup data patungan** — User yang re-install PWA/ganti device kehilangan seluruh daftar peserta. Tambahkan tombol Export JSON + Import JSON di footer setiap page yang menyimpan data.

**26. [P1 | S] Multi-key localStorage tanpa versi** — `qurbanku-patungan`, `qurbanku-kalkulator`, `qurbanku-tabungan`, `qurbanku-checklist`, `qurbanku-reminders` berserakan tanpa migration path. Wrap dalam `storage.ts` dengan `version:1` di setiap payload.

**27. [P2 | M] Snapshot patungan sebagai `share link` tanpa server** — Encode participants + animal ID ke `#patungan=base64(json)`; buka link muat state siap kirim.

**28. [P3 | S] Riwayat pesanan lokal** — Simpan tiap kali user klik "Pesan via WhatsApp" → tab "Riwayat" untuk lihat lagi.

## Performance

Kategori kecil karena app sudah lazy-route + prefetch. Ide:

**29. [P2 | S] `html2canvas` (~700KB gzipped) di-import di Beranda & Kalkulator** — Sudah dynamic import, bagus. Tapi bisa diganti ke `dom-to-image-more` (~50KB) atau canvas manual untuk turunkan install size cache SW.

**30. [P3 | S] `framer-motion` dipakai untuk animasi kecil** — Untuk hover/scale sederhana, ganti ke CSS transitions per komponen agar bundle turun; tetap simpan untuk `AnimatePresence` daftar peserta.

## Mobile/responsive

**31. [P1 | S] Grid 4 kolom jenis hewan sesak di 320px** — Di iPhone SE label "Kambing" nyaris terpotong. Set `text-[10px]` di <=360px atau grid-cols-2 dengan card lebih besar.

**32. [P2 | S] Input jumlah tabungan tanpa quick-add** — Tombol +50k / +100k / +500k di sisi input `Sudah Ditabung` untuk logging cepat di mobile.

**33. [P2 | S] Bottom sheet untuk hasil Kalkulator** — Ringkasan patungan lebih natural sebagai bottom sheet Radix `Drawer` yang naik saat animal dipilih, mengurangi scrolling.

## Trust

**34. [P1 | S] Tidak ada info penyedia/legalitas** — Footer/About page kosong soal siapa Qurbanku, alamat kandang, sertifikat halal. Tambah section "Tentang Kami" + logo mitra LSM.

**35. [P1 | S] Tidak ada testimoni pequrban tahun lalu** — Section carousel testimoni (nama, kota, foto hewan) di Beranda antara Layanan & Hadits.

**36. [P2 | M] Tidak ada dokumentasi penyembelihan** — Setelah user pesan, tidak ada janji dokumentasi video/foto. Card "Anda akan menerima foto+video penyembelihan H+1" di dekat CTA.

## Monetisasi/konversi

**37. [P1 | S] CTA Pesan hanya muncul di card Simulasi** — Tambahkan sticky CTA "Chat WA" di bottom nav (FAB terpisah) yang selalu terlihat.

**38. [P1 | S] Pesan WhatsApp tidak track UTM/source** — Prepend `?utm_source=qurbanku&utm_medium=cta&utm_campaign={page}` di query lokal + kirim event ke `plausible`/console untuk instrumentasi mana section paling konvert.

**39. [P2 | M] Upsell add-on** — Setelah pilih hewan tambahkan checkbox "Kirim daging ke pelosok (+Rp 150k)", "Kambing extra kecil (+Rp X)". Update WA message otomatis.

**40. [P2 | S] Cross-sell aqiqah / kurban 1/7 sapi bila budget < harga kambing** — Jika `costPerPerson < 2.500.000`, sarankan "Ikut patungan sapi bareng orang lain" sebagai lead ke waiting list WA.

## Retensi

**41. [P1 | S] Notifikasi lokal hanya seputar H-30/7/3/1** — Tambahkan pengingat harian selama 10 hari Dzulhijjah (puasa Arafah, dilarang cukur kuku) reuse `preparationChecklist`.

**42. [P2 | M] Weekly email/telegram digest** — Karena no-backend, gunakan `Telegram Bot` public: user paste chat id, app kirim reminder via bot HTTP call setiap Sabtu. Opsional.

**43. [P3 | S] Streak menabung** — Kalau user log setoran di Tabungan tiap minggu, tampilkan flame counter untuk gamifikasi.

## Growth

**44. [P1 | S] Share link patungan otomatis ber-preview** — Saat `shareToAll`, tambahkan link `https://qurban-q.lovable.app/?p=<encoded>` yang buka PWA dengan state prefilled → viral loop antar grup WA keluarga.

**45. [P1 | S] Referral counter sederhana** — Tambah `?ref=<userSlug>` yang user isi sekali. Kalau ada N klik terekam via `localStorage` orang lain (tidak reliable) — atau via query, minimal tampilkan badge "Terima kasih sudah bagikan!" saat mendeteksi share event `navigator.share`.

**46. [P2 | M] Blog SEO artikel** — Buat 6 artikel long-form (`/blog/hukum-qurban-perempuan`) memanfaatkan `educationArticles` yang sudah ada, JSON-LD Article. Traffic organik jelang Mei 2027.

**47. [P2 | S] Web Share Target manifest** — Manifest sudah ada; tambahkan `share_target` supaya user bisa share screenshot harga dari galeri → langsung ke Qurbanku.

## Teknis

**48. [P1 | S] Extract `qurban-data` konstan ke JSON + typed loader** — Sekarang `animalOptions` mutable array TS. Pindah ke `data/animals.json` supaya editor konten (bukan dev) bisa edit.

**49. [P1 | S] Test coverage komponen kalkulator nol** — Semua e2e SEO/nav, tidak ada unit test logika `costPerPerson`, `getNextIdulAdha`, dan handler `addParticipant` (case duplicate). Tambah vitest `qurban-data.test.ts` + `Kalkulator.test.tsx`.

**50. [P2 | S] Duplikasi logika Beranda vs Kalkulator (lihat #1)** — Ekstrak `useQurbanCalculator` hook + `<CalculatorPanel/>` komponen.

**51. [P2 | S] `SEO.tsx` tidak set og:image dinamis per rute** — Buat generator OG image lewat `edge?title=` (atau statik per rute) supaya preview WA/Twitter beda per halaman.

**52. [P3 | S] Enable strict TypeScript** — `tsconfig` kemungkinan `strict: false`. Aktifkan `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.

**53. [P3 | S] Service worker offline** — `pwa.ts` sudah ada; verifikasi precaching semua route + fallback offline page Idul Adha countdown.

---

## Top 10 urutan eksekusi

1. **#3** — Refresh data Idul Adha & tahun Hijriah (Beranda salah info).
2. **#2** — Fix TDZ bug `shareToParticipant`/`shareToAll` di Kalkulator.
3. **#1 + #50** — Konsolidasi kalkulator Beranda/Kalkulator via `useQurbanCalculator`.
4. **#12** — Konfirmasi sebelum reset peserta patungan.
5. **#25 + #26** — Export/Import JSON + wrapper `storage.ts` versioned.
6. **#22** — Onboarding 3 slide.
7. **#37 + #38** — Sticky FAB WA + UTM tracking.
8. **#44** — Share link patungan pre-filled untuk viral loop.
9. **#34 + #35** — Halaman "Tentang" + testimoni untuk trust.
10. **#5** — Service Worker push notification jadwal H-30/7/3/1 walau app ditutup.

## 3 ide yang sengaja TIDAK disarankan

- **Login/akun user (Supabase auth)** — Menambah friction besar untuk audience non-teknis, sementara core value (kalkulator + lead WA) bisa selesai lokal. Trade-off: kehilangan sync multi-device dan analitik per-user, tapi tetap bisa via URL-based patungan (#27) tanpa akun.
- **Payment gateway langsung (Midtrans/Xendit) di app** — Menggeser positioning dari referrer/lead-gen ke marketplace, butuh compliance (settlement, refund, sengketa) dan tim ops. Trade-off: konversi lebih tinggi in-app tapi risiko regulasi & maintenance jauh naik; sekarang cukup handoff ke WA penjual.
- **AI chatbot fiqih qurban (LLM)** — Menarik tapi berisiko fatwa keliru untuk audience ibadah + biaya token per-request. Trade-off: kehilangan diferensiasi "interaktif", tapi konten statis `educationArticles` sudah cukup dan bisa diperluas via #46 (blog) yang lebih SEO-friendly.
