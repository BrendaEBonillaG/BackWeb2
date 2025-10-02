const db =  require('../../DB/mysql');

const TABLA = 'Usuario';

function todos (){
    return db.todos(TABLA);
}

function uno (id){
    return db.uno(TABLA, id);
}

function eliminar (body){
    return db.eliminar(TABLA, body);
}

module.exports = {
    todos,
    uno,
    eliminar
}