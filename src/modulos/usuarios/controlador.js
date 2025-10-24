const auth = require('../auth');
const TABLA = 'Usuario';
const error = require('../../middleware/errors');

module.exports = function (dbinyectada) {
    let db = dbinyectada;
    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos() {
        try {
            const usuarios = await db.todos(TABLA);
            return usuarios;
        } catch (err) {
            throw error(`Error al obtener todos los usuarios: ${err.message}`, 500); // ← Cambiado a err.message
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                throw error('ID de usuario es requerido', 400);
            }
            
            const usuario = await db.uno(TABLA, id);
            
            if (!usuario || usuario.length === 0) {
                throw error('Usuario no encontrado', 404);
            }
            
            return usuario;
        } catch (err) {
            throw error(`Error al obtener usuario con ID ${id}: ${err.message}`, 400); // ← Cambiado a err.message
        }
    }

    async function agregar(body) {
        try {
            if (!body.Nombre || !body.Correo || !body.Telefono) {
                throw error('Los campos Nombre, Correo y Teléfono son requeridos', 400);
            }

            if (!validarCorreo(body.Correo)) {
                throw error('El formato del correo electrónico no es válido', 400);
            }

            if (body.Password && !validarPassword(body.Password)) {
                throw error('La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)', 400);
            }

            if (body.Usuario && !validarUsuario(body.Usuario)) {
                throw error('El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números y guiones bajos', 400);
            }

            const usuario = {
                Nombre: body.Nombre.trim(),
                Correo: body.Correo.toLowerCase().trim(),
                Telefono: body.Telefono.trim(),
                Foto: body.Foto || null,
                Activo: body.Activo !== undefined ? body.Activo : 1
            };
            
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
                    throw error(`Error al guardar credenciales: ${authError.message}`, 500);
                }
            }

            return respuesta;
        } catch (err) {
            throw error(`Error al procesar usuario: ${err.message}`, 400); // ← Cambiado a err.message
        }
    }

    async function eliminar(body) {
        try {
            if (!body.IDUsuario) {
                throw error('ID de usuario es requerido para eliminar', 400);
            }
            
            const resultado = await db.eliminar(TABLA, body.IDUsuario);
            return resultado;
        } catch (err) {
            throw error(`Error al eliminar usuario: ${err.message}`, 400); // ← Cambiado a err.message
        }
    }

    // Funciones de validación
    function validarCorreo(correo) {
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regexCorreo.test(correo);
    }

    function validarPassword(password) {
        const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regexPassword.test(password);
    }

    function validarUsuario(usuario) {
        const regexUsuario = /^[a-zA-Z0-9_]{3,20}$/;
        return regexUsuario.test(usuario);
    }

    function validarTelefono(telefono) {
        const regexTelefono = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return regexTelefono.test(telefono.replace(/\s/g, ''));
    }

    return {
        todos,
        uno,
        agregar,
        eliminar,
        validarCorreo,
        validarPassword,
        validarUsuario,
        validarTelefono
    };
};