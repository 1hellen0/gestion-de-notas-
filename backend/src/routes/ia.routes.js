const express = require('express');
const { z } = require('zod');
const validar = require('../middlewares/validar');
const deepseek = require('../services/deepseek.service');

const router = express.Router();

const preguntaSchema = z.object({
  pregunta: z
    .string()
    .trim()
    .min(3, 'La pregunta debe tener al menos 3 caracteres')
    .max(2000, 'La pregunta no puede superar 2000 caracteres'),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     PreguntaIA:
 *       type: object
 *       required:
 *         - pregunta
 *       properties:
 *         pregunta:
 *           type: string
 *           minLength: 3
 *           maxLength: 2000
 *           description: Pregunta o texto que se enviará al modelo de DeepSeek. Se recortan los espacios al inicio y al final.
 *           example: ¿Qué es una API REST?
 *     RespuestaIA:
 *       type: object
 *       required:
 *         - respuesta
 *       properties:
 *         respuesta:
 *           type: string
 *           description: Respuesta generada por el modelo de IA.
 *           example: Una API REST es una interfaz de programación de aplicaciones...
 *         uso:
 *           type: object
 *           description: Información del uso de tokens devuelta por el SDK.
 *           properties:
 *             prompt_tokens:
 *               type: integer
 *               example: 12
 *             completion_tokens:
 *               type: integer
 *               example: 45
 *             total_tokens:
 *               type: integer
 *               example: 57
 */

/**
 * @swagger
 * /api/ia/preguntar:
 *   post:
 *     summary: Preguntar a la IA
 *     description: Envía una pregunta al modelo de DeepSeek y devuelve la respuesta generada junto con los datos de uso de tokens.
 *     tags:
 *       - IA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PreguntaIA'
 *           example:
 *             pregunta: ¿Qué es una API REST?
 *     responses:
 *       200:
 *         description: Respuesta generada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespuestaIA'
 *             example:
 *               respuesta: Una API REST es una interfaz de programación de aplicaciones...
 *               uso:
 *                 prompt_tokens: 12
 *                 completion_tokens: 45
 *                 total_tokens: 57
 *       400:
 *         description: El cuerpo no cumple el esquema de validación.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidacion'
 */
router.post('/preguntar', validar(preguntaSchema), async (req, res, next) => {
  try {
    const resultado = await deepseek.preguntar(req.body.pregunta);
    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
