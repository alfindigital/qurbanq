import { test, expect } from "../playwright-fixture";

test("Kalkulator shows clear validation errors for participants and price", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/kalkulator");

  // Pilih sapi agar input jumlah peserta muncul (max 7 orang).
  await page.getByRole("button", { name: "Sapi" }).click();
  await page.locator("button:has-text('Rp')").first().click();

  const participantsInput = page.locator('input[aria-label="Jumlah peserta"]');
  const errorAlert = page.locator('#persons-error');

  // Kosong
  await participantsInput.fill("");
  await participantsInput.blur();
  await expect(errorAlert).toHaveText("Jumlah peserta wajib diisi");

  // Negatif
  await participantsInput.fill("-2");
  await participantsInput.blur();
  await expect(errorAlert).toHaveText("Jumlah peserta minimal 1 orang");

  // Melebihi maksimal
  await participantsInput.fill("10");
  await participantsInput.blur();
  await expect(errorAlert).toHaveText("Jumlah peserta maksimal 7 orang");

  // Valid
  await participantsInput.fill("3");
  await participantsInput.blur();
  await expect(errorAlert).not.toBeVisible();
});
