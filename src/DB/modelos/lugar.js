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

class Lugar extends Model {}

Lugar.init({
    IDLugar: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Direccion: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    Info: {
        type: DataTypes.STRING(400),
        allowNull: false
    },
    Tipo: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    Latitud: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    Longitud: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },
    URLMapa: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    Activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Lugar',
    tableName: 'Lugar',
    timestamps: false
});

module.exports = {
    Lugar,
    sequelize
}