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

class Fotos extends Model {}

Fotos.init({
    IDFoto: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Foto: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    LugarFK: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Fotos',
    tableName: 'Fotos',
    timestamps: false
});

module.exports = {
    Fotos,
    sequelize
};