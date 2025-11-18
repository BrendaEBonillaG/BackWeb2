const { Usuario } = require('./modelos/usuario.js');
const { Auth } = require('./modelos/auth.js');
const { Lugar } = require('./modelos/lugar.js');
const { Servicios } = require('./modelos/servicios.js');
const { Lugar_Servicio } = require('./modelos/lugarServicio.js');
const { Fotos } = require('./modelos/fotos.js');
const { Resenas } = require('./modelos/resenas.js');
const { Comentarios } = require('./modelos/comentarios.js');
const { Favoritos } = require('./modelos/favoritos.js');

async function todos(tabla) {
    try {
        
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
            default: throw new Error('Tabla no encontrada');
        }

        const resultados = await modelo.findAll();

        return resultados;
    } catch (error) {
        console.error(`ERROR en todos(${tabla}):`, error);
        throw error;
    }
}

async function uno(tabla, id) {
    try {
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
            default: throw new Error('Tabla no encontrada');
        }

        let whereClause = {};
        if (campoId) {
            whereClause[campoId] = id;
        }

        const resultado = await modelo.findOne({ where: whereClause });
        
        if (!resultado) {
            return null;
        }
        
        return [resultado.dataValues];
    } catch (error) {
        console.error(`ERROR en uno(${tabla}, ${id}):`, error);
        throw error;
    }
}

async function agregar(tabla, data) {
    try {
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
            default: throw new Error('Tabla no encontrada');
        }

        if (data.IDResenas && tabla === 'Resenas') {
            const resultado = await modelo.update(data, { 
                where: { IDResenas: data.IDResenas } 
            });
            
            const reseñaActualizada = await modelo.findOne({ 
                where: { IDResenas: data.IDResenas } 
            });
 
            return reseñaActualizada;
        }
        
        if (data.IDComentarios && tabla === 'Comentarios') {
            const resultado = await modelo.update(data, { 
                where: { IDComentarios: data.IDComentarios } 
            });
            
            const comentarioActualizado = await modelo.findOne({ 
                where: { IDComentarios: data.IDComentarios } 
            });

            return comentarioActualizado;
        }
        
        if (tabla === 'Lugar_Servicio') {
            const [resultado, created] = await modelo.findOrCreate({
                where: {
                    IDLugar: data.IDLugar,
                    IDServicio: data.IDServicio
                },
                defaults: data
            });
            return resultado;
        }

        if (tabla === 'Auth') {
            const [resultado, created] = await modelo.upsert(data);
            return resultado;
        } 
        else if (data.IDUsuario && tabla === 'Usuario') {
            const resultado = await modelo.update(data, { 
                where: { IDUsuario: data.IDUsuario } 
            });
            return resultado;
        } 
        else if (data.IDLugar && tabla === 'Lugar') {
            const resultado = await modelo.update(data, { 
                where: { IDLugar: data.IDLugar } 
            });
            return resultado;
        } 
        else if (data.IDFoto && tabla === 'Fotos') {
            const resultado = await modelo.update(data, { 
                where: { IDFoto: data.IDFoto } 
            });
            return resultado;
        }
        else if (data.IDServicios && tabla === 'Servicios') {
            const resultado = await modelo.update(data, { 
                where: { IDServicios: data.IDServicios } 
            });
            return resultado;
        }
        else if (data.IDFavoritos && tabla === 'Favoritos') {
            const resultado = await modelo.update(data, { 
                where: { IDFavoritos: data.IDFavoritos } 
            });
            return resultado;
        }
        else {
            const resultado = await modelo.create(data);
            return resultado;
        }
    } catch (error) {
        console.error(`Error en agregar(${tabla}):`, error);
        throw error;
    }
}

async function eliminar(tabla, id) {
    try {
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
            default: throw new Error('Tabla no encontrada');
        }

        let whereClause = {};
        if (campoId) {
            whereClause[campoId] = id;
        }

        const resultado = await modelo.destroy({ where: whereClause });
        return { affectedRows: resultado };
    } catch (error) {
        console.error(`ERROR en eliminar(${tabla}, ${id}):`, error);
        throw error;
    }
}

async function eliminarLugarServicio(where) {
    try {
        const resultado = await Lugar_Servicio.destroy({ where: where });
        return { affectedRows: resultado };
    } catch (error) {
        throw error;
    }
}

async function query(tabla, where) {
    try {
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
            default: throw new Error('Tabla no encontrada');
        }
        const resultado = await modelo.findOne({ where: where });
        
        if (!resultado) {
            return null;
        }
        
        return resultado.dataValues;
    } catch (error) {
        console.error(`ERROR en query(${tabla}):`, error);
        throw error;
    }
}

async function buscar(tabla, where) {
    try {
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
            default: throw new Error('Tabla no encontrada');
        }
        
        const resultados = await modelo.findAll({ where: where });
        return resultados.map(item => item.dataValues);
    } catch (error) {
        console.error(`ERROR en buscar(${tabla}):`, error);
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