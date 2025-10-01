const express = require('express');
const router = express.Router();

// Definir las rutas
router.get('/', function (req, res) {
  res.send('Lista de clientes');
});

// Exportar el router para poder utilizarlo en otros archivos
module.exports = router;
