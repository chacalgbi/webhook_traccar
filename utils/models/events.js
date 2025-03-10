const Sequelize = require('sequelize')
const database = require('./database')

const Events = database.define('events', 
    {
        id:{
            type: Sequelize.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true
        },
        car_id:{
            type: Sequelize.STRING
        },
        car_name: {
            type: Sequelize.STRING
        },
        driver_id: {
            type: Sequelize.STRING
        },
        driver_name: {
            type: Sequelize.STRING
        },
        event_type: {
            type: Sequelize.STRING
        },
        event_name: {
            type: Sequelize.STRING
        },
        message: {
            type: Sequelize.STRING
        }
    },
    {
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }

)

module.exports = Events