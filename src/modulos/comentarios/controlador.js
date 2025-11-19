const { logger } = require('../../utils/logger'); // ✅ IMPORTAR LOGGER
const TABLA = 'Comentarios';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos(filtros = {}) {
        try {
            logger.start('comentarios', 'Obteniendo todos los comentarios', { filtros });
            
            const todosComentarios = await db.todos(TABLA);
            
            let comentariosFiltrados = todosComentarios;
            if (filtros.ResenaFK) {
                comentariosFiltrados = todosComentarios.filter(comentario => 
                    comentario.ResenaFK === parseInt(filtros.ResenaFK)
                );
            }
            
            const comentariosActivos = comentariosFiltrados.filter(comentario => 
                comentario.Activo === true || comentario.Activo === 1
            );

            logger.success('comentarios', 'Comentarios obtenidos exitosamente', {
                total: todosComentarios.length,
                filtrados: comentariosFiltrados.length,
                activos: comentariosActivos.length,
                resenaFK: filtros.ResenaFK || 'todas'
            });

            return comentariosActivos;
        } catch (error) {
            logger.error('comentarios', 'Error al obtener comentarios', error, { filtros });
            throw new Error(`Error al obtener comentarios: ${error.message}`);
        }
    }

    async function uno(id) {
        try {
            logger.start('comentarios', 'Obteniendo comentario específico', { id });
            
            if (!id) {
                const error = new Error('ID de comentario es requerido');
                error.status = 400;
                logger.error('comentarios', 'Validación fallida en obtener comentario', error);
                throw error;
            }
            
            const comentario = await db.uno(TABLA, id);
            
            if (!comentario || comentario.length === 0) {
                const error = new Error('Comentario no encontrado');
                error.status = 404;
                logger.error('comentarios', 'Comentario no encontrado', error, { id });
                throw error;
            }
            
            if (!comentario[0].Activo) {
                const error = new Error('Comentario no disponible');
                error.status = 404;
                logger.error('comentarios', 'Comentario inactivo', error, { id });
                throw error;
            }

            logger.success('comentarios', 'Comentario encontrado', {
                id: id,
                usuarioFK: comentario[0].UsuarioFK,
                resenaFK: comentario[0].ResenaFK
            });
        
            return comentario[0];
        } catch (error) {
            logger.error('comentarios', 'Error al obtener comentario', error, { id });
            throw error;
        }
    }

    async function agregar(body, usuarioId) {
        try {
            logger.start('comentarios', 'Agregando nuevo comentario', { 
                usuarioId, 
                resenaFK: body.ResenaFK,
                longitudTexto: body.Texto?.length || 0
            });

            if (!body.Texto || !body.ResenaFK) {
                const error = new Error('Texto y ResenaFK son requeridos');
                error.status = 400;
                logger.error('comentarios', 'Validación fallida en agregar comentario', error, {
                    tieneTexto: !!body.Texto,
                    tieneResenaFK: !!body.ResenaFK
                });
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                logger.error('comentarios', 'Usuario no autenticado', error);
                throw error;
            }

            const comentarioData = {
                Texto: body.Texto.trim(),
                Fecha: new Date(), 
                UsuarioFK: parseInt(usuarioId), 
                ResenaFK: parseInt(body.ResenaFK),
                Activo: true
            };

            // Verificar si la reseña existe
            logger.db('SELECT_ONE', 'Resenas', { id: comentarioData.ResenaFK });
            const reseñaExistente = await db.uno('Resenas', comentarioData.ResenaFK);
            
            if (!reseñaExistente || reseñaExistente.length === 0) {
                const error = new Error('La reseña especificada no existe');
                error.status = 404;
                logger.error('comentarios', 'Reseña no encontrada', error, {
                    resenaFK: comentarioData.ResenaFK
                });
                throw error;
            }

            if (!reseñaExistente[0].Activo) {
                const error = new Error('No se puede comentar en una reseña eliminada');
                error.status = 400;
                logger.error('comentarios', 'Reseña inactiva', error, {
                    resenaFK: comentarioData.ResenaFK,
                    reseñaActiva: false
                });
                throw error;
            }

            logger.success('comentarios', 'Reseña validada correctamente', {
                resenaFK: comentarioData.ResenaFK,
                reseñaActiva: true
            });

            const resultado = await db.agregar(TABLA, comentarioData);
            
            const insertId = resultado?.IDComentarios || resultado?.dataValues?.IDComentarios;
            
            logger.success('comentarios', 'Comentario agregado exitosamente', {
                comentarioId: insertId,
                usuarioId: usuarioId,
                resenaFK: body.ResenaFK
            });
            
            return { 
                ...resultado, 
                IDComentarios: insertId,
                message: 'Comentario agregado correctamente' 
            };
        } catch (error) {
            logger.error('comentarios', 'Error al agregar comentario', error, {
                usuarioId,
                resenaFK: body.ResenaFK
            });
            throw error;
        }
    }

    async function actualizar(body, usuarioId) {
        try {
            logger.start('comentarios', 'Actualizando comentario', { 
                comentarioId: body.IDComentarios,
                usuarioId: usuarioId,
                tieneNuevoTexto: !!body.Texto
            });

            if (!body.IDComentarios) {
                const error = new Error('IDComentarios es requerido para actualizar');
                error.status = 400;
                logger.error('comentarios', 'Validación fallida en actualizar comentario', error);
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                logger.error('comentarios', 'Usuario no autenticado', error);
                throw error;
            }

            const comentarioActual = await db.uno(TABLA, body.IDComentarios);
            if (!comentarioActual || comentarioActual.length === 0) {
                const error = new Error('Comentario no encontrado');
                error.status = 404;
                logger.error('comentarios', 'Comentario no encontrado para actualizar', error, {
                    comentarioId: body.IDComentarios
                });
                throw error;
            }

            if (comentarioActual[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para editar este comentario');
                error.status = 403;
                logger.error('comentarios', 'Permiso denegado para actualizar comentario', error, {
                    comentarioId: body.IDComentarios,
                    usuarioSolicitante: usuarioId,
                    usuarioPropietario: comentarioActual[0].UsuarioFK
                });
                throw error;
            }

            const datosActualizar = {
                Fecha: new Date() 
            };
            
            if (body.Texto !== undefined) {
                if (!body.Texto.trim()) {
                    const error = new Error('El texto no puede estar vacío');
                    error.status = 400;
                    logger.error('comentarios', 'Texto vacío en actualización', error);
                    throw error;
                }
                datosActualizar.Texto = body.Texto.trim();
            }

            const resultado = await db.agregar(TABLA, {
                ...comentarioActual[0],
                ...datosActualizar,
                IDComentarios: body.IDComentarios
            });

            logger.success('comentarios', 'Comentario actualizado exitosamente', {
                comentarioId: body.IDComentarios,
                usuarioId: usuarioId
            });

            return { 
                ...resultado,
                message: 'Comentario actualizado correctamente' 
            };
        } catch (error) {
            logger.error('comentarios', 'Error al actualizar comentario', error, {
                comentarioId: body.IDComentarios,
                usuarioId: usuarioId
            });
            throw error;
        }
    }

    async function eliminar(idComentario, usuarioId) {
        try {
            logger.start('comentarios', 'Eliminando comentario', { 
                comentarioId: idComentario,
                usuarioId: usuarioId
            });

            if (!idComentario) {
                const error = new Error('ID de comentario es requerido');
                error.status = 400;
                logger.error('comentarios', 'Validación fallida en eliminar comentario', error);
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                logger.error('comentarios', 'Usuario no autenticado', error);
                throw error;
            }

            const comentario = await db.uno(TABLA, idComentario);
            if (!comentario || comentario.length === 0) {
                const error = new Error('Comentario no encontrado');
                error.status = 404;
                logger.error('comentarios', 'Comentario no encontrado para eliminar', error, {
                    comentarioId: idComentario
                });
                throw error;
            }

            if (comentario[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para eliminar este comentario');
                error.status = 403;
                logger.error('comentarios', 'Permiso denegado para eliminar comentario', error, {
                    comentarioId: idComentario,
                    usuarioSolicitante: usuarioId,
                    usuarioPropietario: comentario[0].UsuarioFK
                });
                throw error;
            }

            const resultado = await db.agregar(TABLA, {
                IDComentarios: parseInt(idComentario),
                Activo: false
            });

            logger.success('comentarios', 'Comentario eliminado exitosamente', {
                comentarioId: idComentario,
                usuarioId: usuarioId
            });

            return { 
                affectedRows: 1,
                message: 'Comentario eliminado correctamente' 
            };
        } catch (error) {
            logger.error('comentarios', 'Error al eliminar comentario', error, {
                comentarioId: idComentario,
                usuarioId: usuarioId
            });
            throw error;
        }
    }

    async function comentariosPorResena(resenaId) {
        try {
            logger.start('comentarios', 'Obteniendo comentarios por reseña', { resenaId });
            
            if (!resenaId) {
                const error = new Error('ID de reseña es requerido');
                error.status = 400;
                logger.error('comentarios', 'Validación fallida en comentarios por reseña', error);
                throw error;
            }

            const comentarios = await todos({ ResenaFK: resenaId });
            
            logger.success('comentarios', 'Comentarios por reseña obtenidos', {
                resenaId: resenaId,
                cantidad: comentarios.length
            });
            
            return comentarios;
        } catch (error) {
            logger.error('comentarios', 'Error al obtener comentarios por reseña', error, {
                resenaId: resenaId
            });
            throw error;
        }
    }

    async function comentariosPorUsuario(usuarioId) {
        try {
            logger.start('comentarios', 'Obteniendo comentarios por usuario', { usuarioId });
            
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                error.status = 400;
                logger.error('comentarios', 'Validación fallida en comentarios por usuario', error);
                throw error;
            }
   
            const todosComentarios = await db.todos(TABLA);
            const comentariosUsuario = todosComentarios.filter(comentario => 
                comentario.UsuarioFK === parseInt(usuarioId) && 
                (comentario.Activo === true || comentario.Activo === 1)
            );

            logger.success('comentarios', 'Comentarios por usuario obtenidos', {
                usuarioId: usuarioId,
                cantidad: comentariosUsuario.length
            });

            return comentariosUsuario;
        } catch (error) {
            logger.error('comentarios', 'Error al obtener comentarios por usuario', error, {
                usuarioId: usuarioId
            });
            throw error;
        }
    }

    return {
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
        comentariosPorResena,
        comentariosPorUsuario
    };
};