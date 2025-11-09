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

class Favoritos extends Model {}

Favoritos.init({
    IDFavoritos: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    UsuarioFK: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    LugarFK: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Favoritos',
    tableName: 'Favoritos',
    timestamps: false
});

module.exports = {
    Favoritos,
    sequelize
};