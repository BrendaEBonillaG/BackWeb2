const auth = require('.');

const TABLA = 'Auth';

module.exports = function (dbinyectada) {

    let db = dbinyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }
  
    function agregar(data) {
        const authData = {
            IDAuth: data.id,
        }
        if(data.usuario){
            authData.Usuario = data.usuario;
        }
        if(data.password){
            authData.Password = data.password;
        }

        return db.agregar(TABLA, authData);
    }

    return {
        agregar
    }
}