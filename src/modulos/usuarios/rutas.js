const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const router = express.Router();

router.get('/',todos);
router.get('/:id', uno);
router.post('/', agregar);
router.put('/', eliminar);

// Definir las rutas
async function todos (req, res, next) {
  try {
    const items = await controlador.todos(); 
    respuesta.success(req, res, items, 200);
  } catch (error) {
    next(error); // ← CORREGIDO
  }
};

async function uno (req, res, next) {
  try {
    const item = await controlador.uno(req.params.id); 
    respuesta.success(req, res, item, 200);
  } catch (error) {
    next(error); // ← CORREGIDO
  }
};

async function agregar (req, res, next) {
  try {
    const resultado = await controlador.agregar(req.body); 
    let mensaje = ''; // ← Agrega 'let' aquí
    if(req.body.IDUsuario == 0){
      mensaje = 'item agregado satisfactoriamente';
    }else{
      mensaje = 'item modificado satisfactoriamente';
    }
    respuesta.success(req, res, mensaje, 201);
  } catch (error) {
    next(error);
  }
};

async function eliminar (req, res, next) {
  try {
    const resultado = await controlador.eliminar(req.body); 
    
    if (resultado.affectedRows === 0) {
      respuesta.success(req, res, 'El registro ya estaba eliminado o no existe', 200);
    } else {
      respuesta.success(req, res, 'Item eliminado satisfactoriamente', 200);
    }
    
  } catch (error) {
    next(error);
  }
};

module.exports = router;
