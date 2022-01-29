'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Courses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Courses.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter the course title'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Please enter the course description'
        }
      }
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNull: {
          msg: `Please enter an estimated time (because if you can't, we're not disposed to believe you've really organised the course terribly well)`
        }
      }
    },
    materialsNeeded: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isNull: {
          msg: `Please indicate what materials are needed for this course (if none, please state this explicitly)`
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: {
          tableName: 'users',
          schema: 'schema'
        },
        key: 'id'
      },
      allowNull: false,
      validate: {
        isNull: {
          msg: 'The user ID for this course was not supplied to the database'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Courses',
  });
  Courses.associate = (models) => {
    Courses.belongsTo(models.Users, {
      foreignKey: {
        fieldName: 'userId',
        allowNull: false
      }
    });
  };
  return Courses;
};