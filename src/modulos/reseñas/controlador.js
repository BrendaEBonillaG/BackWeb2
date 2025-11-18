const TABLA = 'Resenas';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos(filtros = {}) {
        try {
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

            return reseñasActivas;
        } catch (error) {
            console.error('Error al obtener reseñas:', error);
            throw new Error(`Error al obtener reseñas: ${error.message}`);
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                const error = new Error('ID de reseña es requerido');
                error.status = 400;
                throw error;
            }

            const reseña = await db.uno(TABLA, id);
            
            if (!reseña || reseña.length === 0) {
                const error = new Error('Reseña no encontrada');
                error.status = 404;
                throw error;
            }

            if (!reseña[0].Activo) {
                const error = new Error('Reseña no disponible');
                error.status = 404;
                throw error;
            }

            return reseña[0];
        } catch (error) {
            console.error('Error al obtener reseña:', error);
            throw error;
        }
    }

    async function agregar(body, usuarioId) {
        try {
            if (!body.Calificacion || !body.Texto || !body.Ventajas || !body.LugarFK) {
                const error = new Error('Calificacion, Texto, Ventajas y LugarFK son requeridos');
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            if (body.Calificacion < 1 || body.Calificacion > 5) {
                const error = new Error('La calificación debe estar entre 1 y 5');
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

            const lugarExistente = await db.uno('Lugar', reseñaData.LugarFK);
            if (!lugarExistente || lugarExistente.length === 0) {
                const error = new Error('El lugar especificado no existe');
                error.status = 404;
                throw error;
            }

            const reseñaExistente = await db.query(TABLA, {
                UsuarioFK: reseñaData.UsuarioFK,
                LugarFK: reseñaData.LugarFK,
                Activo: true
            });

            if (reseñaExistente) {
                const error = new Error('Ya tienes una reseña para este lugar');
                error.status = 409;
                throw error;
            }

            const resultado = await db.agregar(TABLA, reseñaData);
            
            const insertId = resultado?.IDResenas || resultado?.dataValues?.IDResenas;
            
            return { 
                ...resultado, 
                IDResenas: insertId,
                message: 'Reseña agregada correctamente' 
            };
        } catch (error) {
            console.error('Error al agregar reseña:', error);
            throw error;
        }
    }

    async function actualizar(body, usuarioId) {
        try {
            if (!body.IDResenas) {
                const error = new Error('IDResenas es requerido para actualizar');
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            const reseñaActual = await db.uno(TABLA, body.IDResenas);
            if (!reseñaActual || reseñaActual.length === 0) {
                const error = new Error('Reseña no encontrada');
                error.status = 404;
                throw error;
            }

            if (reseñaActual[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para editar esta reseña');
                error.status = 403;
                throw error;
            }

            const datosActualizar = {};
            
            if (body.Calificacion !== undefined) {
                if (body.Calificacion < 1 || body.Calificacion > 5) {
                    const error = new Error('La calificación debe estar entre 1 y 5');
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

            const resultado = await db.agregar(TABLA, {
                ...reseñaActual[0],
                ...datosActualizar,
                IDResenas: body.IDResenas
            });

            return { 
                ...resultado,
                message: 'Reseña actualizada correctamente' 
            };
        } catch (error) {
            console.error('Error al actualizar reseña:', error);
            throw error;
        }
    }

    async function eliminar(idResena, usuarioId) {
        try {
            if (!idResena) {
                const error = new Error('ID de reseña es requerido');
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            const reseña = await db.uno(TABLA, idResena);
            if (!reseña || reseña.length === 0) {
                const error = new Error('Reseña no encontrada');
                error.status = 404;
                throw error;
            }

            if (reseña[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para eliminar esta reseña');
                error.status = 403;
                throw error;
            }

            const resultado = await db.agregar(TABLA, {
                IDResenas: parseInt(idResena),
                Activo: false
            });

            return { 
                affectedRows: 1,
                message: 'Reseña eliminada correctamente' 
            };
        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            throw error;
        }
    }

    async function reseñasPorLugar(lugarId) {
        try {
            if (!lugarId) {
                const error = new Error('ID de lugar es requerido');
                error.status = 400;
                throw error;
            }

            const reseñas = await todos({ LugarFK: lugarId });
 
            return reseñas;
        } catch (error) {
            console.error('Error al obtener reseñas por lugar:', error);
            throw error;
        }
    }

    async function reseñasPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                error.status = 400;
                throw error;
            }
            
            const todasResenas = await db.todos(TABLA);
            const reseñasUsuario = todasResenas.filter(resena => 
                resena.UsuarioFK === parseInt(usuarioId) && 
                (resena.Activo === true || resena.Activo === 1)
            );

            return reseñasUsuario;
        } catch (error) {
            console.error('Error al obtener reseñas por usuario:', error);
            throw error;
        }
    }

    async function estadisticasPorLugar(lugarId) {
        try {
            if (!lugarId) {
                const error = new Error('ID de lugar es requerido');
                error.status = 400;
                throw error;
            }
            
            const reseñas = await reseñasPorLugar(lugarId);
            
            if (reseñas.length === 0) {
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

            return {
                totalResenas,
                promedioCalificacion: parseFloat(promedioCalificacion),
                porcentajeRecomendacion: parseFloat(porcentajeRecomendacion),
                distribucionCalificaciones
            };
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
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