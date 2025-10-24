const auth = require('../auth');

module.exports = function chequearAuth() {
    function middleware(req, res, next) {
        
        const id = req.body.IDUsuario; 
        
        if (!id || id === 0) {
            return next();
        }
        
        try {
            auth.chequearAuthToken.confirmarToken(req, id);
            next();
        } catch (error) {
            console.log('Error de autorización:', error.message);
            res.status(401).json({ error: error.message });
        }
    }

    return middleware;
}