const mysql = require('mysql');
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
}

let conexion;

function conMysql(){
    conexion = mysql.createConnection(dbconfig);

    conexion.connect((err) => {
        if(err){
            console.log('[db err]', err);
            setTimeout(conMysql, 2000);
        }else{
            console.log('DB conectada');
        }
    });

    conexion.on('error', err => {
        console.log('[db err]', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            conMysql();
        } else{
            throw err;
        }
    });
}

conMysql();

// Actualización de la consulta para que el nombre de la tabla sea un parámetro dinámico
function todos(tabla){
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ??`; // Usamos ?? para identificar una tabla de forma segura
        conexion.query(query, [tabla], (error, results) => {
            if(error) return reject(error);
            resolve(results);
        });
    });
}

function uno(tabla, id) {
    // Consulta para obtener un solo registro de una tabla
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? WHERE id = ?`; // Usamos ?? para la tabla y ? para el valor de id
        conexion.query(query, [tabla, id], (error, results) => {
            if(error) return reject(error);
            resolve(results);
        });
    });
}

function agregar(tabla, data){
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO ?? SET ?`; // Usamos ?? para la tabla y ? para los valores a insertar
        conexion.query(query, [tabla, data], (error, results) => {
            if(error) return reject(error);
            resolve(results);
        });
    });
}

function eliminar(tabla, id){
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM ?? WHERE id = ?`; // Usamos ?? para la tabla y ? para el valor de id
        conexion.query(query, [tabla, id], (error, results) => {
            if(error) return reject(error);
            resolve(results);
        });
    });
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar
};
