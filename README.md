# Serverless Selenium with TypeScript

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/lambda/)
[![Serverless](https://img.shields.io/badge/Serverless-FD5750?style=for-the-badge&logo=serverless&logoColor=white)](https://www.serverless.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Selenium](https://img.shields.io/badge/Selenium-43B02A?style=for-the-badge&logo=selenium&logoColor=white)](https://selenium.dev/)

A production-ready, TypeScript-based serverless application that runs headless Chrome with Selenium WebDriver on AWS Lambda using Docker containers. Features **single Docker image for multiple functions**, optional environment variable support, ultra-strict TypeScript configuration, and webpack bundling for optimal performance.

## ✨ Features

- 🚀 **Modern TypeScript** - Ultra-strict configuration with ES2022 features
- 📦 **Webpack Bundling** - Optimized 386KB bundle with tree-shaking
- 🐳 **Multi-Function Docker Image** - One image for multiple Lambda functions
- 🔧 **Selenium WebDriver** - Automated browser testing and web scraping
- ⚡ **AWS Lambda** - 60-second timeout, 2GB memory allocation
- 🔐 **Optional Environment Variables** - Configurable secret management
- 🛠️ **Production Ready** - Docker best practices and security

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker
- AWS CLI configured
- Serverless Framework 3+

### Installation & Setup

```bash
# Clone and install
git clone https://github.com/shalev396/serverless-selenium.git
cd docker-selenium-lambda
npm install

# Build the project
npm run build
```

### Optional Environment Configuration

Environment variables are **optional** but can be used to customize behavior:

**Create `.env` file (optional):**
```bash
# Optional local development environment variables
# You can customize the password returned in responses
PASSWORD=your_custom_password
```

**Available in `.env.example`:**
```bash
# Example environment variables for docker-selenium-lambda
# Copy this file to .env and customize as needed
# These are completely optional

PASSWORD=your_password_here
```

## 🔧 Configuration

### Multi-Function Docker Architecture

This project uses a **single Docker image** that can be used for **multiple Lambda functions**. The handler is specified per function in `serverless.yml`:

```yaml
# serverless.yml
provider:
  ecr:
    images:
      selenium-image:          # Single reusable image
        path: ./
        file: Dockerfile

functions:
  demo:                        # Function 1
    image:
      name: selenium-image
      command: 
        - "handlers/main.handler"
  
  test:                        # Function 2 (same image, different handler)
    image:
      name: selenium-image
      command: 
        - "handlers/test.handler"
```

### File Structure & Build Process

**Source Structure:**
```
src/
├── handlers/
│   ├── main.ts              # Main demo handler
│   ├── test.ts              # Test handler
│   └── user.ts              # User handler
└── utils/
    └── helpers.ts           # Shared utilities
```

**Build Output (dist/ mirrors src/):**
```
dist/
├── handlers/
│   ├── main.js              # Webpack bundled handlers
│   ├── test.js
│   └── user.js
└── utils/
    └── helpers.js           # Bundled utilities
```

### Optional Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PASSWORD` | Custom password returned in response | `"no-password-set"` | No |

**Environment Variable Flow (when used):**
- **Local Development**: `.env` file → `process.env` (optional)
- **Docker Build**: `ENV` in Dockerfile → `process.env` (optional)
- **Lambda Deployment**: `serverless.yml` environment → `process.env` (optional)

### Lambda Configuration

```yaml
# serverless.yml
functions:
  demo:
    timeout: 60          # Extended for Chrome operations
    memorySize: 2048     # Required for Chrome
    image:
      name: selenium-image
      command: 
        - "handlers/main.handler"    # Specify handler path
    environment:         # Optional environment variables
      PASSWORD: ${env:PASSWORD, 'password123'}
```

## 📦 Build Process

### Automatic File Discovery

Webpack automatically discovers and processes **all** `.ts` and `.js` files in the `src/` directory:

```bash
# Add any file to src/ and it gets built automatically
src/handlers/newHandler.ts  →  dist/handlers/newHandler.js
src/utils/database.ts       →  dist/utils/database.js
src/services/auth.ts        →  dist/services/auth.js
```

### Webpack Bundle Analysis
```
asset handlers/main.js 386 KiB [emitted] [minimized]
├── selenium-webdriver/     681 KiB (71 modules)
├── jszip/lib/             133 KiB (34 modules)  
├── pako/                  214 KiB (16 modules)
├── ws/                    125 KiB (14 modules)
└── readable-stream/        68.6 KiB (9 modules)
```

**Bundle Features:**
- **Tree-shaken dependencies** - Only used code included
- **TypeScript declarations** - Full type information
- **Source maps** - Debug support
- **CommonJS compatible** - Lambda runtime support

## 🎯 Usage & Testing

### Adding New Functions

**1. Create Handler File:**
```typescript
// src/handlers/newFunction.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: "New function response"
  };
};
```

**2. Add Function to serverless.yml:**
```yaml
functions:
  newFunction:
    timeout: 60
    memorySize: 2048
    image:
      name: selenium-image
      command: 
        - "handlers/newFunction.handler"
    environment:
      PASSWORD: ${env:PASSWORD, 'default123'}
```

**3. Build and Deploy:**
```bash
npm run build    # Automatically includes new handler
npm run deploy   # Deploys with same Docker image
```

### Optional Environment Variable Handling

The Lambda function demonstrates optional environment variable and event property handling:

**Environment Variables (Optional):**
- Can read `PASSWORD` from `process.env["PASSWORD"]` if provided
- Provides fallback value `"no-password-set"` if environment variable is not configured
- Supports TypeScript strict null checks with optional chaining

**Event Property Handling:**
- Safely extracts `runId` from API Gateway query parameters
- Uses bracket notation for TypeScript strict mode compatibility
- Handles optional properties with null coalescing

### Lambda Function Response

The function returns comprehensive information including any configured environment variables:

```json
{
  "statusCode": 200,
  "body": "Google,run-id-123,password1234"
}
```

**Response Format:** `"<page-title>,<runId>,<password>"`

### API Gateway Event Structure

```typescript
interface APIGatewayProxyEvent {
  queryStringParameters?: {
    runId?: string;
  } | null;
}
```

### Testing with test.json

The project includes a `test.json` file that defines the test payload for the Lambda function:

```json
{
  "queryStringParameters": {
    "runId": "run-id-123"
  }
}
```

**Understanding test.json:**
- **`queryStringParameters`** - Simulates API Gateway query parameters
- **`runId`** - Custom parameter that gets included in the response
- **Structure** - Matches the API Gateway event format exactly

**Creating Custom Tests:**

You can create additional test files for different scenarios:

```json
// test-no-params.json
{
  "queryStringParameters": null
}

// test-custom-id.json  
{
  "queryStringParameters": {
    "runId": "production-test-456"
  }
}
```

**Running Tests:**

```bash
# Run the default test (uses test.json)
npm test
# Expected: "Google,run-id-123,<password>"

# Run with custom test file
serverless invoke -f demo --path test-no-params.json
# Expected: "Google,undefined,<password>"

# Run with another custom test
serverless invoke -f demo --path test-custom-id.json  
# Expected: "Google,production-test-456,<password>"
```

**Test Response Analysis:**
- **Page title** - Always "Google" (from google.com)
- **Run ID** - Extracted from `queryStringParameters.runId` or "undefined"
- **Password** - From environment variable or "no-password-set" fallback

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Clean install and webpack bundle |
| `npm run deploy` | Build and deploy to AWS Lambda |
| `npm test` | Test deployed function with test.json |

## 🐳 Docker Best Practices

### Single Image, Multiple Functions

The Docker image is built **without a hardcoded CMD**, allowing the same image to be used for multiple Lambda functions:

```dockerfile
# No CMD specified - handler configured per function
# This allows the same image to be used for multiple Lambda functions
```

### Multi-stage Build Optimization
```dockerfile
# Build stage - Chrome binaries
FROM public.ecr.aws/lambda/nodejs:latest as build

# Final runtime - minimal image
FROM public.ecr.aws/lambda/nodejs:latest
```

### Security Features
- ✅ **`.dockerignore`** - Prevents sensitive files in build context
- ✅ **No `.env` copying** - Environment variables only
- ✅ **Minimal runtime** - Only necessary files in final image
- ✅ **Default ENV values** - Fallback configuration

## 🛠️ Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Build with webpack
npm run build

# Test locally (requires deployed function)
npm test
```

### Deployment Process
```bash
# Full deployment pipeline
npm run deploy

# Manual steps
npm run build           # Webpack bundle
serverless deploy       # AWS deployment
npm test                # Verification
```

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Bundle Size** | 386 KiB | Webpack optimized |
| **Memory Usage** | 2048 MB | Required for Chrome |
| **Timeout** | 60 seconds | Extended for reliability |
| **Cold Start** | ~3-5 seconds | Docker container |
| **Warm Start** | ~1-2 seconds | Reused container |

## 🔍 Troubleshooting

### Common Issues & Solutions

**1. Chrome Crashes**
- ✅ Memory set to 2048MB or more
- ✅ Timeout extended to 60 seconds or more
- ✅ All required Chrome arguments included

**2. Environment Variables Not Working**
- ✅ Check `.env` file exists locally (if using environment variables)
- ✅ Verify `serverless.yml` environment mapping
- ✅ Confirm Docker ENV defaults

**3. Lambda Image Compatibility**
```bash
# Build with correct platform
docker buildx build --platform linux/amd64 --load -t test .
```

**4. Adding New Functions**
- ✅ Create handler in `src/handlers/`
- ✅ Add function to `serverless.yml` with correct command path
- ✅ Use same `selenium-image` for all functions

### Debug Commands
```bash
# View deployment logs
serverless logs -f demo

# Test with logging
serverless invoke -f demo --log

# Debug mode deployment  
serverless deploy --debug
```

## 📁 Project Structure

```
docker-selenium-lambda/
├── src/
│   ├── handlers/                # Lambda function handlers
│   │   ├── main.ts             # Main demo handler
│   │   └── test.ts             # Additional handlers
│   └── utils/                  # Shared utilities
├── dist/                       # Webpack build output (mirrors src/)
│   ├── handlers/
│   │   ├── main.js            # Built handlers
│   │   └── test.js
│   └── utils/
├── .env                        # Optional local environment (IGNORED)
├── .env.example               # Optional environment template
├── .dockerignore              # Docker build exclusions
├── .gitignore                 # Git exclusions  
├── Dockerfile                 # Multi-function container build
├── webpack.config.js          # Automatic file discovery
├── tsconfig.json             # Ultra-strict TypeScript
├── serverless.yml            # Multi-function AWS deployment
├── package.json              # Dependencies & scripts
├── test.json                 # Default test payload
└── README.md                 # This documentation
```

## 🔐 Security Considerations

- **Environment Variables**: Optional - never commit `.env` files if used
- **Docker Secrets**: Use multi-stage builds, avoid copying secrets
- **Lambda Permissions**: Minimal IAM permissions for ECR
- **Build Context**: `.dockerignore` prevents sensitive file inclusion
- **TypeScript**: Ultra-strict configuration prevents runtime errors

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
