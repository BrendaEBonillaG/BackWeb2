const TABLA = 'Favoritos';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos() {
        try {
            const favoritos = await db.todos(TABLA);
            
            if (favoritos && favoritos.length > 0) {
            }
            
            return favoritos;
        } catch (error) {
            console.error('Error al obtener favoritos:', error);
            throw error;
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                const error = new Error('ID de favorito es requerido');
                error.status = 400;
                throw error;
            }

            const favorito = await db.uno(TABLA, id);
            
            if (!favorito || favorito.length === 0) {
                const error = new Error('Favorito no encontrado');
                error.status = 404;
                throw error;
            }

            return favorito[0];
        } catch (error) {
            console.error('Error al obtener favorito:', error);
            throw error;
        }
    }

    async function agregar(body) {
        try {
            if (!body.UsuarioFK || !body.LugarFK) {
                const error = new Error('UsuarioFK y LugarFK son requeridos');
                error.status = 400;
                throw error;
            }

            const favoritoData = {
                UsuarioFK: parseInt(body.UsuarioFK),
                LugarFK: parseInt(body.LugarFK)
            };

            const favoritoExistente = await db.query(TABLA, {
                UsuarioFK: favoritoData.UsuarioFK,
                LugarFK: favoritoData.LugarFK
            });

            if (favoritoExistente) {
                const error = new Error('Este lugar ya está en favoritos para este usuario');
                error.status = 409; 
                throw error;
            }

            const resultado = await db.agregar(TABLA, favoritoData);
            
            const insertId = resultado?.IDFavoritos || resultado?.dataValues?.IDFavoritos;
            
            return { ...resultado, IDFavoritos: insertId };
        } catch (error) {
            console.error('Error al agregar favorito:', error);
            throw error;
        }
    }

    async function eliminar(body) {
        try {
            if (!body.UsuarioFK || !body.LugarFK) {
                const error = new Error('UsuarioFK y LugarFK son requeridos para eliminar');
                error.status = 400;
                throw error;
            }

            const whereClause = {
                UsuarioFK: parseInt(body.UsuarioFK),
                LugarFK: parseInt(body.LugarFK)
            };

            const favoritoExistente = await db.query(TABLA, whereClause);

            if (!favoritoExistente) {
                const error = new Error('Favorito no encontrado');
                error.status = 404;
                throw error;
            }

            const resultado = await db.eliminar(TABLA, favoritoExistente.IDFavoritos);
            
            return resultado;
        } catch (error) {
            console.error(' Error al eliminar favorito:', error);
            throw error;
        }
    }

    async function lugaresFavoritosPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                error.status = 400;
                throw error;
            }

            const todosFavoritos = await db.todos(TABLA);
            const favoritosUsuario = todosFavoritos.filter(fav => 
                fav.UsuarioFK === parseInt(usuarioId)
            );


            if (favoritosUsuario.length === 0) {
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

            return lugaresFavoritos;
        } catch (error) {
            console.error('Error al obtener lugares favoritos:', error);
            throw error;
        }
    }

    async function obtenerServiciosLugar(idLugar) {
        try {
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
            console.error('Error al obtener servicios del lugar:', error);
            return [];
        }
    }

    async function obtenerFotosLugar(idLugar) {
        try {
            const todasFotos = await db.todos('Fotos');
            const fotosDelLugar = todasFotos
                .filter(foto => foto.LugarFK === idLugar)
                .map(foto => foto.dataValues || foto);

            return fotosDelLugar;
        } catch (error) {
            console.error('Error al obtener fotos del lugar:', error);
            return [];
        }
    }

    async function favoritosPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                error.status = 400;
                throw error;
            }
            
            const todosFavoritos = await db.todos(TABLA);
            const favoritosUsuario = todosFavoritos
                .filter(fav => fav.UsuarioFK === parseInt(usuarioId))
                .map(fav => ({
                    IDFavorito: fav.IDFavoritos,
                    LugarFK: fav.LugarFK,
                    UsuarioFK: fav.UsuarioFK
                }));
            
            return favoritosUsuario;
        } catch (error) {
            console.error('Error al obtener favoritos por usuario:', error);
            throw error;
        }
    }

    async function esFavorito(usuarioId, lugarId) {
        try {
            if (!usuarioId || !lugarId) {
                const error = new Error('UsuarioID y LugarID son requeridos');
                error.status = 400;
                throw error;
            }
            
            const favorito = await db.query(TABLA, {
                UsuarioFK: parseInt(usuarioId),
                LugarFK: parseInt(lugarId)
            });

            const esFav = !!favorito;
            
            return { 
                esFavorito: esFav,
                IDFavorito: favorito?.IDFavoritos || null
            };
        } catch (error) {
            console.error('Error al verificar favorito:', error);
            throw error;
        }
    }

    async function eliminarPorId(idFavorito) {
        try {
            if (!idFavorito) {
                const error = new Error('ID de favorito es requerido');
                error.status = 400;
                throw error;
            }

            const resultado = await db.eliminar(TABLA, idFavorito);
            
            return resultado;
        } catch (error) {
            console.error('Error al eliminar favorito por ID:', error);
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