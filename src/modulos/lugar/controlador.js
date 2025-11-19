const { logger } = require('../../utils/logger');
const TABLA = 'Lugar';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos() {
        try {
            logger.start('lugar-controller', 'Obteniendo todos los lugares');
            
            const lugares = await db.todos(TABLA);
            
            logger.success('lugar-controller', 'Lugares obtenidos exitosamente', {
                total: lugares?.length || 0
            });
            
            return lugares;
        } catch (error) {
            logger.error('lugar-controller', 'Error al obtener todos los lugares', error);
            throw new Error(`Error al obtener lugares: ${error.message}`);
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                const error = new Error('ID de lugar es requerido');
                logger.error('lugar-controller', 'Validación fallida en obtener lugar', error, { id });
                throw error;
            }
            
            logger.start('lugar-controller', 'Obteniendo lugar por ID', { id });
            
            const lugar = await db.uno(TABLA, id);
            
            if (!lugar || lugar.length === 0) {
                const error = new Error('Lugar no encontrado');
                logger.error('lugar-controller', 'Lugar no encontrado', error, { id });
                throw error;
            }
            
            logger.success('lugar-controller', 'Lugar obtenido exitosamente', { id });
            return lugar[0];
        } catch (error) {
            logger.error('lugar-controller', 'Error al obtener lugar por ID', error, { id });
            throw new Error(`Error al obtener lugar: ${error.message}`);
        }
    }

    async function agregar(body) {
        try {
            logger.start('lugar-controller', 'Validando datos para agregar lugar', { body });

            if (!body.Nombre || !body.Direccion || !body.Info || !body.Tipo) {
                const error = new Error('Los campos Nombre, Direccion, Info y Tipo son requeridos');
                logger.error('lugar-controller', 'Validación fallida - campos requeridos', error, { body });
                throw error;
            }

            const tipoNormalizado = body.Tipo.trim().toLowerCase();
            if (tipoNormalizado !== 'hospedaje' && tipoNormalizado !== 'turismo') {
                const error = new Error('El Tipo solo puede ser "Hospedaje" o "Turismo"');
                logger.error('lugar-controller', 'Validación fallida - tipo inválido', error, { tipo: body.Tipo });
                throw error;
            }

            if (tipoNormalizado === 'hospedaje') {
                if (!body.servicios || !Array.isArray(body.servicios) || body.servicios.length === 0) {
                    const error = new Error('Los lugares de tipo "Hospedaje" deben tener al menos un servicio');
                    logger.error('lugar-controller', 'Validación fallida - servicios requeridos para hospedaje', error, { body });
                    throw error;
                }
            }

            if (tipoNormalizado === 'turismo' && body.servicios && body.servicios.length > 0) {
                const error = new Error('Los lugares de tipo "Turismo" no pueden tener servicios asociados');
                logger.error('lugar-controller', 'Validación fallida - servicios no permitidos para turismo', error, { body });
                throw error;
            }

            if (tipoNormalizado === 'hospedaje' && body.servicios && Array.isArray(body.servicios)) {
                const serviciosUnicos = [...new Set(body.servicios)];
                if (serviciosUnicos.length !== body.servicios.length) {
                    const error = new Error('No se permiten servicios duplicados para un hospedaje');
                    logger.error('lugar-controller', 'Validación fallida - servicios duplicados', error, { servicios: body.servicios });
                    throw error;
                }
                
                if (body.IDLugar && body.IDLugar > 0) {
                    const serviciosExistentes = await obtenerServiciosLugar(body.IDLugar);
                    const serviciosExistentesIds = serviciosExistentes.map(s => s.IDServicios); 
                    
                    const serviciosDuplicados = body.servicios.filter(servicioId => 
                        serviciosExistentesIds.includes(servicioId)
                    );
                    
                    if (serviciosDuplicados.length > 0) {
                        const error = new Error(`El hospedaje ya tiene los siguientes servicios: ${serviciosDuplicados.join(', ')}`);
                        logger.error('lugar-controller', 'Validación fallida - servicios ya existentes', error, { 
                            serviciosDuplicados,
                            IDLugar: body.IDLugar 
                        });
                        throw error;
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

            logger.start('lugar-controller', 'Guardando lugar en base de datos', { lugar });
            
            const respuesta = await db.agregar(TABLA, lugar);
            
            let insertId;
            if (body.IDLugar && body.IDLugar > 0) {
                insertId = body.IDLugar;
            } else {
                insertId = respuesta?.IDLugar || respuesta?.dataValues?.IDLugar;
            }

            if (!insertId) {
                const error = new Error('No se pudo obtener el ID del lugar creado');
                logger.error('lugar-controller', 'Error al obtener ID del lugar', error, { respuesta });
                throw error;
            }

            logger.success('lugar-controller', 'Lugar guardado exitosamente', { 
                IDLugar: insertId,
                tipo: tipoNormalizado 
            });

            if (tipoNormalizado === 'hospedaje' && body.servicios && Array.isArray(body.servicios)) {
                logger.start('lugar-controller', 'Agregando servicios al hospedaje', {
                    IDLugar: insertId,
                    totalServicios: body.servicios.length
                });
                
                for (const servicioId of body.servicios) {
                    await agregarServicioLugar(insertId, servicioId);
                }
                
                logger.success('lugar-controller', 'Servicios agregados exitosamente', {
                    IDLugar: insertId,
                    serviciosAgregados: body.servicios.length
                });
            }

            if (body.fotos && Array.isArray(body.fotos)) {
                logger.start('lugar-controller', 'Agregando fotos al lugar', {
                    IDLugar: insertId,
                    totalFotos: body.fotos.length
                });
                
                for (const fotoUrl of body.fotos) {
                    await db.agregar('Fotos', {
                        Foto: fotoUrl,
                        LugarFK: insertId
                    });
                }
                
                logger.success('lugar-controller', 'Fotos agregadas exitosamente', {
                    IDLugar: insertId,
                    fotosAgregadas: body.fotos.length
                });
            }

            return { ...respuesta, IDLugar: insertId };
        } catch (error) {
            logger.error('lugar-controller', 'Error al procesar lugar', error, { body });
            throw new Error(`Error al procesar lugar: ${error.message}`);
        }
    }

    async function eliminar(body) {
        try {
            if (!body.IDLugar) {
                const error = new Error('ID de lugar es requerido para eliminar');
                logger.error('lugar-controller', 'Validación fallida en eliminar lugar', error, { body });
                throw error;
            }
            
            logger.start('lugar-controller', 'Eliminando lugar', { IDLugar: body.IDLugar });
            
            const resultado = await db.eliminar(TABLA, body.IDLugar);
            
            logger.success('lugar-controller', 'Lugar eliminado exitosamente', {
                IDLugar: body.IDLugar,
                affectedRows: resultado.affectedRows
            });
            
            return resultado;
        } catch (error) {
            logger.error('lugar-controller', 'Error al eliminar lugar', error, { body });
            throw new Error(`Error al eliminar lugar: ${error.message}`);
        }
    }

    async function porTipo(tipo) {
        try {
            if (!tipo) {
                const error = new Error('Tipo es requerido');
                logger.error('lugar-controller', 'Validación fallida en obtener por tipo', error, { tipo });
                throw error;
            }

            const tipoNormalizado = tipo.toLowerCase();
            if (tipoNormalizado !== 'hospedaje' && tipoNormalizado !== 'turismo') {
                const error = new Error('El tipo solo puede ser "Hospedaje" o "Turismo"');
                logger.error('lugar-controller', 'Validación fallida - tipo inválido', error, { tipo });
                throw error;
            }

            logger.start('lugar-controller', 'Obteniendo lugares por tipo', { tipo: tipoNormalizado });

            const lugares = await db.todos(TABLA);
            const lugaresFiltrados = lugares.filter(lugar => 
                lugar.Tipo.toLowerCase() === tipoNormalizado
            );
            
            logger.success('lugar-controller', 'Lugares por tipo obtenidos exitosamente', {
                tipo: tipoNormalizado,
                total: lugaresFiltrados.length
            });
            
            return lugaresFiltrados;
        } catch (error) {
            logger.error('lugar-controller', 'Error al obtener lugares por tipo', error, { tipo });
            throw new Error(`Error al obtener lugares por tipo: ${error.message}`);
        }
    }

    async function porServicios(serviciosIds) {
        try {
            if (!serviciosIds || !Array.isArray(serviciosIds) || serviciosIds.length === 0) {
                const error = new Error('Array de IDs de servicios es requerido');
                logger.error('lugar-controller', 'Validación fallida en obtener por servicios', error, { serviciosIds });
                throw error;
            }

            logger.start('lugar-controller', 'Obteniendo lugares por servicios', {
                serviciosIds,
                totalServicios: serviciosIds.length
            });

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

            logger.success('lugar-controller', 'Lugares por servicios obtenidos exitosamente', {
                serviciosIds,
                totalEncontrados: lugaresConServicios.length
            });

            return lugaresConServicios;
        } catch (error) {
            logger.error('lugar-controller', 'Error al obtener lugares por servicios', error, { serviciosIds });
            throw new Error(`Error al obtener lugares por servicios: ${error.message}`);
        }
    }

    async function agregarServicioLugar(idLugar, idServicio) {
        try {
            if (!idLugar || !idServicio) {
                const error = new Error('ID de lugar y ID de servicio son requeridos');
                logger.error('lugar-controller', 'Validación fallida en agregar servicio', error, { idLugar, idServicio });
                throw error;
            }

            logger.start('lugar-controller', 'Validando lugar para agregar servicio', { idLugar, idServicio });

            const lugar = await db.uno(TABLA, idLugar);
            if (!lugar || lugar.length === 0) {
                const error = new Error('Lugar no encontrado');
                logger.error('lugar-controller', 'Lugar no encontrado al agregar servicio', error, { idLugar });
                throw error;
            }

            const tipoLugar = lugar[0].Tipo.toLowerCase();
            if (tipoLugar !== 'hospedaje') {
                const error = new Error('Solo los lugares de tipo "Hospedaje" pueden tener servicios');
                logger.error('lugar-controller', 'Tipo de lugar no permite servicios', error, { 
                    idLugar, 
                    tipoLugar 
                });
                throw error;
            }

            const serviciosExistentes = await obtenerServiciosLugar(idLugar);
            const servicioDuplicado = serviciosExistentes.find(s => s.IDServicios === idServicio); 
            
            if (servicioDuplicado) {
                const error = new Error(`El servicio con ID ${idServicio} ya está asignado a este hospedaje`);
                logger.error('lugar-controller', 'Servicio duplicado', error, { idLugar, idServicio });
                throw error;
            }

            const relacion = {
                IDLugar: parseInt(idLugar),
                IDServicio: parseInt(idServicio) 
            };

            logger.start('lugar-controller', 'Agregando relación lugar-servicio', { relacion });

            const resultado = await db.agregar('Lugar_Servicio', relacion);
            
            logger.success('lugar-controller', 'Servicio agregado exitosamente al lugar', {
                idLugar,
                idServicio
            });
            
            return resultado;
        } catch (error) {
            logger.error('lugar-controller', 'Error al agregar servicio al lugar', error, { idLugar, idServicio });
            throw new Error(`Error al agregar servicio al lugar: ${error.message}`);
        }
    }

    async function eliminarServicioLugar(idLugar, idServicio) {
        try {
            if (!idLugar || !idServicio) {
                const error = new Error('ID de lugar y ID de servicio son requeridos');
                logger.error('lugar-controller', 'Validación fallida en eliminar servicio', error, { idLugar, idServicio });
                throw error;
            }

            logger.start('lugar-controller', 'Eliminando servicio del lugar', { idLugar, idServicio });

            const resultado = await db.eliminarLugarServicio({ 
                IDLugar: idLugar, 
                IDServicio: idServicio 
            });
            
            logger.success('lugar-controller', 'Servicio eliminado exitosamente del lugar', {
                idLugar,
                idServicio,
                affectedRows: resultado.affectedRows
            });
            
            return resultado;
        } catch (error) {
            logger.error('lugar-controller', 'Error al eliminar servicio del lugar', error, { idLugar, idServicio });
            throw new Error(`Error al eliminar servicio del lugar: ${error.message}`);
        }
    }

    async function obtenerServiciosLugar(idLugar) {
        try {
            if (!idLugar) {
                const error = new Error('ID de lugar es requerido');
                logger.error('lugar-controller', 'Validación fallida en obtener servicios', error, { idLugar });
                throw error;
            }
            
            logger.db('SELECT_SERVICIOS_LUGAR', 'Lugar_Servicio', { idLugar });
            
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

            logger.success('lugar-controller', 'Servicios del lugar obtenidos exitosamente', {
                idLugar,
                totalServicios: serviciosDelLugar.length
            });

            return serviciosDelLugar;
        } catch (error) {
            logger.error('lugar-controller', 'Error al obtener servicios del lugar', error, { idLugar });
            throw new Error(`Error al obtener servicios del lugar: ${error.message}`);
        }
    }

    async function obtenerTodosServicios() {
        try {
            logger.start('lugar-controller', 'Obteniendo todos los servicios');
            
            const servicios = await db.todos('Servicios');
            
            logger.success('lugar-controller', 'Todos los servicios obtenidos exitosamente', {
                total: servicios?.length || 0
            });
            
            return servicios;
        } catch (error) {
            logger.error('lugar-controller', 'Error al obtener todos los servicios', error);
            throw new Error(`Error al obtener todos los servicios: ${error.message}`);
        }
    }

    async function agregarFotoLugar(idLugar, fotoUrl) {
        try {
            if (!idLugar || !fotoUrl) {
                const error = new Error('ID de lugar y URL de foto son requeridos');
                logger.error('lugar-controller', 'Validación fallida en agregar foto', error, { idLugar, fotoUrl });
                throw error;
            }

            logger.start('lugar-controller', 'Agregando foto al lugar', { idLugar, fotoUrl });

            const foto = {
                Foto: fotoUrl,
                LugarFK: idLugar
            };

            const resultado = await db.agregar('Fotos', foto);
            
            logger.success('lugar-controller', 'Foto agregada exitosamente al lugar', {
                idLugar,
                fotoUrl
            });
            
            return resultado;
        } catch (error) {
            logger.error('lugar-controller', 'Error al agregar foto al lugar', error, { idLugar, fotoUrl });
            throw new Error(`Error al agregar foto al lugar: ${error.message}`);
        }
    }

    async function obtenerFotosLugar(idLugar) {
        try {
            if (!idLugar) {
                const error = new Error('ID de lugar es requerido');
                logger.error('lugar-controller', 'Validación fallida en obtener fotos', error, { idLugar });
                throw error;
            }

            logger.start('lugar-controller', 'Obteniendo fotos del lugar', { idLugar });

            const fotos = await db.todos('Fotos');
            const fotosDelLugar = fotos.filter(foto => foto.LugarFK === idLugar);
            
            logger.success('lugar-controller', 'Fotos del lugar obtenidas exitosamente', {
                idLugar,
                totalFotos: fotosDelLugar.length
            });
            
            return fotosDelLugar;
        } catch (error) {
            logger.error('lugar-controller', 'Error al obtener fotos del lugar', error, { idLugar });
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