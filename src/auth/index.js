const jwt = require('jsonwebtoken');
const config = require('../config');
const error = require('../middleware/errors');

const secret = config.jwt.secret;

function asignarToken(data) {
    const payload = {
        ...data,
        IDUsuario: data.IDUsuario || data.id || null
    };
    return jwt.sign(payload, secret);
}

function verificarToken(token) {
    return jwt.verify(token, secret);
}

const chequearAuthToken = {
    confirmarToken: function (req, id) {
        const decodificado = decodificarCabecera(req);
        const tokenId = parseInt(decodificado.IDAuth);
        const targetId = parseInt(id);
        
        if(tokenId !== targetId){
            throw error("No estas autorizado para hacer esto", 401);
        }
        
    }
}

function obtenerToken(autorizacion) {
    if (!autorizacion) {
        throw error('No viene token', 401);
    }

    if (autorizacion.indexOf('Bearer') === -1) {
        throw error('Formato invalido', 401);
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

function asignarTokenUsuario(usuario) {
    const payload = {
        IDUsuario: usuario.IDUsuario,    
        IDAuth: usuario.IDAuth,            
        CorreoElectronico: usuario.CorreoElectronico,
        Nombre: usuario.Nombre,
    };
    return jwt.sign(payload, secret);
}

module.exports = {
    asignarToken,
    asignarTokenUsuario, 
    chequearAuthToken,
    decodificarCabecera  
};