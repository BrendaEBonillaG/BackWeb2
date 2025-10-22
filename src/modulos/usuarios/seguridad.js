const auth = require('../../auth');

module.exports = function chequearAuth() {
    function middleware(req, res, next) {
        console.log('=== MIDDLEWARE DE SEGURIDAD ===');
        console.log('Body completo:', req.body);
        console.log('IDUsuario:', req.body.IDUsuario);
        console.log('Headers:', req.headers);
        
        const id = req.body.IDUsuario; // ← Cambia req.body.id por req.body.IDUsuario
        try {
            auth.chequearAuthToken.confirmarToken(req, id);
            console.log('✅ Autorización exitosa');
            next();
        } catch (error) {
            console.log('❌ Error de autorización:', error.message);
            res.status(401).json({ error: error.message });
        }
    }

    return middleware;
}