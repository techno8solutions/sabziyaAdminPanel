import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Setup __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determine current environment
const NODE_ENV = process.env.NODE_ENV || "development";

// Load environment-specific .env file
const envFile = resolve(__dirname, `../.env.${NODE_ENV}`);
dotenv.config({ path: envFile });

// console.log(`✅ Using environment file: ${envFile}`);

// Dynamically import the base config
const baseConfigModule = await import(`./${NODE_ENV}.js`);
const baseConfig = baseConfigModule.default;

// console.log(`🔧 baseConfig:`, baseConfig);

// Final export
export default {
  ...baseConfig,
  env: NODE_ENV,
};
