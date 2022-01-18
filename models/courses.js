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
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: {
          tableName: 'users',
          schema: 'schema'
        },
        key: 'id'
      },
      allowNull: false
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