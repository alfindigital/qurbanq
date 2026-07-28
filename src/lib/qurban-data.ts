export const WHATSAPP_NUMBER = "6289619093961";

export type AnimalType = "sapi" | "kambing" | "domba" | "unta";

export interface Supplier {
  id: string;
  name: string;
  location: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  dpKambing: number;
  dpSapi: number;
  deliveryAreas: string;
  deliveryNote: string;
}

// Supplier utama Qurbanku. Tambah supplier lain di sini seiring waktu.
export const suppliers: Supplier[] = [
  {
    id: "rabbanian-farm",
    name: "Rabbanian Farm",
    location: "Dramaga, Bogor",
    bankName: "Bank Syariah Indonesia (BSI)",
    bankAccount: "7305813715",
    bankHolder: "PT Rabbanian Berkah Utama",
    dpKambing: 1000000,
    dpSapi: 5000000,
    deliveryAreas: "Bogor Raya H-1, Jabodetabek H-2 Idul Adha",
    deliveryNote: "Domba/kambing khusus Jabodetabek. Sapi Jabodetabek, luar daerah by request.",
  },
];

export interface AnimalOption {
  id: string;
  type: AnimalType;
  label: string;
  weight: string;
  price: number;
  maxPersons: number;
  description: string;
  supplier?: string;
}

// Acuan harga: katalog Rabbanian Farm (2026) sebagai supplier utama.
// Nilai bisa berbeda antar supplier & wilayah. Cek metodologi di /metodologi.
export const animalOptions: AnimalOption[] = [
  { id: "kambing-bronze", type: "kambing", label: "Kambing Jawa Bronze", weight: "21-25 kg", price: 2700000, maxPersons: 1, description: "Kambing jantan pilihan, memenuhi syarat", supplier: "rabbanian-farm" },
  { id: "kambing-silver", type: "kambing", label: "Kambing Jawa Silver", weight: "26-30 kg", price: 3200000, maxPersons: 1, description: "Bobot ideal, sehat & cukup umur", supplier: "rabbanian-farm" },
  { id: "kambing-gold", type: "kambing", label: "Kambing Jawa Gold", weight: "31-35 kg", price: 3700000, maxPersons: 1, description: "Karkas tebal, populer untuk qurban", supplier: "rabbanian-farm" },
  { id: "kambing-platinum", type: "kambing", label: "Kambing Jawa Platinum", weight: "36-40 kg", price: 4200000, maxPersons: 1, description: "Kelas premium, bobot maksimal", supplier: "rabbanian-farm" },
  { id: "domba-bronze", type: "domba", label: "Domba Tanduk Bronze", weight: "21-25 kg", price: 2600000, maxPersons: 1, description: "Domba tanduk jantan pilihan", supplier: "rabbanian-farm" },
  { id: "domba-silver", type: "domba", label: "Domba Tanduk Silver", weight: "26-30 kg", price: 3100000, maxPersons: 1, description: "Bobot ideal, sehat", supplier: "rabbanian-farm" },
  { id: "domba-gold", type: "domba", label: "Domba Tanduk Gold", weight: "31-35 kg", price: 3600000, maxPersons: 1, description: "Karkas tebal, tanduk kokoh", supplier: "rabbanian-farm" },
  { id: "domba-platinum", type: "domba", label: "Domba Tanduk Platinum", weight: "36-40 kg", price: 4100000, maxPersons: 1, description: "Kelas premium, bobot maksimal", supplier: "rabbanian-farm" },
  { id: "sapi-a", type: "sapi", label: "Sapi Bima Type A", weight: "230-250 kg", price: 18750000, maxPersons: 7, description: "Sapi Bima siap qurban, terverifikasi dinas", supplier: "rabbanian-farm" },
  { id: "sapi-b", type: "sapi", label: "Sapi Bima Type B", weight: "270-300 kg", price: 22250000, maxPersons: 7, description: "Sapi Bima bobot menengah", supplier: "rabbanian-farm" },
  { id: "sapi-c", type: "sapi", label: "Sapi Bima Type C", weight: "305-335 kg", price: 25200000, maxPersons: 7, description: "Sapi Bima bobot besar", supplier: "rabbanian-farm" },
  { id: "sapi-d", type: "sapi", label: "Sapi Bima Type D", weight: "335-350 kg", price: 25750000, maxPersons: 7, description: "Sapi Bima daging berkualitas", supplier: "rabbanian-farm" },
  { id: "sapi-e", type: "sapi", label: "Sapi Bima Type E", weight: "350-375 kg", price: 27200000, maxPersons: 7, description: "Sapi Bima kelas atas", supplier: "rabbanian-farm" },
  { id: "sapi-super", type: "sapi", label: "Sapi Bima Super", weight: "380-400 kg", price: 28750000, maxPersons: 7, description: "Sapi Bima super premium", supplier: "rabbanian-farm" },
  { id: "unta-a", type: "unta", label: "Unta Standar", weight: "300-400 kg", price: 48000000, maxPersons: 7, description: "Unta qurban impor, lengkap surat" },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};

// `source` di-embed sebagai baris footer supaya kita bisa lacak section mana
// yang paling banyak convert ke WhatsApp (analog UTM, karena wa.me tidak
// mendukung query param tambahan).
export const generateWhatsAppLink = (message: string, source?: string): string => {
  // Normalize control chars & CRLF supaya wa.me tidak truncate pesan
  const clean = message.replace(/\r/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  const suffix = source ? `\n\n_(via qurbanku • ${source})_` : "";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(clean + suffix)}`;
};

// Perkiraan tanggal Idul Adha (10 Dzulhijjah) beserta tahun Hijriah-nya.
// Dijaga sinkron: kalau tanggal Masehi lewat, tahun Hijriah di UI ikut update.
const IDUL_ADHA_SCHEDULE: { date: Date; hijriYear: number }[] = [
  { date: new Date(2025, 5, 7), hijriYear: 1446 },
  { date: new Date(2026, 4, 27), hijriYear: 1447 },
  { date: new Date(2027, 4, 17), hijriYear: 1448 },
  { date: new Date(2028, 4, 5), hijriYear: 1449 },
  { date: new Date(2029, 3, 24), hijriYear: 1450 },
  { date: new Date(2030, 3, 14), hijriYear: 1451 },
];

// Hari raya masih "berlaku" sepanjang tanggal 10 Dzulhijjah (H+0).
// Baru setelah hari itu berakhir, target pindah ke tahun berikutnya.
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

// Di luar jadwal (setelah 2030): kalender Hijriah ± 11 hari lebih cepat
// dari kalender Masehi, jadi tanggal berikutnya = tanggal terakhir + 354 hari.
const HIJRI_YEAR_DAYS = 365 - 11;

export const getNextIdulAdhaInfo = (): { date: Date; hijriYear: number } => {
  const now = new Date();
  const scheduled = IDUL_ADHA_SCHEDULE.find((d) => now <= endOfDay(d.date));
  if (scheduled) return scheduled;

  let { date, hijriYear } = IDUL_ADHA_SCHEDULE[IDUL_ADHA_SCHEDULE.length - 1];
  // Guard: maksimal 50 iterasi supaya tidak pernah infinite loop.
  for (let i = 0; i < 50 && now > endOfDay(date); i++) {
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + HIJRI_YEAR_DAYS);
    hijriYear += 1;
  }
  return { date, hijriYear };
};

export const getNextIdulAdha = (): Date => getNextIdulAdhaInfo().date;

// Sisa hari kalender menuju Idul Adha. H-1 = 1, hari-H (H+0) = 0.
export const getDaysUntilIdulAdha = (): number => {
  const now = new Date();
  const target = getNextIdulAdha();
  const startNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.max(0, Math.round((startTarget - startNow) / (1000 * 60 * 60 * 24)));
};



export const educationArticles = [
  {
    id: "hukum-qurban",
    title: "Hukum & Syarat Qurban",
    icon: "Scale",
    content: `Qurban (udhiyah) hukumnya sunnah muakkadah menurut jumhur ulama (Malik, Syafi'i, Ahmad), dan wajib bagi yang mampu menurut Imam Abu Hanifah.\n\nDalil pensyariatan: firman Allah "Maka dirikanlah shalat karena Rabbmu dan berqurbanlah" (QS Al-Kautsar: 2), dan hadits Anas bin Malik bahwa Nabi shallallahu 'alaihi wa sallam berqurban dengan dua domba yang gemuk lagi bertanduk (HR. Bukhari & Muslim).\n\nSyarat Umur Hewan (musinnah):\n- Unta minimal 5 tahun (masuk tahun ke-6)\n- Sapi/kerbau minimal 2 tahun (masuk tahun ke-3)\n- Kambing minimal 1 tahun (masuk tahun ke-2)\n- Domba minimal 6 bulan jika sudah gemuk/besar menyerupai domba setahun (jadza'ah)\n\nEmpat Cacat yang Menghalangi Sah Qurban (hadits Al-Bara' bin 'Azib, HR. Abu Dawud, Tirmidzi, An-Nasa'i — shahih):\n1. Buta sebelah yang jelas butanya\n2. Sakit yang jelas sakitnya\n3. Pincang yang jelas pincangnya\n4. Sangat kurus sehingga tidak bersumsum\n\nSyarat Orang yang Berqurban:\n- Muslim\n- Mampu secara finansial (memiliki kelebihan dari kebutuhan pokok)\n- Merdeka\n\nWaktu Penyembelihan:\nDimulai setelah shalat Idul Adha pada 10 Dzulhijjah, hingga terbenam matahari pada 13 Dzulhijjah — total 4 hari (pendapat Syaikhul Islam Ibnu Taimiyah, Syaikh Bin Baz, dan Syaikh Utsaimin, berdasar hadits Jubair bin Muth'im "Seluruh hari tasyriq adalah waktu menyembelih").`,
  },
  {
    id: "tata-cara",
    title: "Tata Cara Penyembelihan",
    icon: "BookOpen",
    content: `Adab Penyembelihan Sesuai Sunnah:\n\n1. Menghadapkan hewan ke arah kiblat, dibaringkan di sisi kirinya.\n2. Menajamkan pisau sebelum menyembelih dan tidak menajamkan di hadapan hewan (HR. Muslim dari Syaddad bin Aus: "Sesungguhnya Allah mewajibkan berbuat ihsan atas segala sesuatu…").\n3. Tidak menyembelih hewan di depan hewan lain.\n4. Membaca lafazh yang diajarkan Nabi shallallahu 'alaihi wa sallam ketika menyembelih dua domba:\n   "Bismillah, Allahu Akbar, Allahumma hadza minka wa laka, hadza 'anni (atau: 'an fulan)"\n   Artinya: "Dengan nama Allah, Allah Maha Besar. Ya Allah, ini dari-Mu dan untuk-Mu, ini dariku (atau: dari fulan)." (HR. Muslim, Abu Dawud)\n5. Menyembelih dengan sekali gerakan yang memutus hulqum (saluran nafas), mari' (saluran makanan), dan dua wadajain (dua urat leher).\n6. Membiarkan hewan tenang hingga benar-benar mati sebelum dikuliti atau dipotong.\n\nDianjurkan menyembelih sendiri bila mampu — sebagaimana Nabi shallallahu 'alaihi wa sallam menyembelih qurbannya dengan tangan beliau sendiri (HR. Bukhari & Muslim). Jika diwakilkan, disunnahkan menyaksikannya.`,
  },
  {
    id: "pembagian-daging",
    title: "Pembagian Daging Qurban",
    icon: "Users",
    content: `Panduan Pembagian:\n\nAllah berfirman: "Maka makanlah sebagiannya dan berilah makan orang yang sengsara lagi fakir" (QS Al-Hajj: 28), dan: "Makanlah sebagiannya dan berilah makan orang yang merasa cukup dengan apa yang ada padanya (yang tidak meminta) dan orang yang meminta" (QS Al-Hajj: 36).\n\nMayoritas ulama menganjurkan pembagian menjadi tiga:\n1. Sepertiga untuk dimakan pequrban dan keluarganya\n2. Sepertiga disedekahkan kepada fakir miskin\n3. Sepertiga dihadiahkan kepada tetangga dan kerabat\n\nPembagian ini bersifat anjuran, bukan wajib. Boleh mengubah porsi selama pequrban tetap makan sebagian (mengikuti sunnah Nabi shallallahu 'alaihi wa sallam) dan menyedekahkan sebagian.\n\nKetentuan Penting:\n- Haram menjual daging, kulit, atau bagian apa pun dari hewan qurban (HR. Al-Hakim, Al-Baihaqi).\n- Tukang jagal tidak boleh diberi upah dari hewan qurban itu sendiri; upah dibayar dari uang tersendiri (HR. Bukhari & Muslim dari Ali bin Abi Thalib).\n- Kulit boleh disedekahkan atau dimanfaatkan sendiri, tidak boleh diperjualbelikan.\n- Daging boleh disimpan lebih dari 3 hari — Nabi shallallahu 'alaihi wa sallam pernah melarang karena kondisi paceklik, kemudian membolehkannya (HR. Muslim).`,
  },
  {
    id: "keutamaan",
    title: "Keutamaan Berqurban",
    icon: "Star",
    content: `Keutamaan Berdasarkan Dalil yang Kuat:\n\n1. Perintah langsung dari Allah — "Maka dirikanlah shalat karena Rabbmu dan berqurbanlah" (QS Al-Kautsar: 2).\n\n2. Menghidupkan sunnah Nabi Ibrahim 'alaihis salam dan Nabi Muhammad shallallahu 'alaihi wa sallam yang tidak pernah meninggalkan qurban selama di Madinah (HR. Tirmidzi, dihasankan Al-Albani).\n\n3. Yang sampai kepada Allah adalah ketakwaan, bukan daging maupun darah — "Tidak akan sampai kepada Allah daging-dagingnya dan tidak (pula) darahnya, tetapi yang sampai kepada-Nya adalah ketakwaan dari kalian" (QS Al-Hajj: 37). Maka niat dan keikhlasan lebih utama daripada besarnya hewan.\n\n4. Bentuk syukur atas nikmat rezeki dan kesehatan.\n\n5. Menyenangkan hati fakir miskin, tetangga, dan kerabat — merekatkan ukhuwah pada hari raya.\n\nCatatan: hadits populer "pahala setiap helai bulu" (dari Zaid bin Arqam) dan hadits "tidak ada amalan yang lebih dicintai Allah pada hari Nahr selain mengalirkan darah" (dari Aisyah) — kedua hadits ini didha'ifkan oleh Syaikh Al-Albani rahimahullah. Karena itu keutamaan qurban cukup ditegakkan di atas dalil Al-Qur'an dan hadits shahih di atas.\n\nAdapun perkataan "Barangsiapa memiliki kelapangan tetapi tidak berqurban, janganlah ia mendekati tempat shalat kami" (HR. Ahmad, Ibnu Majah) — sanadnya diperselisihkan; sebagian ulama menilainya mauquf pada Abu Hurairah. Namun maknanya sejalan dengan pendapat Abu Hanifah yang mewajibkan qurban bagi yang mampu, sehingga menjadi peringatan untuk tidak meremehkan ibadah ini.`,
  },
];

export const faqItems = [
  { q: "Apakah boleh berqurban untuk orang yang sudah meninggal?", a: "Menurut Syaikh Bin Baz dan Syaikh Utsaimin: qurban atas nama mayit disyariatkan dalam dua keadaan — (1) apabila almarhum berwasiat untuk diqurbani dari hartanya, atau (2) sebagai pengikut (tabi') dalam qurban keluarga yang masih hidup dengan menyebut 'dariku dan keluargaku yang hidup maupun yang telah wafat'. Adapun berqurban khusus atas nama mayit tanpa wasiat, tidak ada dalil khusus dari Nabi shallallahu 'alaihi wa sallam, meskipun banyak kerabat beliau yang wafat. Jumhur ulama tetap membolehkannya sebagai bentuk sedekah." },
  { q: "Berapa orang yang bisa patungan untuk 1 sapi?", a: "Maksimal 7 orang untuk 1 ekor sapi atau unta, berdasar hadits Jabir bin Abdillah (HR. Muslim). Masing-masing mendapat 1/7 bagian. Sedangkan kambing atau domba hanya untuk 1 orang (boleh diniatkan pahalanya untuk diri sendiri dan keluarga)." },
  { q: "Apakah hewan qurban boleh yang bunting?", a: "Boleh, selama memenuhi syarat umur dan bebas dari 4 cacat yang menghalangi. Sebagian ulama memakruhkan karena khawatir merugikan janin, namun tidak sampai membatalkan sahnya qurban." },
  { q: "Kapan waktu terbaik menyembelih qurban?", a: "Waktu terbaik adalah setelah shalat Idul Adha pada 10 Dzulhijjah (yaumun nahr). Boleh dilanjutkan pada tiga hari tasyriq (11, 12, 13 Dzulhijjah) hingga terbenam matahari — pendapat Ibnu Taimiyah, Bin Baz, dan Utsaimin berdasar hadits 'Seluruh hari tasyriq adalah waktu menyembelih' (HR. Ahmad)." },
  { q: "Apakah boleh memberikan semua daging qurban ke fakir miskin?", a: "Boleh, dan qurban tetap sah. Namun yang lebih utama mengikuti sunnah Nabi shallallahu 'alaihi wa sallam yang memakan sebagian daging qurbannya (HR. Muslim), sebagaimana perintah Allah dalam QS Al-Hajj: 28 dan 36." },
  { q: "Apa hukum menyimpan daging qurban lebih dari 3 hari?", a: "Boleh menyimpan berapa lamapun. Nabi shallallahu 'alaihi wa sallam pernah melarangnya pada tahun paceklik agar daging cepat sampai ke fakir miskin, kemudian beliau membolehkannya kembali (HR. Muslim dari Salamah bin Al-Akwa' dan Buraidah)." },
];

export const preparationChecklist = [
  { id: "niat", label: "Niatkan qurban karena Allah SWT", category: "Spiritual" },
  { id: "tidak-cukur", label: "Tidak memotong rambut & kuku sejak 1 Dzulhijjah", category: "Spiritual" },
  { id: "pilih-hewan", label: "Pilih jenis & kualitas hewan qurban", category: "Persiapan" },
  { id: "cek-syarat", label: "Pastikan hewan memenuhi syarat (usia, sehat, tidak cacat)", category: "Persiapan" },
  { id: "tabungan", label: "Siapkan dana/tabungan qurban", category: "Finansial" },
  { id: "pesan", label: "Pesan hewan qurban jauh-jauh hari", category: "Persiapan" },
  { id: "pisau", label: "Siapkan pisau tajam untuk penyembelihan", category: "Perlengkapan" },
  { id: "tempat", label: "Siapkan tempat penyembelihan yang layak", category: "Perlengkapan" },
  { id: "distribusi", label: "Rencanakan distribusi daging qurban", category: "Distribusi" },
  { id: "shalat", label: "Laksanakan shalat Idul Adha", category: "Spiritual" },
  { id: "doa", label: "Baca doa & basmalah sebelum menyembelih", category: "Spiritual" },
];
