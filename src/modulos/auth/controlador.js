const bcrypt = require('bcrypt');
const auth = require('../../auth');
const TABLA = 'Auth';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }

    async function login(body) {
        try {
            const { Usuario, Password } = body;
            
            // Validaciones
            if (!Usuario || !Password) {
                throw new Error('Usuario y Password son requeridos');
            }


            const data = await db.query(TABLA, { Usuario: Usuario });
         

            if (!data || Object.keys(data).length === 0) {
                throw new Error('Usuario no encontrado');
            }

           
            const resultado = await bcrypt.compare(Password, data.Password);
           

            if (resultado === true) {
                const token = auth.asignarToken({ ...data });
                return {
                    token: token,
                    usuario: {
                        IDAuth: data.IDAuth,
                        Usuario: data.Usuario
                    }
                };
            } else {
                throw new Error('Contraseña incorrecta');
            }
        } catch (error) {
            throw new Error(`Error en login: ${error.message}`);
        }
    }

    async function agregar(data) {
        try {
            
            // Validaciones
            if (!data.id) {
                throw new Error('ID es requerido');
            }
            if (!data.password) {
                throw new Error('El campo Password es requerido');
            }

            const authData = {
                IDAuth: data.id,
            };
            
            if (data.usuario) {
                authData.Usuario = data.usuario;
            }
            
            if (data.password) {
                authData.Password = await bcrypt.hash(data.password.toString(), 5);
            }

          
            const resultado = await db.agregar(TABLA, authData);
     
            
            return resultado;
        } catch (error) {
            throw new Error(`Error al crear credenciales: ${error.message}`);
        }
    }

    return {
        agregar,
        login
    };
};