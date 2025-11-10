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

class Comentarios extends Model {}

Comentarios.init({
    IDComentarios: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Texto: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    Fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    UsuarioFK: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ResenaFK: {
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
    modelName: 'Comentarios',
    tableName: 'Comentarios',
    timestamps: false
});

module.exports = {
    Comentarios,
    sequelize
};