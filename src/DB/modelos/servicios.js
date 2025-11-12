const { Sequelize, DataTypes, Model } = require(`sequelize`);
const config = require(`../../config`);

const sequelize = new Sequelize(
    config.mysql.database,
    config.mysql.user,
    config.mysql.password,
    {
        host: config.mysql.host,
        port: config.mysql.port,
        dialect: `mysql`
    }
);

class Servicios extends Model { }

Servicios.init({
    IDServicios: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    Nombre:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    Logo:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    Activo:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {
    sequelize,
    modelName: `Servicios`,
    tableName: `Servicios`,
    timestamps: false
});

module.exports = {
    Servicios,
    sequelize
}