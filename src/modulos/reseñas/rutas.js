const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');
const auth = require('../../auth'); // ✅ IMPORTAR TU AUTH

const router = express.Router();

// Rutas principales
router.get('/', todos);
router.get('/:id', uno);
router.get('/lugar/:lugarId', reseñasPorLugar);
router.get('/usuario/:usuarioId', reseñasPorUsuario);
router.get('/estadisticas/lugar/:lugarId', estadisticasPorLugar);
router.post('/', agregar);
router.put('/', actualizar);
router.delete('/:id', eliminar);

// Obtener todas las reseñas (con filtro opcional por query params)
async function todos(req, res, next) {
  try {
    // Permitir filtros por query params: ?LugarFK=123
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

// Obtener una reseña por ID
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

// Obtener reseñas por lugar (para mostrar en ventana)
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

// Obtener reseñas por usuario
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

// Obtener estadísticas de reseñas por lugar
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

// Agregar una nueva reseña (requiere autenticación)
async function agregar(req, res, next) {
  try {
    console.log('🔐 HEADERS COMPLETOS:', JSON.stringify(req.headers, null, 2));
    console.log('🔐 Authorization header:', req.headers.authorization);

    // ✅ VERIFICAR SI EL TOKEN LLEGA CORRECTAMENTE
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ No hay header Authorization');
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado - No hay token'
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Formato incorrecto del token');
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Debe ser: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔐 Token recibido:', token ? '✅' : '❌ NO HAY TOKEN');
    
    // ✅ INTENTAR DECODIFICAR EL TOKEN CON TU SISTEMA AUTH
    try {
      const decodificado = auth.decodificarCabecera(req);
      console.log('🔓 Token decodificado:', decodificado);
      
      // ✅ OBTENER IDUsuario DEL TOKEN DECODIFICADO
      const usuarioId = decodificado.IDUsuario;
      console.log('👤 ID Usuario extraído:', usuarioId);
      
      if (!usuarioId) {
        console.log('❌ No se encontró IDUsuario en el token');
        return res.status(401).json({
          success: false,
          message: 'Token inválido - No contiene ID de usuario'
        });
      }

      console.log('✅ Usuario autenticado correctamente. ID:', usuarioId);
      
      // ✅ CONTINUAR CON LA LÓGICA DE AGREGAR RESEÑA
      const resultado = await controlador.agregar(req.body, usuarioId); 
      const mensaje = 'Reseña agregada satisfactoriamente';
      respuesta.success(req, res, mensaje, 201);
      
    } catch (tokenError) {
      console.error('❌ Error al decodificar token:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    console.error('❌ Error general en agregar reseña:', error);
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

// Actualizar una reseña (solo el usuario que la creó)
async function actualizar(req, res, next) {
  try {
    // ✅ USAR TU SISTEMA DE AUTH EXISTENTE
    const decodificado = auth.decodificarCabecera(req);
    const usuarioId = decodificado.IDUsuario;
    
    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    console.log(`👤 Usuario autenticado ID: ${usuarioId} actualizando reseña`);
    
    const resultado = await controlador.actualizar(req.body, usuarioId); 
    const mensaje = 'Reseña actualizada satisfactoriamente';
    respuesta.success(req, res, mensaje, 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

// Eliminar una reseña (soft delete - solo el usuario que la creó)
async function eliminar(req, res, next) {
  try {
    // ✅ USAR TU SISTEMA DE AUTH EXISTENTE
    const decodificado = auth.decodificarCabecera(req);
    const usuarioId = decodificado.IDUsuario;
    
    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    console.log(`👤 Usuario autenticado ID: ${usuarioId} eliminando reseña`);
    
    const { id } = req.params;
    const resultado = await controlador.eliminar(id, usuarioId); 
    
    respuesta.success(req, res, 'Reseña eliminada satisfactoriamente', 200);
  } catch (error) {
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

module.exports = router;