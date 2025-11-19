const { logger } = require('../../utils/logger');
const TABLA = 'Resenas';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos(filtros = {}) {
        try {
            logger.start('resenas-controller', 'Obteniendo todas las reseñas', { filtros });
            
            const todasResenas = await db.todos(TABLA);

            let reseñasFiltradas = todasResenas;
            if (filtros.LugarFK) {
                reseñasFiltradas = todasResenas.filter(resena => 
                    resena.LugarFK === parseInt(filtros.LugarFK)
                );
            }

            const reseñasActivas = reseñasFiltradas.filter(resena => 
                resena.Activo === true || resena.Activo === 1
            );

            logger.success('resenas-controller', 'Reseñas obtenidas exitosamente', {
                totalTodas: todasResenas.length,
                totalFiltradas: reseñasFiltradas.length,
                totalActivas: reseñasActivas.length,
                filtros
            });

            return reseñasActivas;
        } catch (error) {
            logger.error('resenas-controller', 'Error al obtener reseñas', error, { filtros });
            throw new Error(`Error al obtener reseñas: ${error.message}`);
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                const error = new Error('ID de reseña es requerido');
                logger.error('resenas-controller', 'Validación fallida en obtener reseña', error, { id });
                error.status = 400;
                throw error;
            }

            logger.start('resenas-controller', 'Obteniendo reseña por ID', { id });

            const reseña = await db.uno(TABLA, id);
            
            if (!reseña || reseña.length === 0) {
                const error = new Error('Reseña no encontrada');
                logger.error('resenas-controller', 'Reseña no encontrada', error, { id });
                error.status = 404;
                throw error;
            }

            if (!reseña[0].Activo) {
                const error = new Error('Reseña no disponible');
                logger.error('resenas-controller', 'Reseña inactiva', error, { id });
                error.status = 404;
                throw error;
            }

            logger.success('resenas-controller', 'Reseña obtenida exitosamente', { id });
            return reseña[0];
        } catch (error) {
            logger.error('resenas-controller', 'Error al obtener reseña por ID', error, { id });
            throw error;
        }
    }

    async function agregar(body, usuarioId) {
        try {
            logger.start('resenas-controller', 'Validando datos para agregar reseña', { 
                body, 
                usuarioId 
            });

            if (!body.Calificacion || !body.Texto || !body.Ventajas || !body.LugarFK) {
                const error = new Error('Calificacion, Texto, Ventajas y LugarFK son requeridos');
                logger.error('resenas-controller', 'Validación fallida - campos requeridos', error, { body });
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                logger.error('resenas-controller', 'Validación fallida - usuario no autenticado', error);
                error.status = 401;
                throw error;
            }

            if (body.Calificacion < 1 || body.Calificacion > 5) {
                const error = new Error('La calificación debe estar entre 1 y 5');
                logger.error('resenas-controller', 'Validación fallida - calificación inválida', error, { 
                    calificacion: body.Calificacion 
                });
                error.status = 400;
                throw error;
            }

            const reseñaData = {
                Calificacion: parseInt(body.Calificacion),
                Fecha: new Date(), 
                Texto: body.Texto.trim(),
                Ventajas: body.Ventajas.trim(),
                Recomendacion: Boolean(body.Recomendacion),
                LugarFK: parseInt(body.LugarFK),
                UsuarioFK: parseInt(usuarioId),
                Activo: true
            };

            logger.start('resenas-controller', 'Verificando existencia del lugar', { 
                LugarFK: reseñaData.LugarFK 
            });

            const lugarExistente = await db.uno('Lugar', reseñaData.LugarFK);
            if (!lugarExistente || lugarExistente.length === 0) {
                const error = new Error('El lugar especificado no existe');
                logger.error('resenas-controller', 'Lugar no encontrado', error, { 
                    LugarFK: reseñaData.LugarFK 
                });
                error.status = 404;
                throw error;
            }

            logger.start('resenas-controller', 'Verificando reseña existente del usuario', {
                UsuarioFK: reseñaData.UsuarioFK,
                LugarFK: reseñaData.LugarFK
            });

            const reseñaExistente = await db.query(TABLA, {
                UsuarioFK: reseñaData.UsuarioFK,
                LugarFK: reseñaData.LugarFK,
                Activo: true
            });

            if (reseñaExistente) {
                const error = new Error('Ya tienes una reseña para este lugar');
                logger.error('resenas-controller', 'Reseña duplicada', error, {
                    UsuarioFK: reseñaData.UsuarioFK,
                    LugarFK: reseñaData.LugarFK
                });
                error.status = 409;
                throw error;
            }

            logger.start('resenas-controller', 'Guardando nueva reseña', { reseñaData });

            const resultado = await db.agregar(TABLA, reseñaData);
            
            const insertId = resultado?.IDResenas || resultado?.dataValues?.IDResenas;

            logger.success('resenas-controller', 'Reseña agregada exitosamente', {
                IDResenas: insertId,
                UsuarioFK: reseñaData.UsuarioFK,
                LugarFK: reseñaData.LugarFK,
                Calificacion: reseñaData.Calificacion
            });
            
            return { 
                ...resultado, 
                IDResenas: insertId,
                message: 'Reseña agregada correctamente' 
            };
        } catch (error) {
            logger.error('resenas-controller', 'Error al agregar reseña', error, { body, usuarioId });
            throw error;
        }
    }

    async function actualizar(body, usuarioId) {
        try {
            logger.start('resenas-controller', 'Validando datos para actualizar reseña', { 
                body, 
                usuarioId 
            });

            if (!body.IDResenas) {
                const error = new Error('IDResenas es requerido para actualizar');
                logger.error('resenas-controller', 'Validación fallida - IDResenas requerido', error, { body });
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                logger.error('resenas-controller', 'Validación fallida - usuario no autenticado', error);
                error.status = 401;
                throw error;
            }

            logger.start('resenas-controller', 'Verificando existencia de la reseña', { 
                IDResenas: body.IDResenas 
            });

            const reseñaActual = await db.uno(TABLA, body.IDResenas);
            if (!reseñaActual || reseñaActual.length === 0) {
                const error = new Error('Reseña no encontrada');
                logger.error('resenas-controller', 'Reseña no encontrada para actualizar', error, { 
                    IDResenas: body.IDResenas 
                });
                error.status = 404;
                throw error;
            }

            if (reseñaActual[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para editar esta reseña');
                logger.error('resenas-controller', 'Validación de permisos fallida', error, {
                    IDResenas: body.IDResenas,
                    UsuarioFKReseña: reseñaActual[0].UsuarioFK,
                    UsuarioFKSolicitante: usuarioId
                });
                error.status = 403;
                throw error;
            }

            const datosActualizar = {};
            
            if (body.Calificacion !== undefined) {
                if (body.Calificacion < 1 || body.Calificacion > 5) {
                    const error = new Error('La calificación debe estar entre 1 y 5');
                    logger.error('resenas-controller', 'Validación fallida - calificación inválida', error, { 
                        calificacion: body.Calificacion 
                    });
                    error.status = 400;
                    throw error;
                }
                datosActualizar.Calificacion = parseInt(body.Calificacion);
            }
            
            if (body.Texto !== undefined) {
                datosActualizar.Texto = body.Texto.trim();
            }
            
            if (body.Ventajas !== undefined) {
                datosActualizar.Ventajas = body.Ventajas.trim();
            }
            
            if (body.Recomendacion !== undefined) {
                datosActualizar.Recomendacion = Boolean(body.Recomendacion);
            }

            datosActualizar.Fecha = new Date();

            logger.start('resenas-controller', 'Actualizando reseña', {
                IDResenas: body.IDResenas,
                datosActualizar
            });

            const resultado = await db.agregar(TABLA, {
                ...reseñaActual[0],
                ...datosActualizar,
                IDResenas: body.IDResenas
            });

            logger.success('resenas-controller', 'Reseña actualizada exitosamente', {
                IDResenas: body.IDResenas,
                camposActualizados: Object.keys(datosActualizar)
            });

            return { 
                ...resultado,
                message: 'Reseña actualizada correctamente' 
            };
        } catch (error) {
            logger.error('resenas-controller', 'Error al actualizar reseña', error, { body, usuarioId });
            throw error;
        }
    }

    async function eliminar(idResena, usuarioId) {
        try {
            logger.start('resenas-controller', 'Validando datos para eliminar reseña', { 
                idResena, 
                usuarioId 
            });

            if (!idResena) {
                const error = new Error('ID de reseña es requerido');
                logger.error('resenas-controller', 'Validación fallida - ID requerido', error, { idResena });
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                logger.error('resenas-controller', 'Validación fallida - usuario no autenticado', error);
                error.status = 401;
                throw error;
            }

            logger.start('resenas-controller', 'Verificando existencia de la reseña', { idResena });

            const reseña = await db.uno(TABLA, idResena);
            if (!reseña || reseña.length === 0) {
                const error = new Error('Reseña no encontrada');
                logger.error('resenas-controller', 'Reseña no encontrada para eliminar', error, { idResena });
                error.status = 404;
                throw error;
            }

            if (reseña[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para eliminar esta reseña');
                logger.error('resenas-controller', 'Validación de permisos fallida', error, {
                    idResena,
                    UsuarioFKReseña: reseña[0].UsuarioFK,
                    UsuarioFKSolicitante: usuarioId
                });
                error.status = 403;
                throw error;
            }

            logger.start('resenas-controller', 'Desactivando reseña (eliminación lógica)', { idResena });

            const resultado = await db.agregar(TABLA, {
                IDResenas: parseInt(idResena),
                Activo: false
            });

            logger.success('resenas-controller', 'Reseña eliminada exitosamente', { idResena });

            return { 
                affectedRows: 1,
                message: 'Reseña eliminada correctamente' 
            };
        } catch (error) {
            logger.error('resenas-controller', 'Error al eliminar reseña', error, { idResena, usuarioId });
            throw error;
        }
    }

    async function reseñasPorLugar(lugarId) {
        try {
            if (!lugarId) {
                const error = new Error('ID de lugar es requerido');
                logger.error('resenas-controller', 'Validación fallida en reseñas por lugar', error, { lugarId });
                error.status = 400;
                throw error;
            }

            logger.start('resenas-controller', 'Obteniendo reseñas por lugar', { lugarId });

            const reseñas = await todos({ LugarFK: lugarId });

            logger.success('resenas-controller', 'Reseñas por lugar obtenidas exitosamente', {
                lugarId,
                totalResenas: reseñas.length
            });
 
            return reseñas;
        } catch (error) {
            logger.error('resenas-controller', 'Error al obtener reseñas por lugar', error, { lugarId });
            throw error;
        }
    }

    async function reseñasPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                logger.error('resenas-controller', 'Validación fallida en reseñas por usuario', error, { usuarioId });
                error.status = 400;
                throw error;
            }
            
            logger.start('resenas-controller', 'Obteniendo reseñas por usuario', { usuarioId });
            
            const todasResenas = await db.todos(TABLA);
            const reseñasUsuario = todasResenas.filter(resena => 
                resena.UsuarioFK === parseInt(usuarioId) && 
                (resena.Activo === true || resena.Activo === 1)
            );

            logger.success('resenas-controller', 'Reseñas por usuario obtenidas exitosamente', {
                usuarioId,
                totalResenas: reseñasUsuario.length
            });

            return reseñasUsuario;
        } catch (error) {
            logger.error('resenas-controller', 'Error al obtener reseñas por usuario', error, { usuarioId });
            throw error;
        }
    }

    async function estadisticasPorLugar(lugarId) {
        try {
            if (!lugarId) {
                const error = new Error('ID de lugar es requerido');
                logger.error('resenas-controller', 'Validación fallida en estadísticas por lugar', error, { lugarId });
                error.status = 400;
                throw error;
            }
            
            logger.start('resenas-controller', 'Calculando estadísticas por lugar', { lugarId });
            
            const reseñas = await reseñasPorLugar(lugarId);
            
            if (reseñas.length === 0) {
                logger.success('resenas-controller', 'No hay reseñas para calcular estadísticas', { lugarId });
                return {
                    totalResenas: 0,
                    promedioCalificacion: 0,
                    porcentajeRecomendacion: 0,
                    distribucionCalificaciones: {1:0, 2:0, 3:0, 4:0, 5:0}
                };
            }

            const totalResenas = reseñas.length;
            const sumaCalificaciones = reseñas.reduce((sum, resena) => sum + resena.Calificacion, 0);
            const promedioCalificacion = (sumaCalificaciones / totalResenas).toFixed(1);
            
            const reseñasRecomendadas = reseñas.filter(resena => resena.Recomendacion).length;
            const porcentajeRecomendacion = ((reseñasRecomendadas / totalResenas) * 100).toFixed(1);

            const distribucionCalificaciones = {1:0, 2:0, 3:0, 4:0, 5:0};
            reseñas.forEach(resena => {
                distribucionCalificaciones[resena.Calificacion]++;
            });

            const estadisticas = {
                totalResenas,
                promedioCalificacion: parseFloat(promedioCalificacion),
                porcentajeRecomendacion: parseFloat(porcentajeRecomendacion),
                distribucionCalificaciones
            };

            logger.success('resenas-controller', 'Estadísticas calculadas exitosamente', {
                lugarId,
                ...estadisticas
            });

            return estadisticas;
        } catch (error) {
            logger.error('resenas-controller', 'Error al obtener estadísticas', error, { lugarId });
            throw error;
        }
    }

    return {
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
        reseñasPorLugar,
        reseñasPorUsuario,
        estadisticasPorLugar
    };
};