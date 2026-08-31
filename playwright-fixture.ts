// Base test/expect used by all e2e specs.
// Re-exported from @playwright/test so the suite runs both locally and in CI
// without depending on any internal preset package.
export { test, expect } from "@playwright/test";
