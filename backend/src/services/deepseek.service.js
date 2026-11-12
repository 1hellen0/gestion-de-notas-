const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

/**
 * Consulta el modelo de DeepSeek a través del SDK de OpenAI.
 *
 * @param {string} texto - Mensaje proporcionado por el usuario.
 * @param {string} [system] - Mensaje de sistema (opcional).
 * @returns {Promise<{respuesta: string, uso: any}>}
 */
async function preguntar(texto, system = 'Eres un asistente útil. Responde en español.') {
  const promptSistema = system || 'Eres un asistente útil. Responde en español.';

  const completion = await openai.chat.completions.create({
    model: process.env.DEEPSEEK_MODEL,
    messages: [
      { role: 'system', content: promptSistema },
      { role: 'user', content: texto },
    ],
    max_tokens: 1024,
    stream: false,
  });

  return {
    respuesta: completion?.choices?.[0]?.message?.content || '',
    uso: completion?.usage,
  };
}

preguntar.preguntar = preguntar;
module.exports = preguntar;
