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

class Resenas extends Model {}

Resenas.init({
    IDResenas: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Calificacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    Texto: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    Ventajas: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    Recomendacion: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    LugarFK: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    UsuarioFK: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    Activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Resenas',
    tableName: 'Resenas',
    timestamps: false
});

module.exports = {
    Resenas,
    sequelize
};