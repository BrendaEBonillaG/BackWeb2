const jwt = require('jsonwebtoken');
const config = require('../config');
const error = require('../middleware/errors');

const secret = config.jwt.secret;

function asignarToken(data) {
    // ✅ Asegurarse de que data incluya IDUsuario para las reseñas
    const payload = {
        ...data,
        // Si data es un objeto de usuario, asegurar que tenga IDUsuario
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

// ✅ NUEVA FUNCIÓN: Específica para generar tokens de usuario
function asignarTokenUsuario(usuario) {
    const payload = {
        IDUsuario: usuario.IDUsuario,      // ✅ CRUCIAL para reseñas
        IDAuth: usuario.IDAuth,            // ✅ Para compatibilidad existente
        CorreoElectronico: usuario.CorreoElectronico,
        Nombre: usuario.Nombre,
        // ... otros campos que necesites
    };
    return jwt.sign(payload, secret);
}

module.exports = {
    asignarToken,
    asignarTokenUsuario, // ✅ Exportar la nueva función
    chequearAuthToken,
    decodificarCabecera  // ✅ Exportar para usar en rutas
};