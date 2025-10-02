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

function todos(tabla){
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ??`; 
        conexion.query(query, [tabla], (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

function uno(tabla, id) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? WHERE IDUsuario = ?`; 
        conexion.query(query, [tabla, id], (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
}

function agregar(tabla, data){
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO ?? SET ?`; 
        conexion.query(query, [tabla, data], (error, results) => {
            if(error) return reject(error);
            resolve(results);
        });
    });
}

function eliminar(tabla, id){
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM ?? WHERE id = ?`; 
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
