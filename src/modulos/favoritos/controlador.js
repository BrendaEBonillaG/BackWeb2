const TABLA = 'Favoritos';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos() {
        try {
            console.log('🔍 Obteniendo todos los favoritos');
            const favoritos = await db.todos(TABLA);
            console.log(`✅ Favoritos encontrados: ${favoritos?.length || 0}`);
            
            if (favoritos && favoritos.length > 0) {
                console.log('📋 Primer favorito:', favoritos[0].dataValues);
            }
            
            return favoritos;
        } catch (error) {
            console.error('❌ Error al obtener favoritos:', error);
            // ✅ SOLO propaga el error, NO crees uno nuevo
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
            
            console.log(`🔍 Obteniendo favorito con ID: ${id}`);
            const favorito = await db.uno(TABLA, id);
            
            if (!favorito || favorito.length === 0) {
                const error = new Error('Favorito no encontrado');
                error.status = 404;
                throw error;
            }
            
            console.log('✅ Favorito encontrado:', favorito[0]);
            return favorito[0];
        } catch (error) {
            console.error('❌ Error al obtener favorito:', error);
            // ✅ SOLO propaga el error, NO crees uno nuevo
            throw error;
        }
    }

    async function agregar(body) {
        try {
            // Validaciones
            if (!body.UsuarioFK || !body.LugarFK) {
                const error = new Error('UsuarioFK y LugarFK son requeridos');
                error.status = 400;
                throw error;
            }

            console.log('➕ Agregando favorito:', body);

            const favoritoData = {
                UsuarioFK: parseInt(body.UsuarioFK),
                LugarFK: parseInt(body.LugarFK)
            };

            // Verificar si ya existe el favorito
            const favoritoExistente = await db.query(TABLA, {
                UsuarioFK: favoritoData.UsuarioFK,
                LugarFK: favoritoData.LugarFK
            });

            if (favoritoExistente) {
                const error = new Error('Este lugar ya está en favoritos para este usuario');
                error.status = 409; // ✅ 409 Conflict
                throw error;
            }

            const resultado = await db.agregar(TABLA, favoritoData);
            
            const insertId = resultado?.IDFavoritos || resultado?.dataValues?.IDFavoritos;
            console.log('✅ Favorito agregado exitosamente. IDFavoritos:', insertId);
            
            return { ...resultado, IDFavoritos: insertId };
        } catch (error) {
            console.error('❌ Error al agregar favorito:', error);
            // ✅ IMPORTANTE: Solo relanzar el error original, NO crear uno nuevo
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

            console.log('🗑️ Eliminando favorito:', body);

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
            console.log('✅ Favorito eliminado exitosamente');
            
            return resultado;
        } catch (error) {
            console.error('❌ Error al eliminar favorito:', error);
            // ✅ SOLO propaga el error, NO crees uno nuevo
            throw error;
        }
    }

    // ✅ FUNCIÓN PRINCIPAL: Obtener lugares favoritos del usuario con información completa
    async function lugaresFavoritosPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                error.status = 400;
                throw error;
            }

            console.log(`🔍 Obteniendo lugares favoritos del usuario: ${usuarioId}`);
            
            // Obtener todos los favoritos del usuario
            const todosFavoritos = await db.todos(TABLA);
            const favoritosUsuario = todosFavoritos.filter(fav => 
                fav.UsuarioFK === parseInt(usuarioId)
            );

            console.log(`✅ Favoritos del usuario encontrados: ${favoritosUsuario.length}`);

            if (favoritosUsuario.length === 0) {
                return [];
            }

            // Obtener información completa de los lugares favoritos
            const todosLugares = await db.todos('Lugar');
            const lugaresFavoritos = [];

            for (const favorito of favoritosUsuario) {
                const lugar = todosLugares.find(l => l.IDLugar === favorito.LugarFK);
                if (lugar) {
                    // Obtener servicios del lugar
                    const serviciosLugar = await obtenerServiciosLugar(lugar.IDLugar);
                    
                    // Obtener fotos del lugar
                    const fotosLugar = await obtenerFotosLugar(lugar.IDLugar);

                    lugaresFavoritos.push({
                        ...lugar.dataValues,
                        servicios: serviciosLugar,
                        fotos: fotosLugar,
                        IDFavorito: favorito.IDFavoritos,
                        fechaAgregado: favorito.createdAt || new Date() // Si tienes timestamps
                    });
                }
            }

            console.log(`📍 Lugares favoritos con información completa: ${lugaresFavoritos.length}`);
            return lugaresFavoritos;
        } catch (error) {
            console.error('❌ Error al obtener lugares favoritos:', error);
            // ✅ SOLO propaga el error, NO crees uno nuevo
            throw error;
        }
    }

    // ✅ Función auxiliar: Obtener servicios de un lugar
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

    // ✅ Función auxiliar: Obtener fotos de un lugar
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

    // ✅ Función para la página: Solo IDs de favoritos (más rápida)
    async function favoritosPorUsuario(usuarioId) {
        try {
            if (!usuarioId) {
                const error = new Error('ID de usuario es requerido');
                error.status = 400;
                throw error;
            }

            console.log(`🔍 Obteniendo IDs de favoritos del usuario: ${usuarioId}`);
            
            const todosFavoritos = await db.todos(TABLA);
            const favoritosUsuario = todosFavoritos
                .filter(fav => fav.UsuarioFK === parseInt(usuarioId))
                .map(fav => ({
                    IDFavorito: fav.IDFavoritos,
                    LugarFK: fav.LugarFK,
                    UsuarioFK: fav.UsuarioFK
                }));

            console.log(`✅ IDs de favoritos del usuario: ${favoritosUsuario.length}`);
            
            return favoritosUsuario;
        } catch (error) {
            console.error('❌ Error al obtener favoritos por usuario:', error);
            // ✅ SOLO propaga el error, NO crees uno nuevo
            throw error;
        }
    }

    // ✅ Función para verificar si un lugar es favorito (rápida)
    async function esFavorito(usuarioId, lugarId) {
        try {
            if (!usuarioId || !lugarId) {
                const error = new Error('UsuarioID y LugarID son requeridos');
                error.status = 400;
                throw error;
            }

            console.log(`🔍 Verificando si lugar ${lugarId} es favorito de usuario ${usuarioId}`);
            
            const favorito = await db.query(TABLA, {
                UsuarioFK: parseInt(usuarioId),
                LugarFK: parseInt(lugarId)
            });

            const esFav = !!favorito;
            console.log(`✅ Es favorito: ${esFav}`);
            
            return { 
                esFavorito: esFav,
                IDFavorito: favorito?.IDFavoritos || null
            };
        } catch (error) {
            console.error('❌ Error al verificar favorito:', error);
            // ✅ SOLO propaga el error, NO crees uno nuevo
            throw error;
        }
    }

    // ✅ Función para eliminar por IDFavorito (más eficiente)
    async function eliminarPorId(idFavorito) {
        try {
            if (!idFavorito) {
                const error = new Error('ID de favorito es requerido');
                error.status = 400;
                throw error;
            }

            console.log(`🗑️ Eliminando favorito con ID: ${idFavorito}`);

            const resultado = await db.eliminar(TABLA, idFavorito);
            console.log('✅ Favorito eliminado exitosamente');
            
            return resultado;
        } catch (error) {
            console.error('❌ Error al eliminar favorito por ID:', error);
            // ✅ SOLO propaga el error, NO crees uno nuevo
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