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

class Usuario extends Model {}

Usuario.init({
    IDUsuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Correo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    Telefono: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    Foto: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'Usuario',
    timestamps: false
});

module.exports = {
    Usuario,
    sequelize
};