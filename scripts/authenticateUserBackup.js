const auth = require('basic-auth');
const User = require('../models').Users;
const bcrypt = require('bcrypt');
let message;

const standard = async (req,res,next) => {
  const credentials = auth(req);
  if (credentials) {
    const user = await User.findOne({
      where: {
        emailAddress: credentials.name // Find a way of changing this variable name?
      },
      attributes: {
        exclude:  [ 
                    "createdAt",
                    "updatedAt"
                  ] // can't exclude password yet because we need it!
      }
    });
    if (user) {
      const authenticated = bcrypt
        .compareSync(credentials.pass, user.password);
      if (authenticated) {
        console.log(`Authentication successful for ${user.emailAddress}`);
        delete user.dataValues.password; // NOW we can horse the password.
        req.currentUser = user.dataValues;
      } else {
        message = `Authentication failed for ${user.emailAddress}`;
      }
    } else {
      message = `User not found for ${credentials.name}`;
    }
  } else {
    message = 'Auth header not found';
  }
// Finally...
  if (message) {
    console.warn(message);
    res.status(401).json({message: `Access Denied`});
  } else {
    next();
  }
}



const admin = async (req,res,next) => {




  next();
}
module.exports.standardUserAuth = standard;
module.exports.adminUserAuth = admin;