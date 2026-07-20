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

export const getNextIdulAdhaInfo = (): { date: Date; hijriYear: number } => {
  const now = new Date();
  return (
    IDUL_ADHA_SCHEDULE.find((d) => now < d.date) ??
    IDUL_ADHA_SCHEDULE[IDUL_ADHA_SCHEDULE.length - 1]
  );
};

export const getNextIdulAdha = (): Date => getNextIdulAdhaInfo().date;


export const educationArticles = [
  {
    id: "hukum-qurban",
    title: "Hukum & Syarat Qurban",
    icon: "Scale",
    content: `Qurban (udhiyah) hukumnya sunnah muakkadah menurut mayoritas ulama, dan wajib menurut Imam Abu Hanifah bagi yang mampu.\n\n**Syarat Hewan Qurban:**\n- Unta minimal 5 tahun\n- Sapi/kerbau minimal 2 tahun\n- Kambing/domba minimal 1 tahun (domba boleh 6 bulan jika gemuk)\n- Hewan sehat, tidak cacat (buta, pincang parah, kurus kering, telinga terpotong lebih dari setengah)\n\n**Syarat Orang yang Berqurban:**\n- Muslim\n- Baligh & berakal\n- Mampu secara finansial\n- Merdeka (bukan budak)\n\n**Waktu Penyembelihan:**\nDimulai setelah shalat Idul Adha hingga akhir hari Tasyriq (13 Dzulhijjah).`,
  },
  {
    id: "tata-cara",
    title: "Tata Cara Penyembelihan",
    icon: "BookOpen",
    content: `**Adab Penyembelihan Qurban:**\n\n1. **Menghadapkan hewan ke kiblat** — Hewan dibaringkan di sisi kiri\n2. **Membaca Basmalah & Takbir** — "Bismillah, Allahu Akbar"\n3. **Membaca doa qurban** — Menyebut nama orang yang berqurban\n4. **Menyembelih dengan pisau tajam** — Memutus saluran napas, kerongkongan, dan dua urat nadi\n5. **Menunggu hewan benar-benar mati** — Sebelum dikuliti\n\n**Hal yang Dianjurkan:**\n- Menyembelih sendiri jika mampu\n- Menggunakan pisau yang sangat tajam\n- Memperlakukan hewan dengan baik\n- Tidak mengasah pisau di depan hewan\n- Tidak menyembelih hewan di depan hewan lain`,
  },
  {
    id: "pembagian-daging",
    title: "Pembagian Daging Qurban",
    icon: "Users",
    content: `**Pembagian Daging Qurban yang Dianjurkan:**\n\nMenurut mayoritas ulama, daging qurban dibagi menjadi tiga bagian:\n\n1. **⅓ untuk dimakan sendiri & keluarga** — Dianjurkan untuk memakan sebagian dari daging qurban\n2. **⅓ untuk disedekahkan** — Diberikan kepada fakir miskin dan yang membutuhkan\n3. **⅓ untuk dihadiahkan** — Diberikan kepada tetangga, kerabat, dan teman\n\n**Ketentuan Penting:**\n- Tidak boleh menjual daging, kulit, atau bagian apapun dari hewan qurban\n- Tukang jagal tidak boleh diberi upah dari bagian hewan qurban\n- Kulit boleh disedekahkan atau dimanfaatkan sendiri\n- Dianjurkan memberikan porsi lebih besar untuk fakir miskin`,
  },
  {
    id: "keutamaan",
    title: "Keutamaan Berqurban",
    icon: "Star",
    content: `**Keutamaan & Pahala Berqurban:**\n\n1. **Menghidupkan sunnah Nabi Ibrahim AS** — Sebagai bentuk ketaatan kepada Allah SWT\n2. **Mendekatkan diri kepada Allah** — Kata "qurban" berasal dari "qurb" yang berarti dekat\n3. **Pahala di setiap helai bulu** — Rasulullah ﷺ bersabda bahwa setiap helai bulu hewan qurban bernilai satu kebaikan\n4. **Amalan paling dicintai di hari Nahr** — "Tidak ada amalan anak Adam di hari Nahr yang lebih dicintai Allah daripada mengalirkan darah (qurban)" (HR. Tirmidzi)\n5. **Berbagi kebahagiaan** — Menyenangkan hati fakir miskin dan tetangga\n6. **Wujud rasa syukur** — Atas nikmat rezeki dan kesehatan dari Allah SWT\n\n**Hadits tentang Qurban:**\n> "Barangsiapa yang mempunyai kelapangan (harta) tetapi tidak berqurban, maka janganlah ia mendekati tempat shalat kami." (HR. Ibnu Majah)`,
  },
];

export const faqItems = [
  { q: "Apakah boleh berqurban untuk orang yang sudah meninggal?", a: "Boleh. Berqurban atas nama orang yang sudah meninggal diperbolehkan, baik diwasiatkan maupun tidak, sebagai bentuk sedekah untuknya." },
  { q: "Berapa orang yang bisa patungan untuk 1 sapi?", a: "Maksimal 7 orang untuk 1 ekor sapi atau unta. Masing-masing mendapat 1/7 bagian. Sedangkan kambing/domba untuk 1 orang saja." },
  { q: "Apakah hewan qurban boleh yang bunting?", a: "Boleh, selama hewan tersebut memenuhi syarat usia dan tidak cacat. Namun sebagian ulama memakruhkannya." },
  { q: "Kapan waktu terbaik menyembelih qurban?", a: "Waktu terbaik adalah setelah shalat Idul Adha pada hari Nahr (10 Dzulhijjah). Boleh juga di hari Tasyriq (11-13 Dzulhijjah)." },
  { q: "Apakah boleh memberikan semua daging qurban ke fakir miskin?", a: "Boleh dan bahkan lebih utama. Yang dianjurkan adalah memakan sebagian dan menyedekahkan sebagian lainnya." },
  { q: "Apa hukum menyimpan daging qurban lebih dari 3 hari?", a: "Pada awalnya Rasulullah ﷺ melarang menyimpan lebih dari 3 hari, namun kemudian membolehkannya. Jadi boleh menyimpan daging qurban berapa lamapun." },
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
