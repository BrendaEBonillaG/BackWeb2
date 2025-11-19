const { logger } = require('../../utils/logger');
const TABLA = 'Favoritos';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos() {
        try {
            logger.start('favoritos-controller', 'Obteniendo todos los favoritos');
            
            const favoritos = await db.todos(TABLA);
            
            logger.success('favoritos-controller', 'Favoritos obtenidos exitosamente', {
                total: favoritos?.length || 0
            });
            
            return favoritos;
        } catch (error) {
            logger.error('favoritos-controller', 'Error al obtener todos los favoritos', error);
            throw error;
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                const error = new Error('ID de favorito es requerido');
                logger.error('favoritos-controller', 'Validación fallida en obtener favorito', error, { id });
                error.status = 400;
                throw error;
            }

            logger.start('favoritos-controller', 'Obteniendo favorito por ID', { id });
            
            const favorito = await db.uno(TABLA, id);
            
            if (!favorito || favorito.length === 0) {
                const error = new Error('Favorito no encontrado');
                logger.error('favoritos-controller', 'Favorito no encontrado', error, { id });
                error.status = 404;
                throw error;
            }

            logger.success('favoritos-controller', 'Favorito obtenido exitosamente', { id });
            return favorito[0];
        } catch (error) {
            logger.error('favoritos-controller', 'Error al obtener favorito por ID', error, { id });
            throw error;
        }
    }

    async function agregar(body) {
        try {
            if (!body.UsuarioFK || !body.LugarFK) {
                const error = new Error('UsuarioFK y LugarFK son requeridos');
                logger.error('favoritos-controller', 'Validación fallida en agregar favorito', error, { body });
                error.status = 400;
                throw error;
            }

            const favoritoData = {
                UsuarioFK: parseInt(body.UsuarioFK),
                LugarFK: parseInt(body.LugarFK)
            };

            logger.start('favoritos-controller', 'Verificando favorito existente', favoritoData);

            const favoritoExistente = await db.query(TABLA, {
                UsuarioFK: favoritoData.UsuarioFK,
                LugarFK: favoritoData.LugarFK
            });

            if (favoritoExistente) {
                const error = new Error('Este lugar ya está en favoritos para este usuario');
                logger.error('favoritos-controller', 'Favorito duplicado', error, favoritoData);
                error.status = 409; 
                throw error;
            }

            logger.start('favoritos-controller', 'Agregando nuevo favorito', favoritoData);

            const resultado = await db.agregar(TABLA, favoritoData);
            
            const insertId = resultado?.IDFavoritos || resultado?.dataValues?.IDFavoritos;

            logger.success('favoritos-controller', 'Favorito agregado exitosamente', {
                ...favoritoData,
                IDFavoritos: insertId
            });
            
            return { ...resultado, IDFavoritos: insertId };
        } catch (error) {
            logger.error('favoritos-controller', 'Error al agregar favorito', error, { body });
            throw error;
        }
    }

    async function eliminar(body) {
        try {
            if (!body.UsuarioFK || !body.LugarFK) {
                const error = new Error('UsuarioFK y LugarFK son requeridos para eliminar');
                logger.error('favoritos-controller', 'Validación fallida en eliminar favorito', error, { body });
                error.status = 400;
                throw error;
            }

            const whereClause = {
                UsuarioFK: parseInt(body.UsuarioFK),
                LugarFK: parseInt(body.LugarFK)
            };

            logger.start('favoritos-controller', 'Buscando favorito para eliminar', whereClause);

            const favoritoExistente = await db.query(TABLA, whereClause);

            if (!favoritoExistente) {
                const error = new Error('Favorito no encontrado');
                logger.error('favoritos-controller', 'Favorito no encontrado para eliminar', error, whereClause);
                error.status = 404;
                throw error;
            }

            logger.start('favoritos-controller', 'Eliminando favorito', {
                ...whereClause,
                IDFavoritos: favoritoExistente.IDFavoritos
            });

            const resultado = await db.eliminar(TABLA, favoritoExistente.IDFavoritos);
            
            logger.success('favoritos-controller', 'Favorito eliminado exitosamente', {
                ...whereClause,
                affectedRows: resultado.affectedRows
            });

            return resultado;
        } catch (error) {
            logger.error('favoritos-controller', 'Error al eliminar favorito', error, { body });
            throw error;
        }
    }

    async function lugaresFavoritosPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                logger.error('favoritos-controller', 'Validación fallida en obtener lugares favoritos', error, { usuarioId });
                error.status = 400;
                throw error;
            }

            logger.start('favoritos-controller', 'Obteniendo lugares favoritos por usuario', { usuarioId });

            const todosFavoritos = await db.todos(TABLA);
            const favoritosUsuario = todosFavoritos.filter(fav => 
                fav.UsuarioFK === parseInt(usuarioId)
            );

            if (favoritosUsuario.length === 0) {
                logger.success('favoritos-controller', 'No se encontraron lugares favoritos para el usuario', {
                    usuarioId,
                    total: 0
                });
                return [];
            }

            const todosLugares = await db.todos('Lugar');
            const lugaresFavoritos = [];

            for (const favorito of favoritosUsuario) {
                const lugar = todosLugares.find(l => l.IDLugar === favorito.LugarFK);
                if (lugar) {
                    const serviciosLugar = await obtenerServiciosLugar(lugar.IDLugar);
                    const fotosLugar = await obtenerFotosLugar(lugar.IDLugar);

                    lugaresFavoritos.push({
                        ...lugar.dataValues,
                        servicios: serviciosLugar,
                        fotos: fotosLugar,
                        IDFavorito: favorito.IDFavoritos,
                        fechaAgregado: favorito.createdAt || new Date() 
                    });
                }
            }

            logger.success('favoritos-controller', 'Lugares favoritos obtenidos exitosamente', {
                usuarioId,
                total: lugaresFavoritos.length
            });

            return lugaresFavoritos;
        } catch (error) {
            logger.error('favoritos-controller', 'Error al obtener lugares favoritos por usuario', error, { usuarioId });
            throw error;
        }
    }

    async function obtenerServiciosLugar(idLugar) {
        try {
            logger.db('SELECT_SERVICIOS', 'Lugar_Servicio', { idLugar });
            
            const todosServicios = await db.todos('Servicios');
            const todasRelaciones = await db.todos('Lugar_Servicio');
            
            const serviciosDelLugar = todasRelaciones
                .filter(rel => rel.IDLugar === idLugar)
                .map(rel => {
                    const servicio = todosServicios.find(s => s.IDServicios === rel.IDServicio);
                    return servicio ? servicio.dataValues : null;
                })
                .filter(servicio => servicio !== null);

            return serviciosDelLugar;
        } catch (error) {
            logger.error('favoritos-controller', 'Error al obtener servicios del lugar', error, { idLugar });
            return [];
        }
    }

    async function obtenerFotosLugar(idLugar) {
        try {
            logger.db('SELECT_FOTOS', 'Fotos', { idLugar });
            
            const todasFotos = await db.todos('Fotos');
            const fotosDelLugar = todasFotos
                .filter(foto => foto.LugarFK === idLugar)
                .map(foto => foto.dataValues || foto);

            return fotosDelLugar;
        } catch (error) {
            logger.error('favoritos-controller', 'Error al obtener fotos del lugar', error, { idLugar });
            return [];
        }
    }

    async function favoritosPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                logger.error('favoritos-controller', 'Validación fallida en obtener favoritos por usuario', error, { usuarioId });
                error.status = 400;
                throw error;
            }
            
            logger.start('favoritos-controller', 'Obteniendo favoritos por usuario', { usuarioId });
            
            const todosFavoritos = await db.todos(TABLA);
            const favoritosUsuario = todosFavoritos
                .filter(fav => fav.UsuarioFK === parseInt(usuarioId))
                .map(fav => ({
                    IDFavorito: fav.IDFavoritos,
                    LugarFK: fav.LugarFK,
                    UsuarioFK: fav.UsuarioFK
                }));
            
            logger.success('favoritos-controller', 'Favoritos por usuario obtenidos exitosamente', {
                usuarioId,
                total: favoritosUsuario.length
            });
            
            return favoritosUsuario;
        } catch (error) {
            logger.error('favoritos-controller', 'Error al obtener favoritos por usuario', error, { usuarioId });
            throw error;
        }
    }

    async function esFavorito(usuarioId, lugarId) {
        try {
            if (!usuarioId || !lugarId) {
                const error = new Error('UsuarioID y LugarID son requeridos');
                logger.error('favoritos-controller', 'Validación fallida en verificar favorito', error, { usuarioId, lugarId });
                error.status = 400;
                throw error;
            }
            
            logger.start('favoritos-controller', 'Verificando si es favorito', { usuarioId, lugarId });
            
            const favorito = await db.query(TABLA, {
                UsuarioFK: parseInt(usuarioId),
                LugarFK: parseInt(lugarId)
            });

            const esFav = !!favorito;

            logger.success('favoritos-controller', 'Verificación de favorito completada', {
                usuarioId,
                lugarId,
                esFavorito: esFav,
                IDFavorito: favorito?.IDFavoritos || null
            });
            
            return { 
                esFavorito: esFav,
                IDFavorito: favorito?.IDFavoritos || null
            };
        } catch (error) {
            logger.error('favoritos-controller', 'Error al verificar favorito', error, { usuarioId, lugarId });
            throw error;
        }
    }

    async function eliminarPorId(idFavorito) {
        try {
            if (!idFavorito) {
                const error = new Error('ID de favorito es requerido');
                logger.error('favoritos-controller', 'Validación fallida en eliminar favorito por ID', error, { idFavorito });
                error.status = 400;
                throw error;
            }

            logger.start('favoritos-controller', 'Eliminando favorito por ID', { idFavorito });

            const resultado = await db.eliminar(TABLA, idFavorito);
            
            logger.success('favoritos-controller', 'Favorito eliminado por ID exitosamente', {
                idFavorito,
                affectedRows: resultado.affectedRows
            });

            return resultado;
        } catch (error) {
            logger.error('favoritos-controller', 'Error al eliminar favorito por ID', error, { idFavorito });
            throw error;
        }
    }

    return {
        todos,
        uno,
        agregar,
        eliminar,
        eliminarPorId,
        favoritosPorUsuario,
        lugaresFavoritosPorUsuario,
        esFavorito
    };
};