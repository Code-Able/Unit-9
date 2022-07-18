'use strict';

//import model and data types from sequelize
const { Model, DataTypes} = require('sequelize');

//import password encryption library
const bcrypt = require('bcryptjs');

//create user model
module.exports = (sequelize) => {
    class User extends Model {}
    User.init({
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Please provide a value for your first name.'
          },
          notNull: {
            msg: 'Please provide a value for your first name'
          }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Please provide a value for your last name'
          },
          notNull: {
            msg: 'Please provide a value for your last name'
          }
        }
      },
      emailAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: {
            msg: 'The email you entered already exists'
          },
          validate: {
            notEmpty: {
              msg: 'Please provide a value for your email address'
            },
            notNull: {
              msg: 'Please provide a value for your email address'
            },
            isEmail: {
              msg: 'Please provide a valid email address'
            }
          }
        },
      password: {
          type: DataTypes.STRING,  // set a virtual field
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'Please provide a value for the password'
            },
            notNull: {
              msg: 'Please provide a value for the password'
            },
            len: {
              args: [8-20],
              msg: 'The password should be between 8-20 characters in length'
            },
            // Password Security
            set(val){
              if(val){
                  const hashedPassword = bcrypt.hashSync(val, 10);
                  this.setDataValue('password', hashedPassword);
              }
           }
         }
       },

        // Password Security
      //   confirmedPassword: { 
      //     type: DataTypes.STRING,
      //     allowNull: false,
      //     set(val){
      //       if ( val === this.password) {
      //         const hashedPassword = bcrypt.hashSync(val, 10);
      //         this.setDataValue('confirmedPassword', hashedPassword);
      //       }
      //     },
      //     validate: {
      //       notNull: {
      //         msg: 'Both passwords must match'
      //       }       
      //   }
      // },
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    }, { sequelize });

  // Create a to many association with the Course table
  User.associate = (models) => {
    User.hasMany(models.Course, {
        as: 'user',
        foreignKey: {
            fieldName: 'userId',
            allowNull: false
        }
    });
 }

  return User;
};