'use strict';
const Sequelize = require('sequelize');

//import model and data types from sequelize
const { Model, DataTypes} = require('sequelize');

//create course model
module.exports = (sequelize) => {
    class Course extends Model {}
    Course.init({
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Please provide a value for the title.'
          },
          notNull: {
            msg: 'Please provide a value for the title'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Please provide a value for the description'
          },
          notNull: {
            msg: 'Please provide a value for the description'
          }
        }
      },
      estimatedTime: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'Please provide a value for the estimated time'
            },
            notNull: {
              msg: 'Please provide a value for the estimated time'
            }
          }
        },
      materialsNeeded: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'Please provide a value for materials needed'
            },
            notNull: {
              msg: 'Please provide a value for materials needed'
            }
          }
        },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    }, { sequelize });

//Create a one way association to the users table
Course.associate = (models) => {
  Course.belongsTo(models.User, {
      as: 'user',
      foreignKey: {
          fieldName: 'userId',
          allowNull: false
      }
   });
 }

return Course;
};