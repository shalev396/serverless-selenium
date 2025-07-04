
import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

// ES module compatibility setup for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------------------------------
// Automatic Entry Point Discovery
// ------------------------------------------------------------------------------

/**
 * Automatically discover all .ts and .js files in src directory
 * and create webpack entry points for each file.
 *
 * This approach allows for:
 * - Automatic inclusion of new handlers without config changes
 * - Proper separation of concerns with individual bundles
 * - Easy scaling to multiple Lambda functions
 */
const entries = {};
const files = glob.sync("./src/**/*.{ts,js}");

files.forEach((file) => {
  // Normalize path separators for cross-platform compatibility
  // Windows: src\handlers\main.ts -> src/handlers/main.ts
  // Unix: src/handlers/main.ts -> src/handlers/main.ts
  const normalizedFile = file.replace(/\\/g, "/");

  // Convert file path to entry name by:
  // 1. Removing ./src/ or src/ prefix
  // 2. Removing file extension
  // Example: ./src/handlers/main.ts -> handlers/main
  const name = normalizedFile
    .replace(/^(\.\/)?src\//, "") // Remove ./src/ or src/ prefix
    .replace(/\.(ts|js)$/, ""); // Remove .ts or .js extension

  // Use absolute path for entry to ensure webpack can find the file
  entries[name] = resolve(__dirname, file);
});

// ------------------------------------------------------------------------------
// Webpack Configuration
// ------------------------------------------------------------------------------

const config = {
  // Entry points - automatically discovered from src/ directory
  entry: entries,

  // Target Node.js 20 runtime (AWS Lambda current version)
  target: "node20",

  // Production mode for optimized output
  mode: "production",

  // Module processing rules
  module: {
    rules: [
      {
        // Process TypeScript and JavaScript files
        test: /\.(ts|js)$/,
        use: "ts-loader", // Use ts-loader for TypeScript compilation
        exclude: /node_modules/, // Skip node_modules for faster builds
      },
    ],
  },

  // Module resolution configuration
  resolve: {
    // File extensions to resolve automatically
    extensions: [".ts", ".js"],

    // Extension aliases for better import support
    // Allows importing .ts files with .js extension in ES modules
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
  },

  // Output configuration
  output: {
    // Use original entry name for output files
    // handlers/main -> handlers/main.js
    filename: "[name].js",

    // Output directory - matches Lambda container expectations
    path: resolve(__dirname, "dist"),

    // CommonJS format for Lambda compatibility
    libraryTarget: "commonjs2",

    // Clean output directory before each build
    clean: true,
  },

  // External dependencies - keep empty to bundle everything
  // This ensures all dependencies are included in the Lambda deployment
  externals: {
    // Add any modules that should be excluded from bundling
    // Example: "aws-sdk": "aws-sdk" (if using AWS SDK v2)
  },

  // Optimization settings
  optimization: {
    // Enable minification for smaller bundle sizes
    minimize: true,

    // Set NODE_ENV to production for optimized dependencies
    nodeEnv: "production",
  },

  // Build statistics configuration
  stats: {
    warnings: false, // Hide warnings for cleaner output
    errorDetails: true, // Show detailed error information
  },

  // Source mapping configuration
  // Set to false for production to reduce bundle size
  // Set to "source-map" for development/debugging
  devtool: false,
};

export default config;
