const jwt = require('jsonwebtoken');
const config = require('../config');

const secret = config.jwt.secret;

function asignarToken(data) {
    return jwt.sign(data, secret);
}

function verificarToken(token) {
    return jwt.verify(token, secret);
}

const chequearAuthToken = {
    confirmarToken: function (req, id) {
        const decodificado = decodificarCabecera(req);
        
        console.log('=== VERIFICANDO AUTORIZACIÓN ===');
        console.log('ID del token:', decodificado.IDAuth); // ← Cambiado a IDAuth
        console.log('ID a modificar:', id);
        console.log('Datos completos del token:', decodificado);

        // Convierte ambos a número para comparar correctamente
        const tokenId = parseInt(decodificado.IDAuth);
        const targetId = parseInt(id);
        
        if(tokenId !== targetId){
            throw new Error("No estas autorizado para hacer esto");
        }
        
        console.log('✅ Autorización verificada correctamente');
    }
}

function obtenerToken(autorizacion) {
    if (!autorizacion) {
        throw new Error('No viene token');
    }

    if (autorizacion.indexOf('Bearer') === -1) {
        throw new Error('Formato invalido');
    }

    let token = autorizacion.replace('Bearer ', '')
    return token;
}

function decodificarCabecera(req) {
    const autorizacion = req.headers.authorization || '';
    const token = obtenerToken(autorizacion);
    const decodificado = verificarToken(token);

    req.user = decodificado;

    return decodificado;
}

module.exports = {
    asignarToken,
    chequearAuthToken
}