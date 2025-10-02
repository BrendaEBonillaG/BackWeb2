const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./controlador');

const router = express.Router();

router.get('/',todos);
router.get('/:id', uno);

router.put('/', eliminar);

// Definir las rutas
async function todos (req, res, next) {
  try {
    const todos = await controlador.todos(); 
    respuesta.success(req, res, todos, 200);
  } catch (error) {
    next(err);
  }
};

async function uno (req, res, next) {
  try {
    const todos = await controlador.uno(req.params.id); 
    respuesta.success(req, res, todos, 200);
  } catch (error) {
    next(err); 
  }
};


async function eliminar (req, res, next) {
  try {
    const todos = await controlador.eliminar(req.body); 
    respuesta.success(req, res, 'item eliminado satisfactoriamente', 200);
  } catch (error) {
    next(err);
  }
};

module.exports = router;
