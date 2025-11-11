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
            // Validación de campos requeridos
            if (!body.Nombre || !body.Direccion || !body.Info || !body.Tipo) {
                throw new Error('Los campos Nombre, Direccion, Info y Tipo son requeridos');
            }

            // ✅ VALIDACIÓN 1: Solo permitir tipos "Hospedaje" o "Turismo"
            const tipoNormalizado = body.Tipo.trim().toLowerCase();
            if (tipoNormalizado !== 'hospedaje' && tipoNormalizado !== 'turismo') {
                throw new Error('El Tipo solo puede ser "Hospedaje" o "Turismo"');
            }

            // ✅ VALIDACIÓN 2: Si es Turismo, no permitir servicios
            if (tipoNormalizado === 'turismo' && body.servicios && body.servicios.length > 0) {
                throw new Error('Los lugares de tipo "Turismo" no pueden tener servicios asociados');
            }

            // ✅ VALIDACIÓN 3: Si es Hospedaje, verificar servicios duplicados
            if (tipoNormalizado === 'hospedaje' && body.servicios && Array.isArray(body.servicios)) {
                const serviciosUnicos = [...new Set(body.servicios)];
                if (serviciosUnicos.length !== body.servicios.length) {
                    throw new Error('No se permiten servicios duplicados para un hospedaje');
                }
                
                // Para actualizaciones, verificar duplicados en BD
                if (body.IDLugar && body.IDLugar > 0) {
                    const serviciosExistentes = await obtenerServiciosLugar(body.IDLugar);
                    const serviciosExistentesIds = serviciosExistentes.map(s => s.IDServicio);
                    
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
                Tipo: body.Tipo.trim(), // Normalizar el tipo
                Activo: body.Activo !== undefined ? body.Activo : true
            };

            if (body.IDLugar && body.IDLugar > 0) {
                lugar.IDLugar = body.IDLugar;
            }

            console.log('=== INICIANDO CREACIÓN DE LUGAR ===');
            console.log('Datos del lugar:', lugar);
            
            const respuesta = await db.agregar(TABLA, lugar);
            console.log('Respuesta de base de datos:', respuesta);
            
            let insertId;
            if (body.IDLugar && body.IDLugar > 0) {
                insertId = body.IDLugar;
            } else {
                insertId = respuesta?.IDLugar || respuesta?.dataValues?.IDLugar;
            }

            console.log('ID del lugar creado:', insertId);

            if (!insertId) {
                throw new Error('No se pudo obtener el ID del lugar creado');
            }

            // ✅ AGREGAR SERVICIOS SOLO SI ES HOSPEDAJE Y PASÓ VALIDACIONES
            if (tipoNormalizado === 'hospedaje' && body.servicios && Array.isArray(body.servicios)) {
                console.log('Servicios a agregar:', body.servicios);
                console.log('Cantidad de servicios:', body.servicios.length);
                
                for (const servicioId of body.servicios) {
                    console.log(`Agregando servicio ID: ${servicioId} al lugar ID: ${insertId}`);
                    await agregarServicioLugar(insertId, servicioId);
                }
                console.log('Todos los servicios agregados correctamente');
            } else {
                console.log('No hay servicios para agregar');
            }

            if (body.fotos && Array.isArray(body.fotos)) {
                console.log('Fotos a agregar:', body.fotos);
                for (const fotoUrl of body.fotos) {
                    await db.agregar('Fotos', {
                        Foto: fotoUrl,
                        LugarFK: insertId
                    });
                }
            }

            console.log('=== LUGAR CREADO EXITOSAMENTE ===');
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

            // Validar que el tipo sea válido
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

            // ✅ VALIDACIÓN: Verificar que el lugar sea de tipo Hospedaje
            const lugar = await db.uno(TABLA, idLugar);
            if (!lugar || lugar.length === 0) {
                throw new Error('Lugar no encontrado');
            }

            const tipoLugar = lugar[0].Tipo.toLowerCase();
            if (tipoLugar !== 'hospedaje') {
                throw new Error('Solo los lugares de tipo "Hospedaje" pueden tener servicios');
            }

            // ✅ VALIDACIÓN: Verificar que el servicio no esté duplicado
            const serviciosExistentes = await obtenerServiciosLugar(idLugar);
            const servicioDuplicado = serviciosExistentes.find(s => s.IDServicio === idServicio);
            
            if (servicioDuplicado) {
                throw new Error(`El servicio con ID ${idServicio} ya está asignado a este hospedaje`);
            }

            const relacion = {
                IDLugar: parseInt(idLugar),
                IDServicio: parseInt(idServicio)
            };

            console.log('Creando relación Lugar-Servicio:', relacion);
            const resultado = await db.agregar('Lugar_Servicio', relacion);
            console.log('Relación creada exitosamente:', resultado);
            
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
            
            const serviciosDelLugar = todasRelaciones
                .filter(rel => rel.IDLugar === idLugar)
                .map(rel => {
                    const servicio = todosServicios.find(s => s.IDServicio === rel.IDServicio);
                    return servicio;
                })
                .filter(servicio => servicio !== undefined);

            return serviciosDelLugar;
        } catch (error) {
            throw new Error(`Error al obtener servicios del lugar: ${error.message}`);
        }
    }

    async function obtenerTodosServicios() {
        try {
            const servicios = await db.todos('Servicios');
            return servicios;
        } catch (error) {
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