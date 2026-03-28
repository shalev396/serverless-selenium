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
 * Main Lambda handler function
 *
 * Processes API Gateway events and demonstrates web automation using Selenium.
 * The function navigates to a website, captures a screenshot, and returns
 * page information along with configuration details.
 *
 * @param event - API Gateway proxy event containing request data
 * @param _context - Lambda context (unused in this example)
 * @returns Promise resolving to API Gateway response
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  // Set automatically from deployment stage in serverless.yml (ENV: ${self:provider.stage}).
  const envExample = process.env["ENV"] ?? "";

  console.log("🚀 Starting Selenium WebDriver Lambda handler...");

  // Configure Chrome options for Lambda environment
  console.log("⚙️  Setting up Chrome options for Lambda environment...");
  const options = new ChromeOptions();
  const service = new ChromeServiceBuilder("/opt/chromedriver");

  // Set the Chrome binary path (installed via Docker)
  options.setChromeBinaryPath("/opt/chrome/chrome");

  // Essential Chrome flags for Lambda environment
  options.addArguments("--headless=old");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-gpu");
  // Lambda-friendly process model (see WoltFlow automation on AWS Lambda)
  options.addArguments("--single-process");
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
    console.log("🔧 Building Chrome WebDriver instance...");

    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    console.log("Applying browser timezone override...");
    await applyBrowserTimezone(driver as ChromiumWebDriver, BROWSER_TIMEZONE_ID);

    console.log("🌐 Navigating to target website...");

    // Navigate to the target website
    await driver.get("https://shalev396.com");

    await driver.sleep(5000);

    const title = await driver.getTitle();
    console.log(`📄 Page title: ${title}`);

    const paramRaw = event.queryStringParameters?.["param"];
    const paramExample = paramRaw === undefined ? null : paramRaw;

    console.log("📸 Capturing screenshot...");

    const screenshot = await driver.takeScreenshot();

    console.log("✅ Successfully completed web automation task");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        title,
        url: await driver.getCurrentUrl(),
        paramExample,
        envExample,
        screenshot,
        timestamp: new Date().toISOString(),
        message: "Web automation completed successfully",
      }),
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
