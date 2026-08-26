import { ai, DEFAULT_GEMINI_MODEL } from './config/gemini.js';

async function testGeminiDirect() {
  console.log(`[Test] Sending test prompt to model: ${DEFAULT_GEMINI_MODEL}...`);
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: 'Respond with a one-sentence greeting in Hindi and English for UDYORA rural entrepreneur platform.',
    });
    console.log('[Test] Response received:');
    console.log(response.text);
    console.log('[Test] Gemini API connection successful!');
  } catch (error: any) {
    console.error('[Test] Gemini API call error:', error);
  }
}

testGeminiDirect();
