const bcrypt = require('bcrypt');
const auth = require('../../auth');
const { logger } = require('../../utils/logger'); 
const TABLA = 'Auth';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }

    async function login(body) {
        try {
            logger.start('auth', 'Proceso de login iniciado', { 
                usuario: body.Usuario,
                tienePassword: !!body.Password 
            });

            const { Usuario, Password } = body;

            if (!Usuario || !Password) {
                const error = new Error('Usuario y Password son requeridos');
                logger.error('auth', 'Validación fallida en login', error, {
                    usuarioProporcionado: !!Usuario,
                    passwordProporcionado: !!Password
                });
                throw error;
            }

            logger.db('QUERY', 'Auth', { usuario: Usuario });
            const data = await db.query(TABLA, { Usuario: Usuario });
         
            if (!data) {
                const error = new Error('Usuario no encontrado');
                logger.error('auth', 'Usuario no encontrado en base de datos', error, {
                    usuarioBuscado: Usuario
                });
                throw error;
            }

            logger.success('auth', 'Usuario encontrado en Auth', {
                IDAuth: data.IDAuth,
                usuario: data.Usuario
            });

            logger.start('auth', 'Verificando contraseña', { IDAuth: data.IDAuth });
            const resultado = await bcrypt.compare(Password, data.Password);

            if (resultado === true) {
                logger.success('auth', 'Contraseña verificada correctamente', { IDAuth: data.IDAuth });

                logger.db('SELECT_ONE', 'Usuario', { id: data.IDAuth });
                const usuarioCompleto = await db.uno('Usuario', data.IDAuth);
                
                if (!usuarioCompleto || usuarioCompleto.length === 0) {
                    const error = new Error('Información de usuario no encontrada');
                    logger.error('auth', 'Usuario no encontrado en tabla Usuario', error, {
                        IDAuth: data.IDAuth
                    });
                    throw error;
                }

                const usuarioData = usuarioCompleto[0];
                logger.success('auth', 'Información de usuario obtenida', {
                    IDUsuario: usuarioData.IDUsuario,
                    nombre: usuarioData.Nombre
                });
                
                logger.start('auth', 'Generando token JWT', {
                    IDUsuario: usuarioData.IDUsuario,
                    IDAuth: data.IDAuth
                });

                const token = auth.asignarTokenUsuario({
                    IDUsuario: usuarioData.IDUsuario,     
                    IDAuth: data.IDAuth,                 
                    Usuario: data.Usuario,
                    CorreoElectronico: usuarioData.CorreoElectronico,
                    Nombre: usuarioData.Nombre
                });

                logger.success('auth', 'Token JWT generado exitosamente', {
                    IDUsuario: usuarioData.IDUsuario,
                    tokenGenerado: true
                });

                const response = {
                    token: token,
                    usuario: {
                        IDUsuario: usuarioData.IDUsuario, 
                        IDAuth: data.IDAuth,
                        Usuario: data.Usuario,
                        Nombre: usuarioData.Nombre,
                        CorreoElectronico: usuarioData.CorreoElectronico
                    }
                };

                logger.success('auth', 'Login completado exitosamente', {
                    IDUsuario: usuarioData.IDUsuario,
                    usuario: data.Usuario
                });

                return response;

            } else {
                const error = new Error('Contraseña incorrecta');
                logger.error('auth', 'Contraseña incorrecta', error, {
                    IDAuth: data.IDAuth,
                    usuario: data.Usuario
                });
                throw error;
            }
        } catch (error) {
            logger.error('auth', 'Error en proceso de login', error, {
                usuarioIntentado: body.Usuario
            });
            throw new Error(`Error en login: ${error.message}`);
        }
    }

    async function agregar(data) {
        try {
            logger.start('auth', 'Creando nuevas credenciales', {
                tieneId: !!data.id,
                tieneUsuario: !!data.usuario,
                tienePassword: !!data.password
            });

            if (!data.id) {
                const error = new Error('ID es requerido');
                logger.error('auth', 'Validación fallida en agregar credenciales', error);
                throw error;
            }
            if (!data.password) {
                const error = new Error('El campo Password es requerido');
                logger.error('auth', 'Validación fallida en agregar credenciales', error);
                throw error;
            }

            const authData = {
                IDAuth: data.id,
            };
            
            if (data.usuario) {
                authData.Usuario = data.usuario;
            }
            
            if (data.password) {
                logger.start('auth', 'Hasheando contraseña', { IDAuth: data.id });
                authData.Password = await bcrypt.hash(data.password.toString(), 5);
                logger.success('auth', 'Contraseña hasheada', { IDAuth: data.id });
            }

            logger.db('INSERT', 'Auth', { IDAuth: data.id });
            const resultado = await db.agregar(TABLA, authData);

            logger.success('auth', 'Credenciales creadas exitosamente', {
                IDAuth: data.id,
                usuario: data.usuario || 'No proporcionado'
            });
    
            return resultado;

        } catch (error) {
            logger.error('auth', 'Error al crear credenciales', error, {
                IDAuth: data.id,
                usuario: data.usuario
            });
            throw new Error(`Error al crear credenciales: ${error.message}`);
        }
    }

    async function verificarToken(req) {
        try {
            logger.start('auth', 'Verificando token JWT');
            
            const decodificado = auth.decodificarCabecera(req);
            
            logger.success('auth', 'Token verificado exitosamente', {
                IDUsuario: decodificado.IDUsuario,
                IDAuth: decodificado.IDAuth,
                usuario: decodificado.Usuario
            });

            return decodificado;
        } catch (error) {
            logger.error('auth', 'Error al verificar token', error);
            throw error;
        }
    }

    return {
        agregar,
        login,
        verificarToken 
    };
};