const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');
const auth = require('../../auth'); 

const router = express.Router();

router.get('/', todos);
router.get('/:id', uno);
router.get('/lugar/:lugarId', reseñasPorLugar);
router.get('/usuario/:usuarioId', reseñasPorUsuario);
router.get('/estadisticas/lugar/:lugarId', estadisticasPorLugar);
router.post('/', agregar);
router.put('/', actualizar);
router.put('/:id', eliminar); 

async function todos(req, res, next) {
  try {
    const filtros = {};
    if (req.query.LugarFK) {
      filtros.LugarFK = req.query.LugarFK;
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

async function reseñasPorLugar(req, res, next) {
  try {
    const { lugarId } = req.params;
    const reseñas = await controlador.reseñasPorLugar(lugarId);
    respuesta.success(req, res, reseñas, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function reseñasPorUsuario(req, res, next) {
  try {
    const { usuarioId } = req.params;
    const reseñas = await controlador.reseñasPorUsuario(usuarioId);
    respuesta.success(req, res, reseñas, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

async function estadisticasPorLugar(req, res, next) {
  try {
    const { lugarId } = req.params;
    const estadisticas = await controlador.estadisticasPorLugar(lugarId);
    respuesta.success(req, res, estadisticas, 200);
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
      const mensaje = 'Reseña agregada satisfactoriamente';
      respuesta.success(req, res, mensaje, 201);
      
    } catch (tokenError) {
      console.error('Error al decodificar token:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    console.error('Error general en agregar reseña:', error);
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

// Actualizar una reseña (solo el usuario que la creó)
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
      const mensaje = 'Reseña actualizada satisfactoriamente';
      respuesta.success(req, res, mensaje, 200);
      
    } catch (tokenError) {
      console.error('Error al decodificar token:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    console.error('Error general en actualizar reseña:', error);
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
          message: 'ID de reseña es requerido'
        });
      }

      const resultado = await controlador.eliminar(id, usuarioId); 
      
      respuesta.success(req, res, 'Reseña eliminada satisfactoriamente', 200);
      
    } catch (tokenError) {
      console.error('Error al decodificar token:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    console.error('Error general en eliminar reseña:', error);
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

module.exports = router;