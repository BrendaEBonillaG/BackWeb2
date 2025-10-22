const auth = require('../../auth');

module.exports = function chequearAuth() {
    function middleware(req, res, next) {
        auth.chequearAuthToken.confirmarToken(req);
        next();
    }

    return middleware; // ← FALTABA ESTE RETURN
}