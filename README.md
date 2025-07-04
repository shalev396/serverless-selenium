# Serverless Selenium with TypeScript

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/lambda/)
[![Serverless](https://img.shields.io/badge/Serverless-FD5750?style=for-the-badge&logo=serverless&logoColor=white)](https://www.serverless.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Selenium](https://img.shields.io/badge/Selenium-43B02A?style=for-the-badge&logo=selenium&logoColor=white)](https://selenium.dev/)

A production-ready, TypeScript-based serverless application that runs headless Chrome with Selenium WebDriver on AWS Lambda using Docker containers. Features **single Docker image for multiple functions**, ultra-strict TypeScript configuration, and webpack bundling for optimal performance.

## ✨ Features

- 🚀 **Modern TypeScript** - Ultra-strict configuration with ES2022 features
- 📦 **Webpack Bundling** - Optimized bundles with tree-shaking
- 🐳 **Multi-Function Docker Image** - One image for multiple Lambda functions
- 🔧 **Selenium WebDriver** - Automated browser testing and web scraping
- ⚡ **AWS Lambda** - 15-second timeout, 650MB memory allocation
- 🛠️ **Production Ready** - Docker best practices and security

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker
- AWS CLI configured with appropriate permissions
- Serverless Framework 3+

### Installation & Setup

```bash
# Clone and install
git clone https://github.com/shalev396/serverless-selenium.git
cd serverless-selenium
npm install

# Build the project
npm run build
```

### AWS Configuration

1. **Configure AWS CLI**:

   ```bash
   aws configure
   ```

2. **ECR Repository Setup**:
   Create an ECR repository for your Docker images:

   ```bash
   aws ecr create-repository --repository-name selenium-lambda
   ```

3. **Docker ECR Login**:
   Authenticate Docker with ECR to push images:

   **PowerShell:**

   ```powershell
   $password = aws ecr get-login-password --region <YOUR_AWS_REGION>
   docker login --username AWS --password $password <YOUR_ACCOUNT_ID>.dkr.ecr.<YOUR_AWS_REGION>.amazonaws.com
   ```

   **Bash:**

   ```bash
   aws ecr get-login-password --region <YOUR_AWS_REGION> | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.<YOUR_AWS_REGION>.amazonaws.com
   ```

### Serverless Deployment

```bash
# Deploy to AWS
npm run deploy

# Test the deployment
npm test
```

## 🔧 Configuration

### Serverless Framework Setup

The project uses `serverless.yml` for AWS deployment configuration:

```yaml
service: selenium-lambda

provider:
  name: aws
  stage: ${opt:stage, 'dev'}
  region: ${env:AWS_REGION, 'il-central-1'}

  ecr:
    images:
      selenium-image:
        path: ./
        file: Dockerfile

functions:
  demo:
    timeout: 15
    memorySize: 650
    image:
      name: selenium-image
      command:
        - "handlers/main.handler"
    environment:
      ENV: ${env:ENV, 'QA'}
```

### Environment Variables

Configure optional environment variables in your deployment:

| Variable     | Description           | Default        | Example                  |
| ------------ | --------------------- | -------------- | ------------------------ |
| `ENV`        | Environment stage     | `QA`           | `DEV`, `QA`, `PROD`      |
| `AWS_REGION` | AWS deployment region | `il-central-1` | `us-east-1`, `eu-west-1` |

**Environment Usage Example:**

```yaml
# In serverless.yml
environment:
  ENV: ${env:ENV, 'QA'} # Reads from .env file or defaults to 'QA'
  CUSTOM_VAR: ${env:CUSTOM_VAR, 'default'} # Custom environment variable
```

**Local .env file example:**

```bash
ENV=DEV
AWS_REGION=us-east-1
CUSTOM_VAR=my-value
```

### Multi-Function Architecture

Single Docker image supports multiple Lambda functions:

```yaml
functions:
  demo:
    image:
      name: selenium-image
      command: ["handlers/main.handler"]

  test:
    image:
      name: selenium-image
      command: ["handlers/test.handler"]
```

## 📦 Build Process

### Automatic File Discovery

Webpack automatically discovers and processes all `.ts` and `.js` files in the `src/` directory:

```
src/handlers/main.ts        → dist/handlers/main.js
src/handlers/test.ts        → dist/handlers/test.js
src/utils/helpers.ts        → dist/utils/helpers.js
```

### Build Features

- **Tree-shaken dependencies** - Only used code included
- **TypeScript compilation** - Full type checking and declarations
- **Source maps** - Debug support for development
- **CommonJS output** - Lambda runtime compatibility

### Docker Multi-stage Build

```dockerfile
# Build stage - Chrome binaries
FROM public.ecr.aws/lambda/nodejs:latest as build

# Runtime stage - minimal image
FROM public.ecr.aws/lambda/nodejs:latest
```

**File Structure:**

```
src/
├── handlers/
│   ├── main.ts              # Main demo handler
│   └── test.ts              # Additional handlers
└── utils/
    └── helpers.ts           # Shared utilities

dist/                        # Build output (mirrors src/)
├── handlers/
│   ├── main.js             # Compiled handlers
│   └── test.js
└── utils/
    └── helpers.js          # Compiled utilities
```

## 📋 Available Scripts

| Script           | Description                                   |
| ---------------- | --------------------------------------------- |
| `npm run build`  | Clean install dependencies and webpack bundle |
| `npm run deploy` | Build project and deploy to AWS Lambda        |
| `npm test`       | Test deployed function with test.json payload |

### Usage Examples

```bash
# Development workflow
npm run build              # Build TypeScript to JavaScript
npm run deploy             # Deploy to AWS
npm test                   # Test the deployment

# Testing with custom payload
serverless invoke -f demo --path test.json

# View function logs
serverless logs -f demo

# Deploy to specific stage
serverless deploy --stage prod
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes following TypeScript strict mode
4. Test deployment: `npm run deploy`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Selenium WebDriver](https://selenium.dev/) - Browser automation
- [AWS Lambda](https://aws.amazon.com/lambda/) - Serverless computing
- [Serverless Framework](https://www.serverless.com/) - Deployment
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Webpack](https://webpack.js.org/) - Module bundling
