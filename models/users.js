'use strict';
const bcrypt = require('bcryptjs/dist/bcrypt');
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Users.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please enter a first name"
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please enter a last name"
        }
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: "The email you have entered is already on our system"
      },
      validate: {
        notNull: {
          msg: "Please enter a knee-mail"
        },
        isEmail: {
          msg: "This does not look like a valid email address to us."
          // may need to use /^[^@]+@[a-z]+(\.[a-z]+)+$/i if .co.uk gets bounced.
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Please enter a password of at least 12 characters"
        },
        max: {
          args: [32],
          msg: "We appreciate your commitment to password security, but 32 characters is as much as we store here"
        },
        min: {
          args: [11],
          msg: "Please use at least 11 characters in your password"
        }
      },
      set(val) {
        const hash = bcrypt.hashSync(val,10);
        this.setDataValue("password",hash);
      },
    },
    role: {
      type: DataTypes.STRING,
      validate: {
        isIn: {
          args: [['standard','admin']],
          msg: "role must be 'standard' or 'admin'"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Users',
  });
  Users.associate = (models) => {
    Users.hasMany(models.Courses, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      }
    });
  };
  return Users;
};