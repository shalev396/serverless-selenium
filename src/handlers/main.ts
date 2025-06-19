import { Builder, WebDriver } from "selenium-webdriver";
import {
  Options as ChromeOptions,
  ServiceBuilder as ChromeServiceBuilder,
} from "selenium-webdriver/chrome";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const options = new ChromeOptions();
  const service = new ChromeServiceBuilder("/opt/chromedriver");

  options.setChromeBinaryPath("/opt/chrome/chrome");
  options.addArguments("--headless=new");
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-gpu");
  options.addArguments("--window-size=1280x1696");
  options.addArguments("--single-process");
  options.addArguments("--disable-dev-shm-usage");
  options.addArguments("--disable-dev-tools");
  options.addArguments("--no-zygote");
  options.addArguments(
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "chrome-"))}`
  );
  options.addArguments(`--data-path=${mkdtempSync(join(tmpdir(), "chrome-"))}`);
  options.addArguments(
    `--disk-cache-dir=${mkdtempSync(join(tmpdir(), "chrome-"))}`
  );
  options.addArguments("--remote-debugging-port=9222");

  const driver: WebDriver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .setChromeService(service)
    .build();

  try {
    await driver.get("https://google.com/");
    const title = await driver.getTitle();

    const runId = event?.queryStringParameters?.["runId"];
    const password = process.env["PASSWORD"] ?? "no-password-set";

    return {
      statusCode: 200,
      body: `${title},${runId ?? "undefined"},${password}`,
    };
  } finally {
    await driver.quit();
  }
};
