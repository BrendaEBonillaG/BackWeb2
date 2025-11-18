const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');

const router = express.Router();

router.get('/', todos);
router.get('/:id', uno);
router.get('/usuario/:usuarioId', favoritosPorUsuario);
router.get('/usuario/:usuarioId/lugares', lugaresFavoritosUsuario);
router.get('/verificar/:usuarioId/:lugarId', verificarFavorito);
router.post('/', agregar);
router.put('/', eliminar); 
router.put('/:idFavorito', eliminarPorId); 

async function todos(req, res, next) {
  try {
    const items = await controlador.todos(); 
    respuesta.success(req, res, items, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function uno(req, res, next) {
  try {
    const item = await controlador.uno(req.params.id); 
    respuesta.success(req, res, item, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error); 
  }
}

async function favoritosPorUsuario(req, res, next) {
  try {
    const favoritos = await controlador.favoritosPorUsuario(req.params.usuarioId);
    respuesta.success(req, res, favoritos, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function lugaresFavoritosUsuario(req, res, next) {
  try {
    const lugaresFavoritos = await controlador.lugaresFavoritosPorUsuario(req.params.usuarioId);
    respuesta.success(req, res, lugaresFavoritos, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function verificarFavorito(req, res, next) {
  try {
    const resultado = await controlador.esFavorito(req.params.usuarioId, req.params.lugarId);
    respuesta.success(req, res, resultado, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function agregar(req, res, next) {
  try {
    const resultado = await controlador.agregar(req.body); 
    const mensaje = 'Favorito agregado satisfactoriamente';
    respuesta.success(req, res, mensaje, 201);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const resultado = await controlador.eliminar(req.body); 
    
    if (resultado.affectedRows === 0) {
      respuesta.success(req, res, 'El favorito ya estaba eliminado o no existe', 200);
    } else {
      respuesta.success(req, res, 'Favorito eliminado satisfactoriamente', 200);
    }
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function eliminarPorId(req, res, next) {
  try {
    const resultado = await controlador.eliminarPorId(req.params.idFavorito); 
    
    if (resultado.affectedRows === 0) {
      respuesta.success(req, res, 'El favorito ya estaba eliminado o no existe', 200);
    } else {
      respuesta.success(req, res, 'Favorito eliminado satisfactoriamente', 200);
    }
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

module.exports = router;