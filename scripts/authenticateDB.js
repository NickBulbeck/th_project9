const sequelize = require('../models/index.js').sequelize;

const testConnection = async () => {
// authenticate:
  try {
    await sequelize.authenticate({force:false});
    console.log(`Authentication successful: ${sequelize.options.storage}`);
  } catch(error) {
    console.log(`Authentication failed: ${error.status}, ${error.message}`);
  }
// synchronise:
  try {
    sequelize.sync({force:false});
    console.log("sync() performed successfully");
  } catch(error) {
    console.log(`Synchronisation failed: ${error.status}, ${error.message}`);
  }

}

module.exports.testConnection = testConnection;