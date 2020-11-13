const database = require('../config/db').database;
var Sequelize = require('sequelize');

const Photo = database.define("photo", {
    photoId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.INTEGER
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    },
    birdName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    location: {
        type: Sequelize.STRING
    },
    likes: {
        type: Sequelize.ARRAY(Sequelize.STRING)
    }
    
   })

 module.exports.photo = Photo;  