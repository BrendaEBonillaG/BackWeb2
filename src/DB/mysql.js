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
                campoId = 'IDServicio'; // ✅ CORREGIDO: 'IDServicios' → 'IDServicio'
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
                campoId = 'IDResena'; // ✅ POSIBLE CORRECCIÓN
                break;
            case 'Comentarios': 
                modelo = Comentarios; 
                campoId = 'IDComentario'; // ✅ POSIBLE CORRECCIÓN
                break;
            case 'Favoritos': 
                modelo = Favoritos; 
                campoId = 'IDFavorito'; // ✅ POSIBLE CORRECCIÓN
                break;
            default: throw new Error('Tabla no encontrada');
        }

        let whereClause = {};
        if (campoId) {
            whereClause[campoId] = id;
        }

        const resultado = await modelo.findOne({ where: whereClause });
        return resultado ? [resultado.dataValues] : [];
    } catch (error) {
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

        console.log(`🔧 Agregando en tabla: ${tabla}`, data);

        // ✅ LÓGICA CORREGIDA PARA Lugar_Servicio
        if (tabla === 'Lugar_Servicio') {
            // Para tablas de unión, usar findOrCreate para evitar duplicados
            const [resultado, created] = await modelo.findOrCreate({
                where: {
                    IDLugar: data.IDLugar,
                    IDServicio: data.IDServicio
                },
                defaults: data
            });
            console.log(`📌 Lugar_Servicio ${created ? 'creado' : 'ya existía'}:`, resultado.dataValues);
            return resultado;
        }
        
        if (tabla === 'Auth') {
            const [resultado, created] = await modelo.upsert(data);
            return resultado;
        } else if (data.IDUsuario && tabla === 'Usuario') {
            const resultado = await modelo.update(data, { 
                where: { IDUsuario: data.IDUsuario } 
            });
            return resultado;
        } else if (data.IDLugar && tabla === 'Lugar') {
            const resultado = await modelo.update(data, { 
                where: { IDLugar: data.IDLugar } 
            });
            return resultado;
        } else {
            // ✅ CREACIÓN NORMAL para otras tablas
            const resultado = await modelo.create(data);
            console.log(`✅ ${tabla} creado:`, resultado.dataValues);
            return resultado;
        }
    } catch (error) {
        console.error(`❌ Error en agregar(${tabla}):`, error);
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
                campoId = 'IDServicios'; // ✅ CORREGIDO
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
        return resultado ? resultado.dataValues : null;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    eliminarLugarServicio,
    query
};