// #43 Hitung streak minggu berturut-turut yang punya setoran, untuk gamifikasi
// menabung. Bekerja dari daftar tanggal ISO ledger (tidak butuh field baru).

const startOfWeek = (d: Date) => {
  const copy = new Date(d);
  const day = copy.getDay(); // 0=Sun
  const diff = (day + 6) % 7; // Monday as start
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - diff);
  return copy;
};

export const calcStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  const weekKeys = new Set(
    dates.map((iso) => startOfWeek(new Date(iso)).toISOString().slice(0, 10)),
  );
  let streak = 0;
  const cursor = startOfWeek(new Date());
  while (weekKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
};
