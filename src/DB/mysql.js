const { Usuario } = require('./modelos/usuario.js');
const { Auth } = require('./modelos/auth.js');
const { Lugar } = require('./modelos/lugar.js');
const { Servicios } = require('./modelos/servicios.js');
const { Lugar_Servicio } = require('./modelos/lugarServicio.js');
const { Fotos } = require('./modelos/fotos.js');
const { Resenas } = require('./modelos/resenas.js');
const { Comentarios } = require('./modelos/comentarios.js');
const { Favoritos } = require('./modelos/favoritos.js');
const { logger } = require('../utils/logger');

async function todos(tabla) {
    try {
        logger.db('SELECT_ALL', tabla); 
        
        let modelo;
        switch(tabla) {
            case 'Usuario': modelo = Usuario; break;
            case 'Auth': modelo = Auth; break;
            case 'Lugar': modelo = Lugar; break;
            case 'Servicios': modelo = Servicios; break;
            case 'Lugar_Servicio': modelo = Lugar_Servicio; break;
            case 'Fotos': modelo = Fotos; break;
            case 'Resenas': modelo = Resenas; break;
            case 'Comentarios': modelo = Comentarios; break;
            case 'Favoritos': modelo = Favoritos; break;
            default: 
                logger.db('SELECT_ALL_ERROR', tabla, { error: 'Tabla no encontrada' });
                throw new Error('Tabla no encontrada');
        }

        const resultados = await modelo.findAll();

        logger.db('SELECT_ALL_SUCCESS', tabla, {
            count: resultados?.length || 0,
            tabla: tabla
        });

        return resultados;
    } catch (error) {
        logger.db('SELECT_ALL_ERROR', tabla, { 
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

async function uno(tabla, id) {
    try {
        logger.db('SELECT_ONE', tabla, { id }); 
        
        let modelo;
        let campoId;
        switch(tabla) {
            case 'Usuario': 
                modelo = Usuario; 
                campoId = 'IDUsuario'; 
                break;
            case 'Auth': 
                modelo = Auth; 
                campoId = 'IDAuth'; 
                break;
            case 'Lugar': 
                modelo = Lugar; 
                campoId = 'IDLugar'; 
                break;
            case 'Servicios': 
                modelo = Servicios; 
                campoId = 'IDServicios';
                break;
            case 'Lugar_Servicio': 
                modelo = Lugar_Servicio; 
                break;
            case 'Fotos': 
                modelo = Fotos; 
                campoId = 'IDFoto'; 
                break;
            case 'Resenas': 
                modelo = Resenas; 
                campoId = 'IDResenas';
                break;
            case 'Comentarios': 
                modelo = Comentarios; 
                campoId = 'IDComentarios';
                break;
            case 'Favoritos': 
                modelo = Favoritos; 
                campoId = 'IDFavoritos';
                break;
            default: 
                logger.db('SELECT_ONE_ERROR', tabla, { error: 'Tabla no encontrada', id });
                throw new Error('Tabla no encontrada');
        }

        let whereClause = {};
        if (campoId) {
            whereClause[campoId] = id;
        }

        const resultado = await modelo.findOne({ where: whereClause });
        
        if (!resultado) {
            logger.db('SELECT_ONE_NOT_FOUND', tabla, { id }); 
            return null;
        }

        logger.db('SELECT_ONE_SUCCESS', tabla, { 
            id: id,
            encontrado: true
        });
        
        return [resultado.dataValues];
    } catch (error) {
        logger.db('SELECT_ONE_ERROR', tabla, { 
            error: error.message,
            id: id,
            stack: error.stack
        });
        throw error;
    }
}

async function agregar(tabla, data) {
    try {
        const isUpdate = data.IDResenas || data.IDComentarios || data.IDUsuario || 
                        data.IDLugar || data.IDFoto || data.IDServicios || data.IDFavoritos;
        const operation = isUpdate ? 'UPDATE' : 'INSERT';
        
        logger.db(operation, tabla, { 
            data: isUpdate ? { id: Object.values(data)[0], operacion: 'actualización' } : { operacion: 'inserción' }
        });

        let modelo;
        switch(tabla) {
            case 'Usuario': modelo = Usuario; break;
            case 'Auth': modelo = Auth; break;
            case 'Lugar': modelo = Lugar; break;
            case 'Servicios': modelo = Servicios; break;
            case 'Lugar_Servicio': modelo = Lugar_Servicio; break;
            case 'Fotos': modelo = Fotos; break;
            case 'Resenas': modelo = Resenas; break;
            case 'Comentarios': modelo = Comentarios; break;
            case 'Favoritos': modelo = Favoritos; break;
            default: 
                logger.db(`${operation}_ERROR`, tabla, { error: 'Tabla no encontrada', data });
                throw new Error('Tabla no encontrada');
        }

        if (data.IDResenas && tabla === 'Resenas') {
            logger.db('UPDATE_SPECIFIC', 'Resenas', { id: data.IDResenas });
            
            const resultado = await modelo.update(data, { 
                where: { IDResenas: data.IDResenas } 
            });
            
            const reseñaActualizada = await modelo.findOne({ 
                where: { IDResenas: data.IDResenas } 
            });

            logger.db('UPDATE_SUCCESS', 'Resenas', { 
                id: data.IDResenas,
                affectedRows: resultado[0]
            });
 
            return reseñaActualizada;
        }
        
        if (data.IDComentarios && tabla === 'Comentarios') {
            logger.db('UPDATE_SPECIFIC', 'Comentarios', { id: data.IDComentarios });
            
            const resultado = await modelo.update(data, { 
                where: { IDComentarios: data.IDComentarios } 
            });
            
            const comentarioActualizado = await modelo.findOne({ 
                where: { IDComentarios: data.IDComentarios } 
            });

            logger.db('UPDATE_SUCCESS', 'Comentarios', { 
                id: data.IDComentarios,
                affectedRows: resultado[0]
            });

            return comentarioActualizado;
        }
      
        if (tabla === 'Lugar_Servicio') {
            logger.db('FIND_OR_CREATE', 'Lugar_Servicio', {
                IDLugar: data.IDLugar,
                IDServicio: data.IDServicio
            });
            
            const [resultado, created] = await modelo.findOrCreate({
                where: {
                    IDLugar: data.IDLugar,
                    IDServicio: data.IDServicio
                },
                defaults: data
            });

            logger.db('FIND_OR_CREATE_RESULT', 'Lugar_Servicio', { 
                created: created,
                IDLugar: data.IDLugar,
                IDServicio: data.IDServicio
            });

            return resultado;
        }

        if (tabla === 'Auth') {
            logger.db('UPSERT', 'Auth', { IDAuth: data.IDAuth });
            
            const [resultado, created] = await modelo.upsert(data);

            logger.db('UPSERT_RESULT', 'Auth', { 
                created: created,
                IDAuth: data.IDAuth
            });

            return resultado;
        } 
        else if (data.IDUsuario && tabla === 'Usuario') {
            logger.db('UPDATE', 'Usuario', { id: data.IDUsuario });
            
            const resultado = await modelo.update(data, { 
                where: { IDUsuario: data.IDUsuario } 
            });

            logger.db('UPDATE_SUCCESS', 'Usuario', {
                id: data.IDUsuario,
                affectedRows: resultado[0]
            });

            return resultado;
        } 
        else if (data.IDLugar && tabla === 'Lugar') {
            logger.db('UPDATE', 'Lugar', { id: data.IDLugar });
            
            const resultado = await modelo.update(data, { 
                where: { IDLugar: data.IDLugar } 
            });

            logger.db('UPDATE_SUCCESS', 'Lugar', {
                id: data.IDLugar,
                affectedRows: resultado[0]
            });

            return resultado;
        } 
        else if (data.IDFoto && tabla === 'Fotos') {
            logger.db('UPDATE', 'Fotos', { id: data.IDFoto });
            
            const resultado = await modelo.update(data, { 
                where: { IDFoto: data.IDFoto } 
            });

            logger.db('UPDATE_SUCCESS', 'Fotos', {
                id: data.IDFoto,
                affectedRows: resultado[0]
            });

            return resultado;
        }
        else if (data.IDServicios && tabla === 'Servicios') {
            logger.db('UPDATE', 'Servicios', { id: data.IDServicios });
            
            const resultado = await modelo.update(data, { 
                where: { IDServicios: data.IDServicios } 
            });

            logger.db('UPDATE_SUCCESS', 'Servicios', {
                id: data.IDServicios,
                affectedRows: resultado[0]
            });

            return resultado;
        }
        else if (data.IDFavoritos && tabla === 'Favoritos') {
            logger.db('UPDATE', 'Favoritos', { id: data.IDFavoritos });
            
            const resultado = await modelo.update(data, { 
                where: { IDFavoritos: data.IDFavoritos } 
            });

            logger.db('UPDATE_SUCCESS', 'Favoritos', {
                id: data.IDFavoritos,
                affectedRows: resultado[0]
            });

            return resultado;
        }
        else {
            logger.db('INSERT', tabla, { datos: 'nuevo registro' });
            
            const resultado = await modelo.create(data);

            const insertId = resultado?.IDResenas || resultado?.IDComentarios || 
                           resultado?.IDUsuario || resultado?.IDLugar || 
                           resultado?.IDFoto || resultado?.IDServicios || 
                           resultado?.IDFavoritos;

            logger.db('INSERT_SUCCESS', tabla, { 
                id: insertId,
                operacion: 'creación exitosa'
            });

            return resultado;
        }
    } catch (error) {
        logger.db('OPERATION_ERROR', tabla, { 
            error: error.message,
            data: data,
            stack: error.stack
        });
        throw error;
    }
}

async function eliminar(tabla, id) {
    try {
        logger.db('DELETE', tabla, { id });
        
        let modelo;
        let campoId;
        switch(tabla) {
            case 'Usuario': 
                modelo = Usuario; 
                campoId = 'IDUsuario'; 
                break;
            case 'Auth': 
                modelo = Auth; 
                campoId = 'IDAuth'; 
                break;
            case 'Lugar': 
                modelo = Lugar; 
                campoId = 'IDLugar'; 
                break;
            case 'Servicios': 
                modelo = Servicios; 
                campoId = 'IDServicios';
                break;
            case 'Lugar_Servicio': 
                modelo = Lugar_Servicio; 
                break;
            case 'Fotos': 
                modelo = Fotos; 
                campoId = 'IDFoto'; 
                break;
            case 'Resenas': 
                modelo = Resenas; 
                campoId = 'IDResenas';
                break;
            case 'Comentarios': 
                modelo = Comentarios; 
                campoId = 'IDComentarios';
                break;
            case 'Favoritos': 
                modelo = Favoritos; 
                campoId = 'IDFavoritos';
                break;
            default: 
                logger.db('DELETE_ERROR', tabla, { error: 'Tabla no encontrada', id });
                throw new Error('Tabla no encontrada');
        }

        let whereClause = {};
        if (campoId) {
            whereClause[campoId] = id;
        }

        const resultado = await modelo.destroy({ where: whereClause });

        logger.db('DELETE_SUCCESS', tabla, { 
            id: id,
            affectedRows: resultado
        });

        return { affectedRows: resultado };
    } catch (error) {
        logger.db('DELETE_ERROR', tabla, { 
            error: error.message,
            id: id,
            stack: error.stack
        });
        throw error;
    }
}

async function eliminarLugarServicio(where) {
    try {
        logger.db('DELETE_RELATION', 'Lugar_Servicio', { where });
        
        const resultado = await Lugar_Servicio.destroy({ where: where });

        logger.db('DELETE_RELATION_SUCCESS', 'Lugar_Servicio', {
            affectedRows: resultado,
            condiciones: where
        });

        return { affectedRows: resultado };
    } catch (error) {
        logger.db('DELETE_RELATION_ERROR', 'Lugar_Servicio', {
            error: error.message,
            where: where,
            stack: error.stack
        });
        throw error;
    }
}

async function query(tabla, where) {
    try {
        logger.db('QUERY', tabla, { condiciones: where }); 
        
        let modelo;
        switch(tabla) {
            case 'Usuario': modelo = Usuario; break;
            case 'Auth': modelo = Auth; break;
            case 'Lugar': modelo = Lugar; break;
            case 'Servicios': modelo = Servicios; break;
            case 'Lugar_Servicio': modelo = Lugar_Servicio; break;
            case 'Fotos': modelo = Fotos; break;
            case 'Resenas': modelo = Resenas; break;
            case 'Comentarios': modelo = Comentarios; break;
            case 'Favoritos': modelo = Favoritos; break;
            default: 
                logger.db('QUERY_ERROR', tabla, { error: 'Tabla no encontrada', where });
                throw new Error('Tabla no encontrada');
        }
        
        const resultado = await modelo.findOne({ where: where });
        
        if (!resultado) {
            logger.db('QUERY_NOT_FOUND', tabla, { condiciones: where }); 
            return null;
        }

        logger.db('QUERY_SUCCESS', tabla, { 
            condiciones: where,
            encontrado: true
        });
        
        return resultado.dataValues;
    } catch (error) {
        logger.db('QUERY_ERROR', tabla, { 
            error: error.message,
            where: where,
            stack: error.stack
        });
        throw error;
    }
}

async function buscar(tabla, where) {
    try {
        logger.db('SEARCH', tabla, { condiciones: where }); 
        
        let modelo;
        switch(tabla) {
            case 'Usuario': modelo = Usuario; break;
            case 'Auth': modelo = Auth; break;
            case 'Lugar': modelo = Lugar; break;
            case 'Servicios': modelo = Servicios; break;
            case 'Lugar_Servicio': modelo = Lugar_Servicio; break;
            case 'Fotos': modelo = Fotos; break;
            case 'Resenas': modelo = Resenas; break;
            case 'Comentarios': modelo = Comentarios; break;
            case 'Favoritos': modelo = Favoritos; break;
            default: 
                logger.db('SEARCH_ERROR', tabla, { error: 'Tabla no encontrada', where });
                throw new Error('Tabla no encontrada');
        }
        
        const resultados = await modelo.findAll({ where: where });

        logger.db('SEARCH_SUCCESS', tabla, { 
            condiciones: where,
            count: resultados.length
        });

        return resultados.map(item => item.dataValues);
    } catch (error) {
        logger.db('SEARCH_ERROR', tabla, { 
            error: error.message,
            where: where,
            stack: error.stack
        });
        throw error;
    }
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    eliminarLugarServicio,
    query,
    buscar
};