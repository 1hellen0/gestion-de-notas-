const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Laboratorio #5 - API REST de Gestión de Notas',
      version: '1.0.0',
      description: 'API REST para gestionar notas con Express, Swagger UI y Zod',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js').replace(/\\/g, '/')],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
