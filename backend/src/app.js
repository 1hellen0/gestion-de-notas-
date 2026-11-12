const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const notasRoutes = require('./routes/notas.routes');
const iaRoutes = require('./routes/ia.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/api-docs', (req, res) => {
  const html = swaggerUi
    .generateHTML(swaggerSpec)
    .replace('<head>', '<head>\n  <base href="/api-docs/">');
  res.type('html').send(html);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API de gestion de notas activa',
  });
});

app.use('/api/notas', notasRoutes);
app.use('/api/ia', iaRoutes);

app.use(errorHandler);

module.exports = app;
