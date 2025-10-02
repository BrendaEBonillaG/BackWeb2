const db =  require('../../DB/mysql');

const TABLA = 'Usuario';

function todos (){
    return db.todos(TABLA);
}

function uno (id){
    return db.uno(TABLA, id);
}

module.exports = {
    todos,
    uno
}