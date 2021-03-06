//  Middleware that either sends an "access denied" 401 response, 
//  or the user record of an authenticated user (without password or metadata).
//  Username and password are checked via bcrypt.
//  Takes an optional boolean argument - if this is set to "true", the user will
//  only be authenticated if their role is "admin".
//  

const auth = require('basic-auth');
const User = require('../models').Users;
const bcrypt = require('bcrypt');

const authenticateUser = (mustBeAdmin=false) => {
  return async (req,res,next) => {
    let message;
    let status;
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
          .compareSync(credentials.pass, user.dataValues.password);
        if (authenticated) {
          const isAdmin = user.dataValues.role === "admin";
          if (mustBeAdmin && !isAdmin) {
            console.warn(`Insufficient privileges: ${user.emailAddress}`);
            message = "Forbidden";
            status = 403;
          } 
          console.warn(`Authentication successful for ${user.emailAddress}`);
          delete user.dataValues.password; // NOW we can horse the password.
          req.currentUser = user.dataValues;
        } else {
          console.warn(`Authentication failed for ${user.emailAddress}`);
          message = "Access denied";
          status = 401;
        }
      } else {
        console.warn(`User not found for ${credentials.name}`);
        message = "Access denied";
        status = 401;
      }
    } else {
      console.warn('Auth header not found')
      message = "Access denied";
      status = 401
    }
  // Finally...
    if (message) {
      res.status(status).json({message: message});
    } else {
      next();
    }
  }
}


// module.exports.standardUserAuth = standard;
module.exports.authenticateUser = authenticateUser;