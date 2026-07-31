/**
 * StorageState bersama untuk semua test Playwright.
 *
 * Modal onboarding tampil pada kunjungan pertama di halaman utama dan
 * overlay-nya menutupi BottomNav, sehingga test navigasi akan macet.
 * Menandai `qurbanku-onboarded` di localStorage membuat setiap test mulai
 * dari kondisi pengguna yang sudah pernah membuka aplikasi.
 */
const ORIGINS = ["http://localhost:8080", "http://127.0.0.1:4173", "http://localhost:4173"];

export const onboardingDismissedState = {
  cookies: [],
  origins: ORIGINS.map((origin) => ({
    origin,
    localStorage: [{ name: "qurbanku-onboarded", value: "1" }],
  })),
};
