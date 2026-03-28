# Serverless Selenium with TypeScript

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/lambda/)
[![Serverless](https://img.shields.io/badge/Serverless-FD5750?style=for-the-badge&logo=serverless&logoColor=white)](https://www.serverless.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Selenium](https://img.shields.io/badge/Selenium-43B02A?style=for-the-badge&logo=selenium&logoColor=white)](https://selenium.dev/)

[![Deploy](https://github.com/shalev396/serverless-selenium/actions/workflows/push-deploy.yml/badge.svg)](https://github.com/shalev396/serverless-selenium/actions/workflows/push-deploy.yml)
[![Daily smoke test](https://github.com/shalev396/serverless-selenium/actions/workflows/daily-smoke.yml/badge.svg)](https://github.com/shalev396/serverless-selenium/actions/workflows/daily-smoke.yml)

A production-ready, TypeScript-based serverless application that runs headless Chrome with Selenium WebDriver on AWS Lambda using Docker containers. Features **single Docker image for multiple functions**, ultra-strict TypeScript configuration, and webpack bundling for optimal performance.

## ✨ Features

- 🚀 **Modern TypeScript** - Ultra-strict configuration with ES2022 features
- 📦 **Webpack Bundling** - Optimized bundles with tree-shaking
- 🐳 **Multi-Function Docker Image** - One image for multiple Lambda functions
- 🔧 **Selenium WebDriver** - Automated browser testing and web scraping
- ⚡ **AWS Lambda** - 20-second timeout, 650MB memory allocation
- 🛠️ **Production Ready** - Docker best practices and security

## Requirements

1. **AWS account** — You deploy Lambda, ECR, and IAM resources into your own AWS account (see [AWS](https://aws.amazon.com/)).
2. **Serverless Framework account** — Serverless Framework v4 needs a free [Serverless Dashboard](https://app.serverless.com/) account to authenticate the CLI.
3. **License key from the Serverless dashboard** — In [License keys](https://app.serverless.com/settings/licenseKeys), create a key and import that value wherever you configure the app: set the `SERVERLESS_LICENSE_KEY` GitHub repository secret and the same variable locally (see [`.env.example`](.env.example)).

## Get started

```bash
git clone https://github.com/shalev396/serverless-selenium.git
cd serverless-selenium
npm install
npm run build
npm run deploy
npm test   # optional — invoke deployed Lambda with test.json
```

**GitHub:** Add the repository **secret(s)** and **variable(s)** named in [`.env.example`](.env.example). The deploy workflow logs into ECR via [`amazon-ecr-login`](https://github.com/aws-actions/amazon-ecr-login) after assuming your OIDC role; set IAM so that role can push to ECR.

**Local:** Export the same variable names (or copy [`.env.example`](.env.example) to `.env` and load it however you prefer). Stage, region, and the rest live in [`serverless.yml`](serverless.yml) and the workflow files — adjust there to match your account.

[`test.json`](test.json) is a sample invoke payload for `npm test` / `lambda invoke`.

## License

MIT — see [LICENSE](LICENSE).
