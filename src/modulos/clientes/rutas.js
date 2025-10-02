const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./controlador');

const router = express.Router();

// Definir las rutas
router.get('/', async function (req, res) {
  try {
    const todos = await controlador.todos(); 
    respuesta.success(req, res, todos, 200);
  } catch (error) {
    respuesta.error(req, res, 'Error al obtener los datos', 500); 
  }
});

router.get('/:id', async function (req, res) {
  try {
    const todos = await controlador.uno(req.params.id); 
    respuesta.success(req, res, todos, 200);
  } catch (error) {
    respuesta.error(req, res, 'Error al obtener los datos', 500); 
  }
});


module.exports = router;
