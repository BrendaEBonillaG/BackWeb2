const jwt = require('jsonwebtoken');
const config = require('../config');

const secret = config.jwt.secret;

function asignarToken(data){
    return jwt.sign(data, secret);
}

function verificarToken(token){
    return jwt.verify(token, secret);
}

module.exports = {
    asignarToken,
    verificarToken
}