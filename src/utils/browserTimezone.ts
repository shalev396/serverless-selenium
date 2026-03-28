import type { ChromiumWebDriver } from "selenium-webdriver/chromium";

/**
 * Force browser timezone via CDP Emulation.setTimezoneOverride.
 * Call before any navigation. Chromium / Chrome only.
 *
 * @see https://chromedevtools.github.io/devtools-protocol/tot/Emulation/#method-setTimezoneOverride
 */
async function forceBrowserTimezone(
  driver: ChromiumWebDriver,
  timezoneId: string
): Promise<void> {
  await driver.sendDevToolsCommand("Emulation.setTimezoneOverride", {
    timezoneId,
  });
}

/** Log resolved IANA timezone and Date from inside the browser (sanity check). */
async function logBrowserTime(driver: ChromiumWebDriver): Promise<void> {
  const tz = await driver.executeScript(
    "return Intl.DateTimeFormat().resolvedOptions().timeZone"
  );
  const now = await driver.executeScript("return new Date().toString()");
  console.log("Browser TZ:", tz);
  console.log("Browser now:", now);
}

/**
 * Apply timezone override, log, and fail if the browser did not accept the id.
 * Call immediately after WebDriver build(), before driver.get().
 */
export async function applyBrowserTimezone(
  driver: ChromiumWebDriver,
  timezoneId: string
): Promise<void> {
  await forceBrowserTimezone(driver, timezoneId);
  await logBrowserTime(driver);
  const tz = await driver.executeScript(
    "return Intl.DateTimeFormat().resolvedOptions().timeZone"
  );
  if (tz !== timezoneId) {
    throw new Error(`Timezone override failed. Browser TZ is ${tz}`);
  }
}
