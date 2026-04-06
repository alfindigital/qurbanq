export const WHATSAPP_NUMBER = "6289619093961";

export type AnimalType = "sapi" | "kambing" | "domba" | "unta";

export interface AnimalOption {
  id: string;
  type: AnimalType;
  label: string;
  weight: string;
  price: number;
  maxPersons: number;
  description: string;
}

export const animalOptions: AnimalOption[] = [
  { id: "kambing-a", type: "kambing", label: "Kambing Kacang", weight: "25-30 kg", price: 2500000, maxPersons: 1, description: "Kambing lokal, sehat & gemuk" },
  { id: "kambing-b", type: "kambing", label: "Kambing Jawa", weight: "30-40 kg", price: 3500000, maxPersons: 1, description: "Kambing Jawa pilihan, berat ideal" },
  { id: "kambing-c", type: "kambing", label: "Kambing Etawa", weight: "35-50 kg", price: 4500000, maxPersons: 1, description: "Kambing Etawa premium, besar & sehat" },
  { id: "domba-a", type: "domba", label: "Domba Garut", weight: "30-40 kg", price: 3000000, maxPersons: 1, description: "Domba Garut berkualitas" },
  { id: "domba-b", type: "domba", label: "Domba Ekor Gemuk", weight: "35-50 kg", price: 4000000, maxPersons: 1, description: "Domba ekor gemuk, berat prima" },
  { id: "sapi-a", type: "sapi", label: "Sapi Lokal", weight: "250-300 kg", price: 18000000, maxPersons: 7, description: "Sapi lokal sehat, cocok untuk qurban bersama" },
  { id: "sapi-b", type: "sapi", label: "Sapi Bali", weight: "300-400 kg", price: 23000000, maxPersons: 7, description: "Sapi Bali pilihan, daging berkualitas" },
  { id: "sapi-c", type: "sapi", label: "Sapi Limosin", weight: "400-500 kg", price: 30000000, maxPersons: 7, description: "Sapi Limosin premium, bobot besar" },
  { id: "unta-a", type: "unta", label: "Unta Standar", weight: "300-400 kg", price: 45000000, maxPersons: 7, description: "Unta qurban impor, lengkap surat" },
];

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
};

export const generateWhatsAppLink = (message: string): string => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// Idul Adha 2025: ~7 Juni 2025 (10 Dzulhijjah 1446 H)
// Idul Adha 2026: ~27 Mei 2026 (10 Dzulhijjah 1447 H)
export const getNextIdulAdha = (): Date => {
  const now = new Date();
  const idulAdha2025 = new Date(2025, 5, 7); // 7 Juni 2025
  const idulAdha2026 = new Date(2026, 4, 27); // 27 Mei 2026
  return now < idulAdha2025 ? idulAdha2025 : idulAdha2026;
};

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
