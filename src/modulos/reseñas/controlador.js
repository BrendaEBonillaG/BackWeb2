const TABLA = 'Resenas';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    // Obtener todas las reseñas (con filtro opcional por lugar)
    async function todos(filtros = {}) {
        try {
            console.log('🔍 Obteniendo todas las reseñas');
            const todasResenas = await db.todos(TABLA);
            
            // Filtrar por lugar si se especifica
            let reseñasFiltradas = todasResenas;
            if (filtros.LugarFK) {
                reseñasFiltradas = todasResenas.filter(resena => 
                    resena.LugarFK === parseInt(filtros.LugarFK)
                );
            }
            
            // Filtrar solo reseñas activas
            const reseñasActivas = reseñasFiltradas.filter(resena => 
                resena.Activo === true || resena.Activo === 1
            );

            console.log(`✅ Reseñas encontradas: ${reseñasActivas.length}`);
            return reseñasActivas;
        } catch (error) {
            console.error('❌ Error al obtener reseñas:', error);
            throw new Error(`Error al obtener reseñas: ${error.message}`);
        }
    }

    // Obtener una reseña por ID
    async function uno(id) {
        try {
            if (!id) {
                const error = new Error('ID de reseña es requerido');
                error.status = 400;
                throw error;
            }
            
            console.log(`🔍 Obteniendo reseña con ID: ${id}`);
            const reseña = await db.uno(TABLA, id);
            
            if (!reseña || reseña.length === 0) {
                const error = new Error('Reseña no encontrada');
                error.status = 404;
                throw error;
            }
            
            // Verificar que la reseña esté activa
            if (!reseña[0].Activo) {
                const error = new Error('Reseña no disponible');
                error.status = 404;
                throw error;
            }
            
            console.log('✅ Reseña encontrada:', reseña[0]);
            return reseña[0];
        } catch (error) {
            console.error('❌ Error al obtener reseña:', error);
            throw error;
        }
    }

    // Agregar una nueva reseña (solo usuario logueado)
    async function agregar(body, usuarioId) {
        try {
            // Validaciones básicas
            if (!body.Calificacion || !body.Texto || !body.Ventajas || !body.LugarFK) {
                const error = new Error('Calificacion, Texto, Ventajas y LugarFK son requeridos');
                error.status = 400;
                throw error;
            }

            // Validar que el usuario esté logueado
            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            // Validar rango de calificación (1-5)
            if (body.Calificacion < 1 || body.Calificacion > 5) {
                const error = new Error('La calificación debe estar entre 1 y 5');
                error.status = 400;
                throw error;
            }

            console.log('➕ Agregando reseña:', body);

            const reseñaData = {
                Calificacion: parseInt(body.Calificacion),
                Fecha: new Date(), // Fecha actual
                Texto: body.Texto.trim(),
                Ventajas: body.Ventajas.trim(),
                Recomendacion: Boolean(body.Recomendacion),
                LugarFK: parseInt(body.LugarFK),
                UsuarioFK: parseInt(usuarioId), // ✅ Usuario logueado
                Activo: true
            };

            // Verificar si el lugar existe
            const lugarExistente = await db.uno('Lugar', reseñaData.LugarFK);
            if (!lugarExistente || lugarExistente.length === 0) {
                const error = new Error('El lugar especificado no existe');
                error.status = 404;
                throw error;
            }

            // Verificar si el usuario ya tiene una reseña para este lugar
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
            console.log('✅ Reseña agregada exitosamente. IDResenas:', insertId);
            
            return { 
                ...resultado, 
                IDResenas: insertId,
                message: 'Reseña agregada correctamente' 
            };
        } catch (error) {
            console.error('❌ Error al agregar reseña:', error);
            throw error;
        }
    }

    // Actualizar una reseña (solo el usuario que la creó)
    async function actualizar(body, usuarioId) {
        try {
            // Validaciones básicas
            if (!body.IDResenas) {
                const error = new Error('IDResenas es requerido para actualizar');
                error.status = 400;
                throw error;
            }

            // Validar que el usuario esté logueado
            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            console.log('✏️ Actualizando reseña:', body);

            // Obtener la reseña actual
            const reseñaActual = await db.uno(TABLA, body.IDResenas);
            if (!reseñaActual || reseñaActual.length === 0) {
                const error = new Error('Reseña no encontrada');
                error.status = 404;
                throw error;
            }

            // Verificar que la reseña pertenezca al usuario logueado
            if (reseñaActual[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para editar esta reseña');
                error.status = 403;
                throw error;
            }

            // Preparar datos para actualizar
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

            // Agregar fecha de actualización
            datosActualizar.Fecha = new Date();

            const resultado = await db.agregar(TABLA, {
                ...reseñaActual[0],
                ...datosActualizar,
                IDResenas: body.IDResenas
            });

            console.log('✅ Reseña actualizada exitosamente');
            return { 
                ...resultado,
                message: 'Reseña actualizada correctamente' 
            };
        } catch (error) {
            console.error('❌ Error al actualizar reseña:', error);
            throw error;
        }
    }

    // Eliminar una reseña (soft delete - solo el usuario que la creó)
    async function eliminar(idResena, usuarioId) {
        try {
            if (!idResena) {
                const error = new Error('ID de reseña es requerido');
                error.status = 400;
                throw error;
            }

            // Validar que el usuario esté logueado
            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            console.log(`🗑️ Eliminando reseña con ID: ${idResena}`);

            // Obtener la reseña
            const reseña = await db.uno(TABLA, idResena);
            if (!reseña || reseña.length === 0) {
                const error = new Error('Reseña no encontrada');
                error.status = 404;
                throw error;
            }

            // Verificar que la reseña pertenezca al usuario logueado
            if (reseña[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para eliminar esta reseña');
                error.status = 403;
                throw error;
            }

            // ✅ CORRECCIÓN: Solo enviar los campos necesarios para el soft delete
            const resultado = await db.agregar(TABLA, {
                IDResenas: parseInt(idResena),
                Activo: false
                // ✅ NO incluir los otros campos para evitar que se actualicen
            });

            console.log('✅ Reseña eliminada exitosamente');
            return { 
                affectedRows: 1,
                message: 'Reseña eliminada correctamente' 
            };
        } catch (error) {
            console.error('❌ Error al eliminar reseña:', error);
            throw error;
        }
    }

    // Obtener reseñas por lugar (para mostrar en ventana)
    async function reseñasPorLugar(lugarId) {
        try {
            if (!lugarId) {
                const error = new Error('ID de lugar es requerido');
                error.status = 400;
                throw error;
            }

            console.log(`🔍 Obteniendo reseñas para el lugar: ${lugarId}`);
            
            // Usar la función todos con filtro por lugar
            const reseñas = await todos({ LugarFK: lugarId });
            
            console.log(`✅ Reseñas encontradas para el lugar ${lugarId}: ${reseñas.length}`);
            return reseñas;
        } catch (error) {
            console.error('❌ Error al obtener reseñas por lugar:', error);
            throw error;
        }
    }

    // Obtener reseñas por usuario
    async function reseñasPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                error.status = 400;
                throw error;
            }

            console.log(`🔍 Obteniendo reseñas del usuario: ${usuarioId}`);
            
            const todasResenas = await db.todos(TABLA);
            const reseñasUsuario = todasResenas.filter(resena => 
                resena.UsuarioFK === parseInt(usuarioId) && 
                (resena.Activo === true || resena.Activo === 1)
            );

            console.log(`✅ Reseñas del usuario ${usuarioId}: ${reseñasUsuario.length}`);
            return reseñasUsuario;
        } catch (error) {
            console.error('❌ Error al obtener reseñas por usuario:', error);
            throw error;
        }
    }

    // Obtener estadísticas de reseñas por lugar
    async function estadisticasPorLugar(lugarId) {
        try {
            if (!lugarId) {
                const error = new Error('ID de lugar es requerido');
                error.status = 400;
                throw error;
            }

            console.log(`📊 Obteniendo estadísticas para el lugar: ${lugarId}`);
            
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
            
            // Distribución de calificaciones
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
            console.error('❌ Error al obtener estadísticas:', error);
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