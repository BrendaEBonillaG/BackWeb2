const express = require('express');

const respuesta = require('../../red/respuestas')
const router = express.Router();

// Definir las rutas
router.get('/', function (req, res) {
  respuesta.success(req, res, 'Todo ok desde clientes', 200)
});

// Exportar el router para poder utilizarlo en otros archivos
module.exports = router;
