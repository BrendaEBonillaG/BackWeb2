const auth = require('../auth');

module.exports = function chequearAuth() {
    function middleware(req, res, next) {
        console.log('=== MIDDLEWARE DE SEGURIDAD ===');
        console.log('Body completo:', req.body);
        console.log('IDUsuario:', req.body.IDUsuario);
        console.log('Headers:', req.headers);
        
        const id = req.body.IDUsuario; 
        
        // ✅ PERMITIR CREACIÓN DE USUARIOS SIN AUTENTICACIÓN
        if (!id || id === 0) {
            console.log('Creación de nuevo usuario - permitido sin autenticación');
            return next();
        }
        
        // ✅ SOLO APLICAR AUTENTICACIÓN PARA ACTUALIZAR/ELIMINAR USUARIOS EXISTENTES
        try {
            auth.chequearAuthToken.confirmarToken(req, id);
            console.log('Autorización exitosa para usuario existente');
            next();
        } catch (error) {
            console.log('Error de autorización:', error.message);
            res.status(401).json({ error: error.message });
        }
    }

    return middleware;
}