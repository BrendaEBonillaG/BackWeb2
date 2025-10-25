const auth = require('../../auth');

module.exports = function chequearAuth() {
    function middleware(req, res, next) {
        const id = req.body.IDUsuario; 
        
        if (!id || id === 0) {
            return next();
        }
        
        try {
            if (!auth || !auth.chequearAuthToken) {
                throw new Error('Error de configuración de autenticación');
            }
            
            if (!req.headers.authorization) {
                throw new Error('Token de autorización requerido');
            }
            
            if (typeof auth.chequearAuthToken.confirmarToken !== 'function') {
                throw new Error('Error en función de autenticación');
            }
            
            auth.chequearAuthToken.confirmarToken(req, id);
            next();
            
        } catch (error) {
            res.status(401).json({ 
                error: true,
                status: 401,
                body: error.message 
            });
        }
    }

    return middleware;
}