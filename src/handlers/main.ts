// Core Selenium WebDriver imports
import { Builder, WebDriver } from "selenium-webdriver";
import {
  Options as ChromeOptions,
  ServiceBuilder as ChromeServiceBuilder,
} from "selenium-webdriver/chrome";
import type { ChromiumWebDriver } from "selenium-webdriver/chromium";

import { applyBrowserTimezone } from "../utils/browserTimezone";

// AWS Lambda type definitions
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

/**
 * IANA timezone for CDP override. Change to any valid id (e.g. Europe/London, America/New_York).
 * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */
const BROWSER_TIMEZONE_ID = "Asia/Jerusalem";

/**
 * Main Lambda handler — Chrome/driver setup aligned with the working Lambda
 * automation pattern (same flags, build → timezone → navigation).
 */
export const handler = async (
  _event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("Start chrome + driver");

  const options = new ChromeOptions();
  const service = new ChromeServiceBuilder("/opt/chromedriver");

  options.setChromeBinaryPath("/opt/chrome/chrome");

  options.addArguments("--headless=old");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");
  options.addArguments("--single-process"); //with isWorking="true", ms="163767"||without(//) isWorking="true", ms="168950"
  options.addArguments("--no-zygote");
  options.addArguments("--remote-debugging-port=0");

  options.addArguments("--window-size=1920,1080");
  options.addArguments("--force-device-scale-factor=1");

  options.addArguments("--disable-extensions");
  options.addArguments("--disable-plugins");
  options.addArguments("--no-first-run");
  options.addArguments("--disable-default-apps");

  let driver: WebDriver | null = null;

  try {
    console.log("Building Chrome driver...");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    console.log("Applying browser timezone override...");
    await applyBrowserTimezone(driver as ChromiumWebDriver, BROWSER_TIMEZONE_ID);

    console.log("End chrome + driver");

    await driver.get("https://shalev396.com");

    const title = await driver.getTitle();
    console.log(`📄 Page title: ${title}`);

    const url = await driver.getCurrentUrl();

    console.log("✅ Successfully completed web automation task");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ title, url }),
    };
  } catch (error) {
    console.error("❌ Error occurred during web automation:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
    };
  } finally {
    if (driver) {
      console.log("🔒 Closing Chrome WebDriver...");
      await driver.quit();
    }
  }
};
