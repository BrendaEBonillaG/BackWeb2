const TABLA = 'Comentarios';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos(filtros = {}) {
        try {
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

            return comentariosActivos;
        } catch (error) {
            console.error('Error al obtener comentarios:', error);
            throw new Error(`Error al obtener comentarios: ${error.message}`);
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                const error = new Error('ID de comentario es requerido');
                error.status = 400;
                throw error;
            }
            
            const comentario = await db.uno(TABLA, id);
            
            if (!comentario || comentario.length === 0) {
                const error = new Error('Comentario no encontrado');
                error.status = 404;
                throw error;
            }
            
            if (!comentario[0].Activo) {
                const error = new Error('Comentario no disponible');
                error.status = 404;
                throw error;
            }
        
            return comentario[0];
        } catch (error) {
            console.error('Error al obtener comentario:', error);
            throw error;
        }
    }

    async function agregar(body, usuarioId) {
        try {
            if (!body.Texto || !body.ResenaFK) {
                const error = new Error('Texto y ResenaFK son requeridos');
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            const comentarioData = {
                Texto: body.Texto.trim(),
                Fecha: new Date(), 
                UsuarioFK: parseInt(usuarioId), 
                ResenaFK: parseInt(body.ResenaFK),
                Activo: true
            };

            const reseñaExistente = await db.uno('Resenas', comentarioData.ResenaFK);
            if (!reseñaExistente || reseñaExistente.length === 0) {
                const error = new Error('La reseña especificada no existe');
                error.status = 404;
                throw error;
            }

            if (!reseñaExistente[0].Activo) {
                const error = new Error('No se puede comentar en una reseña eliminada');
                error.status = 400;
                throw error;
            }

            const resultado = await db.agregar(TABLA, comentarioData);
            
            const insertId = resultado?.IDComentarios || resultado?.dataValues?.IDComentarios;
            
            return { 
                ...resultado, 
                IDComentarios: insertId,
                message: 'Comentario agregado correctamente' 
            };
        } catch (error) {
            console.error('Error al agregar comentario:', error);
            throw error;
        }
    }

    async function actualizar(body, usuarioId) {
        try {
            if (!body.IDComentarios) {
                const error = new Error('IDComentarios es requerido para actualizar');
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            const comentarioActual = await db.uno(TABLA, body.IDComentarios);
            if (!comentarioActual || comentarioActual.length === 0) {
                const error = new Error('Comentario no encontrado');
                error.status = 404;
                throw error;
            }

            if (comentarioActual[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para editar este comentario');
                error.status = 403;
                throw error;
            }

            const datosActualizar = {
                Fecha: new Date() 
            };
            
            if (body.Texto !== undefined) {
                if (!body.Texto.trim()) {
                    const error = new Error('El texto no puede estar vacío');
                    error.status = 400;
                    throw error;
                }
                datosActualizar.Texto = body.Texto.trim();
            }

            const resultado = await db.agregar(TABLA, {
                ...comentarioActual[0],
                ...datosActualizar,
                IDComentarios: body.IDComentarios
            });

            return { 
                ...resultado,
                message: 'Comentario actualizado correctamente' 
            };
        } catch (error) {
            console.error('Error al actualizar comentario:', error);
            throw error;
        }
    }

    async function eliminar(idComentario, usuarioId) {
        try {
            if (!idComentario) {
                const error = new Error('ID de comentario es requerido');
                error.status = 400;
                throw error;
            }

            if (!usuarioId) {
                const error = new Error('Usuario no autenticado');
                error.status = 401;
                throw error;
            }

            const comentario = await db.uno(TABLA, idComentario);
            if (!comentario || comentario.length === 0) {
                const error = new Error('Comentario no encontrado');
                error.status = 404;
                throw error;
            }

            if (comentario[0].UsuarioFK !== parseInt(usuarioId)) {
                const error = new Error('No tienes permisos para eliminar este comentario');
                error.status = 403;
                throw error;
            }

            const resultado = await db.agregar(TABLA, {
                IDComentarios: parseInt(idComentario),
                Activo: false
            });

            return { 
                affectedRows: 1,
                message: 'Comentario eliminado correctamente' 
            };
        } catch (error) {
            console.error('Error al eliminar comentario:', error);
            throw error;
        }
    }

    async function comentariosPorResena(resenaId) {
        try {
            if (!resenaId) {
                const error = new Error('ID de reseña es requerido');
                error.status = 400;
                throw error;
            }

            const comentarios = await todos({ ResenaFK: resenaId });
            
            return comentarios;
        } catch (error) {
            console.error('Error al obtener comentarios por reseña:', error);
            throw error;
        }
    }

    async function comentariosPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                error.status = 400;
                throw error;
            }
   
            const todosComentarios = await db.todos(TABLA);
            const comentariosUsuario = todosComentarios.filter(comentario => 
                comentario.UsuarioFK === parseInt(usuarioId) && 
                (comentario.Activo === true || comentario.Activo === 1)
            );

            return comentariosUsuario;
        } catch (error) {
            console.error('Error al obtener comentarios por usuario:', error);
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