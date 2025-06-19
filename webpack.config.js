import path, { resolve } from "path";
import { fileURLToPath } from "url";
import { glob } from "glob";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Automatically find all .ts and .js files in src directory
const entries = {};
const files = glob.sync("./src/**/*.{ts,js}");

files.forEach(file => {
  // Normalize path separators and convert file path to entry name
  // src\handlers\main.ts -> handlers/main or src/handlers/main.ts -> handlers/main
  const normalizedFile = file.replace(/\\/g, '/'); // Convert backslashes to forward slashes
  const name = normalizedFile
    .replace(/^(\.\/)?src\//, '')  // Remove ./src/ or src/ prefix
    .replace(/\.(ts|js)$/, '');    // Remove file extension
  
  // Use absolute path for entry
  entries[name] = resolve(__dirname, file);
});

const config = {
  entry: entries,
  target: "node20",
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    extensionAlias: {
      ".js": [".ts", ".js"],
    },
  },
  output: {
    filename: "[name].js",
    path: resolve(__dirname, "dist"),
    libraryTarget: "commonjs2",
    clean: true,
  },
  externals: {

  },
  optimization: {
    minimize: true,
    nodeEnv: "production",
  },
  stats: {
    warnings: false,
    errorDetails: true,
  },
  devtool: false,
};

export default config;
