const auth = require('../auth');
const TABLA = 'Usuario';

module.exports = function (dbinyectada) {
    let db = dbinyectada;
    if(!db){
        db = require('../../DB/mysql');
    }

    function todos (){
        return db.todos(TABLA);
    }

    function uno (id){
        return db.uno(TABLA, id);
    }

    async function agregar (body){
        const usuario = {
            Nombre: body.Nombre,
            Correo: body.Correo,
            Telefono: body.Telefono,
            Foto: body.Foto,
            Activo: body.Activo
        }
        
        if(body.IDUsuario && body.IDUsuario > 0){
            usuario.IDUsuario = body.IDUsuario;
        }
        
        const respuesta = await db.agregar(TABLA, usuario);
        const insertId = (body.IDUsuario && body.IDUsuario > 0) ? body.IDUsuario : respuesta.insertId;

        if(body.Usuario || body.Password){
            await auth.agregar({
                id: insertId,
                usuario: body.Usuario,
                password: body.Password
            });
        }

        return respuesta;
    }

    function eliminar (body){
        return db.eliminar(TABLA, body.IDUsuario);
    }

    return {
        todos,
        uno,
        agregar,
        eliminar
    }
}