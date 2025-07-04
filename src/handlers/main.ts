// Core Selenium WebDriver imports
import { Builder, WebDriver } from "selenium-webdriver";
import {
  Options as ChromeOptions,
  ServiceBuilder as ChromeServiceBuilder,
} from "selenium-webdriver/chrome";

// AWS Lambda type definitions
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

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
  console.log("🚀 Starting Selenium WebDriver Lambda handler...");

  // Configure Chrome options for Lambda environment
  console.log("⚙️  Setting up Chrome options for Lambda environment...");
  const options = new ChromeOptions();
  const service = new ChromeServiceBuilder("/opt/chromedriver");

  // Set the Chrome binary path (installed via Docker)
  options.setChromeBinaryPath("/opt/chrome/chrome");

  // Essential Chrome flags for Lambda environment
  // These are critical for running Chrome in a serverless container
  options.addArguments("--headless=old"); // Run without GUI
  options.addArguments("--no-sandbox"); // Bypass OS security model
  options.addArguments("--disable-dev-shm-usage"); // Overcome limited resource problems
  options.addArguments("--disable-gpu"); // Disable GPU hardware acceleration
  options.addArguments("--single-process"); // Run in single process mode
  options.addArguments("--no-zygote"); // Disable zygote process
  options.addArguments("--remote-debugging-port=0"); // Disable remote debugging

  // Set exact window size for consistent screenshots
  options.addArguments("--window-size=1920,1080");
  options.addArguments("--force-device-scale-factor=1");

  // Performance and security optimizations
  options.addArguments("--disable-extensions"); // Disable browser extensions
  options.addArguments("--disable-plugins"); // Disable browser plugins
  options.addArguments("--no-first-run"); // Skip first run wizards
  options.addArguments("--disable-default-apps"); // Disable default apps

  // Initialize WebDriver instance
  let driver: WebDriver | null = null;

  try {
    console.log("🔧 Building Chrome WebDriver instance...");

    // Create WebDriver with configured options
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    console.log("🌐 Navigating to target website...");

    // Navigate to the target website
    await driver.get("https://www.shalev396.com");

    // Wait for page to load completely
    await driver.sleep(5000);

    // Extract page title
    const title = await driver.getTitle();
    console.log(`📄 Page title: ${title}`);

    // Extract query parameters from the API Gateway event
    // Using bracket notation for TypeScript strict mode compatibility
    const paramExample = event.queryStringParameters?.["param"] || "0";

    // Read environment variables with fallback defaults
    const envExample = process.env["ENV"] || "NO_ENV";

    console.log("📸 Capturing screenshot...");

    // Take a screenshot of the current page
    const screenshot = await driver.takeScreenshot();

    console.log("✅ Successfully completed web automation task");

    // Return successful response with collected data
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Enable CORS for web clients
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

    // Return error response with details
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
    // Ensure WebDriver is properly closed to free resources
    if (driver) {
      console.log("🔒 Closing Chrome WebDriver...");
      await driver.quit();
    }
  }
};
