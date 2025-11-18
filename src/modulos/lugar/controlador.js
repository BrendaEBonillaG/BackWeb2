const TABLA = 'Lugar';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos() {
        try {
            const lugares = await db.todos(TABLA);
            return lugares;
        } catch (error) {
            throw new Error(`Error al obtener lugares: ${error.message}`);
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                throw new Error('ID de lugar es requerido');
            }
            
            const lugar = await db.uno(TABLA, id);
            
            if (!lugar || lugar.length === 0) {
                throw new Error('Lugar no encontrado');
            }
            
            return lugar[0];
        } catch (error) {
            throw new Error(`Error al obtener lugar: ${error.message}`);
        }
    }

    async function agregar(body) {
        try {

            if (!body.Nombre || !body.Direccion || !body.Info || !body.Tipo) {
                throw new Error('Los campos Nombre, Direccion, Info y Tipo son requeridos');
            }

            const tipoNormalizado = body.Tipo.trim().toLowerCase();
            if (tipoNormalizado !== 'hospedaje' && tipoNormalizado !== 'turismo') {
                throw new Error('El Tipo solo puede ser "Hospedaje" o "Turismo"');
            }

            if (tipoNormalizado === 'hospedaje') {
                if (!body.servicios || !Array.isArray(body.servicios) || body.servicios.length === 0) {
                    throw new Error('Los lugares de tipo "Hospedaje" deben tener al menos un servicio');
                }
            }

            if (tipoNormalizado === 'turismo' && body.servicios && body.servicios.length > 0) {
                throw new Error('Los lugares de tipo "Turismo" no pueden tener servicios asociados');
            }

            if (tipoNormalizado === 'hospedaje' && body.servicios && Array.isArray(body.servicios)) {
                const serviciosUnicos = [...new Set(body.servicios)];
                if (serviciosUnicos.length !== body.servicios.length) {
                    throw new Error('No se permiten servicios duplicados para un hospedaje');
                }
                
                if (body.IDLugar && body.IDLugar > 0) {
                    const serviciosExistentes = await obtenerServiciosLugar(body.IDLugar);
                    const serviciosExistentesIds = serviciosExistentes.map(s => s.IDServicios); 
                    
                    const serviciosDuplicados = body.servicios.filter(servicioId => 
                        serviciosExistentesIds.includes(servicioId)
                    );
                    
                    if (serviciosDuplicados.length > 0) {
                        throw new Error(`El hospedaje ya tiene los siguientes servicios: ${serviciosDuplicados.join(', ')}`);
                    }
                }
            }

            const lugar = {
                Nombre: body.Nombre.trim(),
                Direccion: body.Direccion.trim(),
                Info: body.Info.trim(),
                Tipo: body.Tipo.trim(), 
                Activo: body.Activo !== undefined ? body.Activo : true
            };

            if (body.IDLugar && body.IDLugar > 0) {
                lugar.IDLugar = body.IDLugar;
            }

            
            const respuesta = await db.agregar(TABLA, lugar);
            
            let insertId;
            if (body.IDLugar && body.IDLugar > 0) {
                insertId = body.IDLugar;
            } else {
                insertId = respuesta?.IDLugar || respuesta?.dataValues?.IDLugar;
            }


            if (!insertId) {
                throw new Error('No se pudo obtener el ID del lugar creado');
            }

            if (tipoNormalizado === 'hospedaje' && body.servicios && Array.isArray(body.servicios)) {
                
                for (const servicioId of body.servicios) {
                    await agregarServicioLugar(insertId, servicioId);
                }
            } else {
            }

            if (body.fotos && Array.isArray(body.fotos)) {
                for (const fotoUrl of body.fotos) {
                    await db.agregar('Fotos', {
                        Foto: fotoUrl,
                        LugarFK: insertId
                    });
                }
            }

            return { ...respuesta, IDLugar: insertId };
        } catch (error) {
            console.error('Error en agregar lugar:', error);
            throw new Error(`Error al procesar lugar: ${error.message}`);
        }
    }

    async function eliminar(body) {
        try {
            if (!body.IDLugar) {
                throw new Error('ID de lugar es requerido para eliminar');
            }
            
            const resultado = await db.eliminar(TABLA, body.IDLugar);
            return resultado;
        } catch (error) {
            throw new Error(`Error al eliminar lugar: ${error.message}`);
        }
    }

    async function porTipo(tipo) {
        try {
            if (!tipo) {
                throw new Error('Tipo es requerido');
            }

            const tipoNormalizado = tipo.toLowerCase();
            if (tipoNormalizado !== 'hospedaje' && tipoNormalizado !== 'turismo') {
                throw new Error('El tipo solo puede ser "Hospedaje" o "Turismo"');
            }

            const lugares = await db.todos(TABLA);
            const lugaresFiltrados = lugares.filter(lugar => 
                lugar.Tipo.toLowerCase() === tipoNormalizado
            );
            
            return lugaresFiltrados;
        } catch (error) {
            throw new Error(`Error al obtener lugares por tipo: ${error.message}`);
        }
    }

    async function porServicios(serviciosIds) {
        try {
            if (!serviciosIds || !Array.isArray(serviciosIds) || serviciosIds.length === 0) {
                throw new Error('Array de IDs de servicios es requerido');
            }

            const todosLugares = await db.todos(TABLA);
            const todasRelaciones = await db.todos('Lugar_Servicio');
            
            const lugaresConServicios = todosLugares.filter(lugar => {
                const serviciosDelLugar = todasRelaciones
                    .filter(rel => rel.IDLugar === lugar.IDLugar)
                    .map(rel => rel.IDServicio); 
                
                return serviciosIds.every(servicioId => 
                    serviciosDelLugar.includes(servicioId)
                );
            });

            return lugaresConServicios;
        } catch (error) {
            throw new Error(`Error al obtener lugares por servicios: ${error.message}`);
        }
    }

    async function agregarServicioLugar(idLugar, idServicio) {
        try {
            if (!idLugar || !idServicio) {
                throw new Error('ID de lugar y ID de servicio son requeridos');
            }
            const lugar = await db.uno(TABLA, idLugar);
            if (!lugar || lugar.length === 0) {
                throw new Error('Lugar no encontrado');
            }

            const tipoLugar = lugar[0].Tipo.toLowerCase();
            if (tipoLugar !== 'hospedaje') {
                throw new Error('Solo los lugares de tipo "Hospedaje" pueden tener servicios');
            }

            const serviciosExistentes = await obtenerServiciosLugar(idLugar);
            const servicioDuplicado = serviciosExistentes.find(s => s.IDServicios === idServicio); 
            
            if (servicioDuplicado) {
                throw new Error(`El servicio con ID ${idServicio} ya está asignado a este hospedaje`);
            }

            const relacion = {
                IDLugar: parseInt(idLugar),
                IDServicio: parseInt(idServicio) 
            };

            const resultado = await db.agregar('Lugar_Servicio', relacion);
            
            return resultado;
        } catch (error) {
            console.error('Error en agregarServicioLugar:', error);
            throw new Error(`Error al agregar servicio al lugar: ${error.message}`);
        }
    }

    async function eliminarServicioLugar(idLugar, idServicio) {
        try {
            if (!idLugar || !idServicio) {
                throw new Error('ID de lugar y ID de servicio son requeridos');
            }

            const resultado = await db.eliminar('Lugar_Servicio', { 
                IDLugar: idLugar, 
                IDServicio: idServicio 
            });
            return resultado;
        } catch (error) {
            throw new Error(`Error al eliminar servicio del lugar: ${error.message}`);
        }
    }

    async function obtenerServiciosLugar(idLugar) {
        try {
            if (!idLugar) {
                throw new Error('ID de lugar es requerido');
            }
            
            const todosServicios = await db.todos('Servicios');
            
            const todasRelaciones = await db.todos('Lugar_Servicio');
            
            const idLugarNum = parseInt(idLugar);
            
            const serviciosDelLugar = todasRelaciones
                .filter(rel => rel.IDLugar === idLugarNum)
                .map(rel => {
                    const servicio = todosServicios.find(s => s.IDServicios === rel.IDServicio);
                    return servicio;
                })
                .filter(servicio => servicio !== undefined);

            return serviciosDelLugar;
        } catch (error) {
            console.error(' Error en obtenerServiciosLugar:', error);
            throw new Error(`Error al obtener servicios del lugar: ${error.message}`);
        }
    }

    async function obtenerTodosServicios() {
        try {
            const servicios = await db.todos('Servicios');
            
            return servicios;
        } catch (error) {
            console.error(' ERROR en obtenerTodosServicios:', error);
            throw new Error(`Error al obtener todos los servicios: ${error.message}`);
        }
    }

    async function agregarFotoLugar(idLugar, fotoUrl) {
        try {
            if (!idLugar || !fotoUrl) {
                throw new Error('ID de lugar y URL de foto son requeridos');
            }

            const foto = {
                Foto: fotoUrl,
                LugarFK: idLugar
            };

            const resultado = await db.agregar('Fotos', foto);
            return resultado;
        } catch (error) {
            throw new Error(`Error al agregar foto al lugar: ${error.message}`);
        }
    }

    async function obtenerFotosLugar(idLugar) {
        try {
            if (!idLugar) {
                throw new Error('ID de lugar es requerido');
            }

            const fotos = await db.todos('Fotos');
            const fotosDelLugar = fotos.filter(foto => foto.LugarFK === idLugar);
            return fotosDelLugar;
        } catch (error) {
            throw new Error(`Error al obtener fotos del lugar: ${error.message}`);
        }
    }

    return {
        todos,
        uno,
        agregar,
        eliminar,
        porTipo,
        porServicios,
        agregarServicioLugar,
        eliminarServicioLugar,
        obtenerServiciosLugar,
        obtenerTodosServicios,
        agregarFotoLugar,
        obtenerFotosLugar
    };
};