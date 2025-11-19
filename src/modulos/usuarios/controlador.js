const auth = require('../auth');
const { logger } = require('../../utils/logger');
const error = require('../../middleware/errors');
const TABLA = 'Usuario';

module.exports = function (dbinyectada) {
    let db = dbinyectada;
    if(!db){
        db = require('../../DB/mysql');
    }

    async function todos() {
        try {
            logger.start('usuarios-controller', 'Obteniendo todos los usuarios');
            
            const usuarios = await db.todos(TABLA);
            
            logger.success('usuarios-controller', 'Usuarios obtenidos exitosamente', {
                total: usuarios?.length || 0
            });
            
            return usuarios;
        } catch (err) {
            logger.error('usuarios-controller', 'Error al obtener todos los usuarios', err);
            throw error(`Error al obtener todos los usuarios: ${err.message}`, 500); 
        }
    }

    async function uno(id) {
        try {
            if (!id) {
                const errorMsg = 'ID de usuario es requerido';
                logger.error('usuarios-controller', 'Validación fallida en obtener usuario', new Error(errorMsg), { id });
                throw error(errorMsg, 400);
            }
            
            logger.start('usuarios-controller', 'Obteniendo usuario por ID', { id });
            
            const usuario = await db.uno(TABLA, id);
            
            if (!usuario || usuario.length === 0) {
                const errorMsg = 'Usuario no encontrado';
                logger.error('usuarios-controller', 'Usuario no encontrado', new Error(errorMsg), { id });
                throw error(errorMsg, 404);
            }
            
            logger.success('usuarios-controller', 'Usuario obtenido exitosamente', { id });
            return usuario[0];
        } catch (err) {
            logger.error('usuarios-controller', 'Error al obtener usuario por ID', err, { id });
            throw error(`Error al obtener usuario con ID ${id}: ${err.message}`, 400); 
        }
    }

    async function agregar(body) {
        try {
            logger.start('usuarios-controller', 'Validando datos para agregar usuario', { 
                body: { ...body, Password: body.Password ? '[PROTEGIDO]' : undefined } 
            });

            if (!body.Nombre || !body.Correo || !body.Telefono) {
                const errorMsg = 'Los campos Nombre, Correo y Teléfono son requeridos';
                logger.error('usuarios-controller', 'Validación fallida - campos requeridos', new Error(errorMsg), { 
                    camposRecibidos: Object.keys(body) 
                });
                throw error(errorMsg, 400);
            }

            if (!validarCorreo(body.Correo)) {
                const errorMsg = 'El formato del correo electrónico no es válido';
                logger.error('usuarios-controller', 'Validación fallida - correo inválido', new Error(errorMsg), { 
                    correo: body.Correo 
                });
                throw error(errorMsg, 400);
            }

            if (body.Password && !validarPassword(body.Password)) {
                const errorMsg = 'La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)';
                logger.error('usuarios-controller', 'Validación fallida - contraseña inválida', new Error(errorMsg));
                throw error(errorMsg, 400);
            }

            if (body.Usuario && !validarUsuario(body.Usuario)) {
                const errorMsg = 'El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras, números y guiones bajos';
                logger.error('usuarios-controller', 'Validación fallida - usuario inválido', new Error(errorMsg), { 
                    usuario: body.Usuario 
                });
                throw error(errorMsg, 400);
            }

            if (!validarTelefono(body.Telefono)) {
                const errorMsg = 'El formato del teléfono no es válido';
                logger.error('usuarios-controller', 'Validación fallida - teléfono inválido', new Error(errorMsg), { 
                    telefono: body.Telefono 
                });
                throw error(errorMsg, 400);
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
            
            logger.start('usuarios-controller', 'Guardando usuario en base de datos', { 
                usuario: { ...usuario, Password: '[PROTEGIDO]' } 
            });

            const respuesta = await db.agregar(TABLA, usuario);
            const insertId = (body.IDUsuario && body.IDUsuario > 0) ? 
                body.IDUsuario : respuesta.IDUsuario;

            logger.success('usuarios-controller', 'Usuario guardado exitosamente', {
                IDUsuario: insertId,
                Nombre: usuario.Nombre,
                Correo: usuario.Correo
            });

            if (body.Usuario || body.Password) {
                try {
                    logger.start('usuarios-controller', 'Guardando credenciales de autenticación', {
                        IDUsuario: insertId,
                        Usuario: body.Usuario
                    });

                    await auth.agregar({
                        id: insertId,
                        usuario: body.Usuario,
                        password: body.Password
                    });

                    logger.success('usuarios-controller', 'Credenciales guardadas exitosamente', {
                        IDUsuario: insertId,
                        Usuario: body.Usuario
                    });
                } catch (authError) {
                    logger.error('usuarios-controller', 'Error al guardar credenciales', authError, {
                        IDUsuario: insertId,
                        Usuario: body.Usuario
                    });
                    throw error(`Error al guardar credenciales: ${authError.message}`, 500);
                }
            }

            return respuesta;
        } catch (err) {
            logger.error('usuarios-controller', 'Error al procesar usuario', err, { 
                body: { ...body, Password: body.Password ? '[PROTEGIDO]' : undefined } 
            });
            throw error(`Error al procesar usuario: ${err.message}`, 400); 
        }
    }

    async function eliminar(body) {
        try {
            if (!body.IDUsuario) {
                const errorMsg = 'ID de usuario es requerido para eliminar';
                logger.error('usuarios-controller', 'Validación fallida en eliminar usuario', new Error(errorMsg), { body });
                throw error(errorMsg, 400);
            }
            
            logger.start('usuarios-controller', 'Eliminando usuario', { 
                IDUsuario: body.IDUsuario 
            });
            
            const resultado = await db.eliminar(TABLA, body.IDUsuario);
            
            logger.success('usuarios-controller', 'Usuario eliminado exitosamente', {
                IDUsuario: body.IDUsuario,
                affectedRows: resultado.affectedRows
            });
            
            return resultado;
        } catch (err) {
            logger.error('usuarios-controller', 'Error al eliminar usuario', err, { body });
            throw error(`Error al eliminar usuario: ${err.message}`, 400); 
        }
    }

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