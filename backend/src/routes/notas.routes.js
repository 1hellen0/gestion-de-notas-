const express = require('express');
const { z } = require('zod');
const validar = require('../middlewares/validar');
const notasService = require('../services/notas.service');
const deepseek = require('../services/deepseek.service');

const router = express.Router();

const notaSchema = z.object({
  titulo: z.string().trim().min(1, 'El título es obligatorio').max(100, 'El título no puede superar 100 caracteres'),
  contenido: z.string().trim().min(1, 'El contenido es obligatorio').max(5000, 'El contenido no puede superar 5000 caracteres'),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Nota:
 *       type: object
 *       required:
 *         - id
 *         - titulo
 *         - contenido
 *       properties:
 *         id:
 *           type: integer
 *           description: Identificador numérico generado por la API.
 *           example: 1
 *         titulo:
 *           type: string
 *           example: Mi primera nota
 *         contenido:
 *           type: string
 *           example: Contenido de ejemplo.
 *     CrearNota:
 *       type: object
 *       required:
 *         - titulo
 *         - contenido
 *       properties:
 *         titulo:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Se recortan los espacios al inicio y al final; no puede quedar vacío.
 *           example: Mi primera nota
 *         contenido:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           description: Se recortan los espacios al inicio y al final; no puede quedar vacío.
 *           example: Contenido de ejemplo.
 *     ErrorValidacion:
 *       type: object
 *       required:
 *         - errores
 *       properties:
 *         errores:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProblemaValidacion'
 *       example:
 *         errores:
 *           - code: too_small
 *             path:
 *               - titulo
 *             message: El título es obligatorio
 *     ProblemaValidacion:
 *       type: object
 *       required:
 *         - code
 *         - path
 *         - message
 *       properties:
 *         code:
 *           type: string
 *           description: Código del problema devuelto por Zod.
 *           example: too_small
 *         path:
 *           type: array
 *           items:
 *             oneOf:
 *               - type: string
 *               - type: integer
 *           description: Ruta de la propiedad que produjo el problema.
 *           example:
 *             - titulo
 *         message:
 *           type: string
 *           example: El título es obligatorio
 *       additionalProperties: true
 *     ErrorNotaNoEncontrada:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           example: Nota no encontrada
 *     ResumenNota:
 *       type: object
 *       required:
 *         - notaId
 *         - resumen
 *       properties:
 *         notaId:
 *           type: integer
 *           description: Identificador numérico de la nota resumida.
 *           example: 1
 *         resumen:
 *           type: string
 *           description: Resumen en 3 viñetas breves generado por el modelo de IA.
 *           example: "- Primer punto clave\n- Segundo punto clave\n- Tercer punto clave"
 */

/**
 * @swagger
 * /api/notas:
 *   get:
 *     summary: Listar notas
 *     description: Devuelve todas las notas almacenadas en memoria.
 *     tags:
 *       - Notas
 *     responses:
 *       200:
 *         description: Lista de notas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Nota'
 *             example:
 *               - id: 1
 *                 titulo: Mi primera nota
 *                 contenido: Contenido de ejemplo.
 */
router.get('/', (req, res) => {
  res.status(200).json(notasService.listar());
});

/**
 * @swagger
 * /api/notas/{id}:
 *   get:
 *     summary: Obtener nota por ID
 *     description: Busca una nota por su identificador numérico. Un ID inexistente devuelve 404.
 *     tags:
 *       - Notas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador numérico de la nota.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Nota encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *             example:
 *               id: 1
 *               titulo: Mi primera nota
 *               contenido: Contenido de ejemplo.
 *       404:
 *         description: No existe una nota con ese ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotaNoEncontrada'
 *             example:
 *               error: Nota no encontrada
 */
router.get('/:id', (req, res) => {
  const nota = notasService.buscar(req.params.id);
  return res.status(200).json(nota);
});

/**
 * @swagger
 * /api/notas:
 *   post:
 *     summary: Crear nota
 *     description: Crea una nota en memoria. Los espacios al inicio y al final de ambos textos se recortan.
 *     tags:
 *       - Notas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearNota'
 *           example:
 *             titulo: Mi primera nota
 *             contenido: Contenido de ejemplo.
 *     responses:
 *       201:
 *         description: Nota creada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Nota'
 *             example:
 *               id: 1
 *               titulo: Mi primera nota
 *               contenido: Contenido de ejemplo.
 *       400:
 *         description: El cuerpo no cumple el esquema de validación.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorValidacion'
 */
router.post('/', validar(notaSchema), (req, res) => {
  const nota = notasService.crear(req.body);
  return res.status(201).json(nota);
});

/**
 * @swagger
 * /api/notas/{id}:
 *   delete:
 *     summary: Eliminar nota
 *     description: Elimina una nota por su identificador numérico.
 *     tags:
 *       - Notas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador numérico de la nota.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       204:
 *         description: Nota eliminada; la respuesta no tiene cuerpo.
 *       404:
 *         description: No existe una nota con ese ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotaNoEncontrada'
 *             example:
 *               error: Nota no encontrada
 */
router.delete('/:id', (req, res) => {
  notasService.eliminar(req.params.id);
  return res.status(204).end();
});

/**
 * @swagger
 * /api/notas/{id}/resumen:
 *   post:
 *     summary: Resumir nota con IA
 *     description: Genera un resumen del contenido de una nota en 3 viñetas breves utilizando DeepSeek.
 *     tags:
 *       - Notas
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Identificador numérico de la nota.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *     responses:
 *       200:
 *         description: Resumen generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumenNota'
 *             example:
 *               notaId: 1
 *               resumen: "- Primer punto clave\n- Segundo punto clave\n- Tercer punto clave"
 *       404:
 *         description: No existe una nota con ese ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotaNoEncontrada'
 *             example:
 *               error: Nota no encontrada
 */
router.post('/:id/resumen', async (req, res, next) => {
  try {
    const nota = notasService.buscar(req.params.id);
    const resultado = await deepseek.preguntar(
      nota.contenido,
      'Resume el texto en 3 viñetas breves, en español.'
    );
    return res.status(200).json({
      notaId: nota.id,
      resumen: resultado.respuesta,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
