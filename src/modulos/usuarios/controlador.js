const auth = require('../auth');
const TABLA = 'Usuario';

module.exports = function (dbinyectada) {
    let db = dbinyectada;
    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos() {
        try {
            const usuarios = await db.todos(TABLA);
            return usuarios;
        } catch (error) {
            throw new Error(`Error al obtener todos los usuarios: ${error.message}`);
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                throw new Error('ID de usuario es requerido');
            }
            
            const usuario = await db.uno(TABLA, id);
            
            if (!usuario || usuario.length === 0) {
                throw new Error('Usuario no encontrado');
            }
            
            return usuario;
        } catch (error) {
            throw new Error(`Error al obtener usuario con ID ${id}: ${error.message}`);
        }
    }

    async function agregar(body) {
        try {
            // Validaciones de campos requeridos
            if (!body.Nombre || !body.Correo || !body.Telefono) {
                throw new Error('Los campos Nombre, Correo y Teléfono son requeridos');
            }

            const usuario = {
                Nombre: body.Nombre,
                Correo: body.Correo,
                Telefono: body.Telefono,
                Foto: body.Foto || null,
                Activo: body.Activo !== undefined ? body.Activo : 1
            };
            
            // Solo agregar IDUsuario si es para actualizar
            if (body.IDUsuario && body.IDUsuario > 0) {
                usuario.IDUsuario = body.IDUsuario;
            }
            
            const respuesta = await db.agregar(TABLA, usuario);
            const insertId = (body.IDUsuario && body.IDUsuario > 0) ? 
                body.IDUsuario : respuesta.insertId;

            // Manejar autenticación si se proporciona usuario o password
            if (body.Usuario || body.Password) {
                try {
                    await auth.agregar({
                        id: insertId,
                        usuario: body.Usuario,
                        password: body.Password
                    });
                } catch (authError) {
                    throw new Error(`Error al guardar credenciales: ${authError.message}`);
                }
            }

            return respuesta;
        } catch (error) {
            throw new Error(`Error al procesar usuario: ${error.message}`);
        }
    }

    async function eliminar(body) {
        try {
            if (!body.IDUsuario) {
                throw new Error('ID de usuario es requerido para eliminar');
            }
            
            const resultado = await db.eliminar(TABLA, body.IDUsuario);
            return resultado;
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    return {
        todos,
        uno,
        agregar,
        eliminar
    };
};