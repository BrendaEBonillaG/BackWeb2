const bcrypt = require('bcrypt');
const auth = require('../../auth');
const TABLA = 'Auth';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }

    async function login(usuario, password) {
        const data = await db.query(TABLA, {Usuario: usuario});
        
        // Verificar si se encontró el usuario
        if (!data) {
            throw new Error('Usuario no encontrado');
        }
        
        return bcrypt.compare(password, data.Password)
        .then(resultado => {
            if (resultado === true) {
                // Generar token
                return auth.asignarToken({...data});
            } else {
                throw new Error('Contraseña incorrecta');
            }
        });
    }

    async function agregar(data) {
        const authData = {
            IDAuth: data.id,
        }
        if(data.usuario){
            authData.Usuario = data.usuario;
        }
        if(data.password){
            authData.Password = await bcrypt.hash(data.password.toString(), 5);
        }

        return db.agregar(TABLA, authData);
    }

    return {
        agregar,
        login 
    };
}