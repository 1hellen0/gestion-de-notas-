const AppError = require('../utils/errors');
const { APIError, APIConnectionError } = require('openai');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (error instanceof APIError || error instanceof APIConnectionError) {
    const status = error.status;
    console.error('Error de API/ conexión de DeepSeek:', {
      type: error.name,
      ...(status !== undefined ? { status } : {}),
    });

    const responseStatus = status === 429 ? 429 : status >= 500 && status < 600 ? 503 : 502;
    return res.status(responseStatus).json({ error: 'IA_NO_DISPONIBLE' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;
