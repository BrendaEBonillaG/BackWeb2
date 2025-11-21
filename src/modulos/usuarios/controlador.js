const auth = require('../auth');
const { logger } = require('../../utils/logger');
const error = require('../../middleware/errors');
const fs = require('fs');
const path = require('path');
const TABLA = 'Usuario';

module.exports = function (dbinyectada) {
    let db = dbinyectada;
    if(!db){
        db = require('../../DB/mysql');
    }

    // ✅ CONFIGURACIÓN DE CARPETA DE FOTOS
    const FOTOS_DIR = path.join(__dirname, '../../../uploads/perfiles');
    
    // ✅ CREAR CARPETA SI NO EXISTE
    if (!fs.existsSync(FOTOS_DIR)) {
        fs.mkdirSync(FOTOS_DIR, { recursive: true });
        logger.db('DIRECTORY_CREATED', 'FotosPerfil', { path: FOTOS_DIR });
    }

    // ✅ FUNCIÓN PARA GUARDAR FOTO
    async function guardarFoto(imagenBase64, idUsuario) {
        try {
            // Verificar si es una imagen base64
            if (!imagenBase64 || !imagenBase64.startsWith('data:image/')) {
                return null;
            }

            // Extraer información de la imagen
            const matches = imagenBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                throw new Error('Formato de imagen base64 inválido');
            }

            const extension = matches[1]; // jpeg, png, etc.
            const imageBuffer = Buffer.from(matches[2], 'base64');
            
            // Validar tamaño (máximo 5MB)
            if (imageBuffer.length > 5 * 1024 * 1024) {
                throw new Error('La imagen no debe exceder 5MB');
            }

            // Generar nombre único para el archivo
            const nombreArchivo = `perfil_${idUsuario}_${Date.now()}.${extension}`;
            const rutaCompleta = path.join(FOTOS_DIR, nombreArchivo);

            // Guardar archivo
            fs.writeFileSync(rutaCompleta, imageBuffer);
            
            logger.db('PHOTO_SAVED', 'Usuario', {
                idUsuario,
                archivo: nombreArchivo,
                tamaño: imageBuffer.length
            });

            // Retornar ruta relativa para guardar en BD
            return `/uploads/perfiles/${nombreArchivo}`;

        } catch (error) {
            logger.error('usuarios-controller', 'Error al guardar foto', error, { idUsuario });
            throw new Error(`Error al guardar foto: ${error.message}`);
        }
    }

    // ✅ FUNCIÓN PARA ELIMINAR FOTO ANTIGUA
    async function eliminarFotoAntigua(rutaFoto) {
        try {
            if (rutaFoto && !rutaFoto.includes('unsplash.com') && rutaFoto.startsWith('/uploads/')) {
                const rutaCompleta = path.join(__dirname, '../../..', rutaFoto);
                if (fs.existsSync(rutaCompleta)) {
                    fs.unlinkSync(rutaCompleta);
                    logger.db('PHOTO_DELETED', 'Usuario', { archivo: rutaFoto });
                }
            }
        } catch (error) {
            logger.error('usuarios-controller', 'Error al eliminar foto antigua', error, { rutaFoto });
            // No lanzar error para no interrumpir el proceso principal
        }
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

            // ✅ PROCESAR FOTO SI SE PROPORCIONA (solo para actualizaciones)
            if (body.Foto && body.Foto.startsWith('data:image/') && body.IDUsuario) {
                try {
                    logger.start('usuarios-controller', 'Procesando foto de perfil', { 
                        IDUsuario: body.IDUsuario 
                    });

                    // Obtener foto anterior para eliminarla después
                    const usuarioExistente = await db.uno(TABLA, body.IDUsuario);
                    const fotoAnterior = usuarioExistente?.[0]?.Foto;

                    // Guardar nueva foto
                    usuario.Foto = await guardarFoto(body.Foto, body.IDUsuario);
                    
                    logger.success('usuarios-controller', 'Foto de perfil procesada', {
                        IDUsuario: body.IDUsuario,
                        nuevaFoto: usuario.Foto
                    });

                    // Eliminar foto anterior si existe
                    if (fotoAnterior) {
                        await eliminarFotoAntigua(fotoAnterior);
                    }

                } catch (fotoError) {
                    logger.error('usuarios-controller', 'Error al procesar foto', fotoError, { 
                        IDUsuario: body.IDUsuario 
                    });
                    // No lanzar error para permitir que continúe sin foto
                    usuario.Foto = null;
                }
            }
            
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
                Correo: usuario.Correo,
                tieneFoto: !!usuario.Foto
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
            
            // ✅ ELIMINAR FOTO DEL USUARIO ANTES DE BORRAR EL REGISTRO
            try {
                const usuario = await db.uno(TABLA, body.IDUsuario);
                const fotoUsuario = usuario?.[0]?.Foto;
                if (fotoUsuario) {
                    await eliminarFotoAntigua(fotoUsuario);
                }
            } catch (fotoError) {
                logger.error('usuarios-controller', 'Error al eliminar foto del usuario', fotoError, { 
                    IDUsuario: body.IDUsuario 
                });
                // Continuar con la eliminación aunque falle la eliminación de la foto
            }
            
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