const express = require('express');
const respuesta = require('../../red/respuestas');
const controlador = require('./index');
const auth = require('../../auth');

const router = express.Router();

// Rutas principales
router.get('/', todos);
router.get('/:id', uno);
router.get('/resena/:resenaId', comentariosPorResena);
router.get('/usuario/:usuarioId', comentariosPorUsuario);
router.post('/', agregar);
router.put('/', actualizar);
router.put('/:id', eliminar);

// Obtener todos los comentarios (con filtro opcional por query params)
async function todos(req, res, next) {
  try {
    // Permitir filtros por query params: ?ResenaFK=123
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

// Obtener un comentario por ID
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

// Obtener comentarios por reseña
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

// Obtener comentarios por usuario
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

// Agregar un nuevo comentario (requiere autenticación)
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
    
    // ✅ INTENTAR DECODIFICAR EL TOKEN
    try {
      const decodificado = auth.decodificarCabecera(req);
      console.log('🔓 Token decodificado:', decodificado);
      
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
      
      // ✅ CONTINUAR CON LA LÓGICA DE AGREGAR COMENTARIO
      const resultado = await controlador.agregar(req.body, usuarioId); 
      const mensaje = 'Comentario agregado satisfactoriamente';
      respuesta.success(req, res, mensaje, 201);
      
    } catch (tokenError) {
      console.error('❌ Error al decodificar token:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    console.error('❌ Error general en agregar comentario:', error);
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

// Actualizar un comentario (solo el usuario que lo creó)
async function actualizar(req, res, next) {
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
    
    // ✅ INTENTAR DECODIFICAR EL TOKEN
    try {
      const decodificado = auth.decodificarCabecera(req);
      console.log('🔓 Token decodificado:', decodificado);
      
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
      console.log('✏️ Datos para actualizar:', req.body);
      
      // ✅ CONTINUAR CON LA LÓGICA DE ACTUALIZAR COMENTARIO
      const resultado = await controlador.actualizar(req.body, usuarioId); 
      const mensaje = 'Comentario actualizado satisfactoriamente';
      respuesta.success(req, res, mensaje, 200);
      
    } catch (tokenError) {
      console.error('❌ Error al decodificar token:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    console.error('❌ Error general en actualizar comentario:', error);
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

// Eliminar un comentario (soft delete - usando PUT)
async function eliminar(req, res, next) {
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
    
    // ✅ INTENTAR DECODIFICAR EL TOKEN
    try {
      const decodificado = auth.decodificarCabecera(req);
      console.log('🔓 Token decodificado:', decodificado);
      
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
      
      // ✅ OBTENER EL ID DEL COMENTARIO DE LOS PARÁMETROS
      const { id } = req.params;
      console.log('🗑️ ID de comentario a eliminar:', id);
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de comentario es requerido'
        });
      }

      // ✅ LLAMAR AL CONTROLADOR PARA ELIMINAR
      const resultado = await controlador.eliminar(id, usuarioId); 
      
      respuesta.success(req, res, 'Comentario eliminado satisfactoriamente', 200);
      
    } catch (tokenError) {
      console.error('❌ Error al decodificar token:', tokenError.message);
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado: ' + tokenError.message
      });
    }

  } catch (error) {
    console.error('❌ Error general en eliminar comentario:', error);
    const status = error.status || 500;
    error.status = status;
    next(error);
  }
}

module.exports = router;