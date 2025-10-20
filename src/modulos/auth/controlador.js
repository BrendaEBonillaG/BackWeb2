const auth = require('.');

const TABLA = 'Auth';
const bcrypt = require('bcrypt');

module.exports = function (dbinyectada) {

    let db = dbinyectada;

    if (!db) {
        db = require('../../DB/mysql');
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
        agregar
    }
}