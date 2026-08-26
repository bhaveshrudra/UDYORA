import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load from project root and config folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('[UDYORA Backend] WARNING: GEMINI_API_KEY environment variable is not set. GenAI agent calls will require an API key.');
} else {
  const maskedKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : '****';
  console.log(`[UDYORA Backend] GEMINI_API_KEY loaded successfully (${maskedKey}).`);
}

/**
 * Google GenAI client instance initialized with project configuration
 */
export const ai = new GoogleGenAI({
  apiKey: apiKey,
});

/**
 * Standard default model for fast reasoning and structured outputs
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';
