const express = require('express');
const router = express.Router();

const asyncHandler = require('../scripts/asyncHandler.js').asyncHandler;
const users = require('../models').Users;
const authenticateUser = require('../scripts/authenticateUser').authenticateUser;

//***********************************************************************
// User routes:
//***********************************************************************
router.get('/', authenticateUser(), asyncHandler(async (req,res,next) => {
  // Returns current authorised user, whether they are standard or admin
    res.status(200).json(req.currentUser);
  }));


router.get('/all', authenticateUser(true), asyncHandler(async (req,res,next) => {
// Returns all users; can only be used by admin users
  const users = require('../models').Users;
  const allUsers = {};
  allUsers.users = await users.findAll({
    attributes: {
      exclude:  [ "password",
                  "createdAt",
                  "updatedAt"
                ]
    }
  });
  res.status(200).json(allUsers);
}));

router.get('/:id', authenticateUser(true), asyncHandler(async (req,res,next) => {
  // Returns single user; admin users only
  // Check that :id is numeric.
  const id = parseInt(req.params.id);
  if (!id) {
    const error = new Error("Invalid user id");
    error.status = 400;
    console.log(`Attempt to get data for user id '${req.params.id}'`);
    throw(error);
  }
  let user = null;
  try {
    user = await users.findOne({
      where: {
        id: id
      },
      attributes: {
          exclude:  [ "password",
                      "createdAt",
                      "updatedAt"
                    ]
      }
    })
  } catch(error) {
    console.log(`Error trying to find user id ${id}`);
    throw(error);
  }
  if (!user) {
    res.status(404).json({message: `User ${req.params.id} not found`});
  } else {
    res.status(200).json(user);
  }
}));


router.post('/', asyncHandler(async (req,res,next) => {
// don't need authorisation to do this.
  req.body.role = "standard"; // belt and braces - can't create an unauthorised admin 
  try {
    await users.create(req.body);
    res.status(201).location('/').end();
  } catch(error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({errors});
    } else {
      console.log(error);
      next(error);
    }
  }
}));
  
router.put('/', authenticateUser(), asyncHandler(async (req,res,next) => {
// updates the current authorised user, whether standard or admin
  // current authorised user only; returns 204 status with no content
  req.body.role = req.currentUser.role; // Can't change your own user role
  const updatedRecord = req.body;
  try {
    const existingRecord = await users.findOne({
      where: {
        emailAddress: req.currentUser.emailAddress
      }
    })
// Note that the current user has already been checked in authenticateUser(), so userRecord 
// can't be null here.
    for (property in existingRecord) {
      if (!updatedRecord[property]) {
        updatedRecord[property] = property;
      }
    }
    await existingRecord.update(updatedRecord);
    res.status(204).end();
  } catch(error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({errors});
    } else {
      console.log(error);
      next(error);
    }
  }
}));

router.put('/:id', authenticateUser(true), asyncHandler(async (req,res,next) => {
  const id = req.params.id;
  if (!id) {
    const error = new Error;
    error.message = "Invalid user id";
    error.status = 400;
    console.log(`Attempt to update non-existent user with id '${req.params.id}'`);
    throw(error);
  }
  if (id === req.currentUser.emailAddress) {  // See tae be hoanest... I was kind of  
    res.redirect(307,'/api/users');           // mucking about here. The idea is that ye
  }                                           // cannae gub yer ain user record.
  const updatedRecord = req.body;
  try {
    const existingRecord = await users.findOne({
      where: {
        id: id
      }
    })
// Note that the current user has NOT been checked in authenticateUser(), so we need to 
// trap a potential error here
    if (!existingRecord) {
      const error = new Error("No user record matched your input");
      error.status = 404;
      throw(error);
    }
    for (property in existingRecord) {
      if (!updatedRecord[property]) {
        updatedRecord[property] = property;
      }
    }
// The user's "role" property CAN be updated via this route. Since you've already been
// redirected if you ARE the user, and rejected if you're not an admin, this means that
// an admin user can update someone else's role here.
    await existingRecord.update(updatedRecord);
    res.status(204).end();  }
  catch(error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      res.status(400).json({errors});
    } else {
      console.log(error);
      next(error);
    }
  }
}))

router.delete('/:id', authenticateUser(true), asyncHandler(async (req,res,next) => {
  const id = parseInt(req.params.id);
  console.log(`id: ${id}; req.currentUser.id: ${req.currentUser.id}`);
  if (req.currentUser.id === id) {
    res.status(403).json({message : 'Users cannot delete their own records'});
  } else {
    try {
      const deadUser = await users.findOne({
        where: {
          id: id
        }
      });
      await deadUser.destroy();
      res.status(204).end();
    } catch(error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({errors});
      } else {
        console.log(error);
        throw error;
      }
    }
  }
}));


router.get('/adminTest', authenticateUser(true), asyncHandler(async (req,res,next) => {
  res.status(200).json(req.currentUser);
}));


module.exports = router;