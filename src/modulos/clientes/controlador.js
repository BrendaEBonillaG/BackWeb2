const db =  require('../../DB/mysql');

const TABLA = 'Usuario';

function todos (){
    return db.todos(TABLA);
}

module.exports = {
    todos
}