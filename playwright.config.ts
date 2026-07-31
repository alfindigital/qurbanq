import { createLovableConfig } from "lovable-agent-playwright-config/config";
import { onboardingDismissedState } from "./e2e/storage-state";

export default createLovableConfig({
  use: {
    // Modal onboarding muncul di kunjungan pertama dan menutupi navigasi.
    // Untuk test, tandai onboarding sudah selesai lewat localStorage.
    storageState: onboardingDismissedState,
  },
});
