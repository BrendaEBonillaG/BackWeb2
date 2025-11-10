const { Sequelize, DataTypes, Model } = require('sequelize');
const config = require('../../config');

const sequelize = new Sequelize(
    config.mysql.database,
    config.mysql.user,
    config.mysql.password,
    {
        host: config.mysql.host,
        port: config.mysql.port,
        dialect: 'mysql'
    }
);

class Lugar_Servicio extends Model {}

Lugar_Servicio.init({
    IDLugar: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    IDServicio: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    sequelize,
    modelName: 'Lugar_Servicio',
    tableName: 'Lugar_Servicio',
    timestamps: false
});

module.exports = {
    Lugar_Servicio,
    sequelize
};