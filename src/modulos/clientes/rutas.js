const express = require('express');

const respuesta = require('../../red/respuestas');
const controlador = require('./controlador');


const router = express.Router();

// Definir las rutas
router.get('/', function (req, res) {
  const todos = controlador.todos();
  respuesta.success(req, res, todos, 200)
});

// Exportar el router para poder utilizarlo en otros archivos
module.exports = router;
