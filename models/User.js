const database = require('../config/db').database;
const Photo = require('./Photo').photo;
var Sequelize = require('sequelize');

const User = database.define("user", {
    userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

User.hasMany(Photo, {
    foreignKey: 'userId'
});

module.exports.user = User;