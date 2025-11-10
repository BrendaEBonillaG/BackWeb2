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

class Auth extends Model {}

Auth.init({
    IDAuth: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    Usuario: {
        type: DataTypes.STRING(30),
        allowNull: false
    },
    Password: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Auth',
    tableName: 'Auth',
    timestamps: false
});

module.exports = {
    Auth,
    sequelize
};