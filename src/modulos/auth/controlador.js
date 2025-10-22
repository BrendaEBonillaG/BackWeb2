const bcrypt = require('bcrypt');
const auth = require('../../auth');
const TABLA = 'Auth';

module.exports = function (dbinyectada) {
    let db = dbinyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }

    async function login(usuario, password) {
        console.log('Usuario recibido:', usuario);
        console.log('Buscando en tabla:', TABLA);

        const data = await db.query(TABLA, { Usuario: usuario });
        console.log('Datos encontrados:', data);

        if (!data || Object.keys(data).length === 0) {
            console.log('No se encontró usuario con:', usuario);
            throw new Error('Usuario no encontrado');
        }

        console.log('Password en DB:', data.Password);
        const resultado = await bcrypt.compare(password, data.Password);
        console.log('Resultado de bcrypt:', resultado);

        if (resultado === true) {
            return auth.asignarToken({ ...data });
        } else {
            throw new Error('Contraseña incorrecta');
        }
    }
    async function agregar(data) {
    const authData = {
        IDAuth: data.id,
    }
    if (data.usuario) {
        authData.Usuario = data.usuario;
    }
    if (data.password) {
        authData.Password = await bcrypt.hash(data.password.toString(), 5);
    }

    // Usar la función agregar normal del db
    return await db.agregar(TABLA, authData);
}


    return {
        agregar,
        login
    };
}