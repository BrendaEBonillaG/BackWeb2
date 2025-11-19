const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');
const auth = require('../../auth');

const router = express.Router();

router.get('/', todos);
router.get('/:id', uno);
router.get('/resena/:resenaId', comentariosPorResena);
router.get('/usuario/:usuarioId', comentariosPorUsuario);
router.post('/', agregar);
router.put('/', actualizar);
router.put('/:id', eliminar);

async function todos(req, res, next) {
  try {
    const filtros = {};
    if (req.query.ResenaFK) {
      filtros.ResenaFK = req.query.ResenaFK;
    }
    
    const items = await controlador.todos(filtros); 
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

async function comentariosPorResena(req, res, next) {
  try {
    const { resenaId } = req.params;
    const comentarios = await controlador.comentariosPorResena(resenaId);
    respuesta.success(req, res, comentarios, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function comentariosPorUsuario(req, res, next) {
  try {
    const { usuarioId } = req.params;
    const comentarios = await controlador.comentariosPorUsuario(usuarioId);
    respuesta.success(req, res, comentarios, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function agregar(req, res, next) {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado - No hay token'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Debe ser: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodificado = auth.decodificarCabecera(req);
      
      const usuarioId = decodificado.IDUsuario;
      
      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - No contiene ID de usuario'
        });
      }
      
      const resultado = await controlador.agregar(req.body, usuarioId); 
      const mensaje = 'Comentario agregado satisfactoriamente';
      respuesta.success(req, res, mensaje, 201);
      
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado - No hay token'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Debe ser: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodificado = auth.decodificarCabecera(req);
      
      const usuarioId = decodificado.IDUsuario;
      
      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - No contiene ID de usuario'
        });
      }

      const resultado = await controlador.actualizar(req.body, usuarioId); 
      const mensaje = 'Comentario actualizado satisfactoriamente';
      respuesta.success(req, res, mensaje, 200);
      
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado - No hay token'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Debe ser: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decodificado = auth.decodificarCabecera(req);
      
      const usuarioId = decodificado.IDUsuario;
      
      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido - No contiene ID de usuario'
        });
      }

      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de comentario es requerido'
        });
      }
      const resultado = await controlador.eliminar(id, usuarioId); 
      
      respuesta.success(req, res, 'Comentario eliminado satisfactoriamente', 200);
      
    } catch (tokenError) {
      console.error('Error al decodificar token:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    console.error('Error general en eliminar comentario:', error);
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

module.exports = router;