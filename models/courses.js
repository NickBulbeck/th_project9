'use strict';
const Sequelize = require('sequelize');
module.exports = (sequelize) => {
  class Courses extends Sequelize.Model {
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
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      notEmpty: true, // this has no effect
      validate: {
        notNull: {
          msg: 'Please enter the course title'
        },
        notEmpty: {
          args: true,
          msg: "Course title cannot be blank"
        }
      }
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false,
      notEmpty: true, // this has no effect
      validate: {
        notNull: {
          msg: 'Please enter the course description'
        },
        notEmpty: {
          args: true,
          msg: "Course description cannot be blank"
        }
      }
    },
    estimatedTime: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "Nobody knows..."
      // validate: {
      //   notNull: {
      //     msg: `Please enter an estimated time (because if you can't, we're not disposed to believe you've really organised the course terribly well)`
      //   }
      // }
    },
    materialsNeeded: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "No materials needed"
      // validate: {
      //   notNull: {
      //     msg: `Please indicate what materials are needed for this course (if none, please state this explicitly)`
      //   }
      // }
    },
    userId: {
      type: Sequelize.INTEGER,
      references: {
        model: {
          tableName: 'users',
          schema: 'schema'
        },
        key: 'id'
      },
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