const express = require('express');
const config = require('./config');

// Asegúrate de que la ruta sea correcta
const clientes = require('./modulos/clientes/rutas');

const app = express();

// Configuración
app.set('port', config.app.port);

// Rutas
app.use('/api/clientes', clientes);

module.exports = app;
