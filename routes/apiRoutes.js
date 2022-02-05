const express = require('express');
const router = express.Router();

const asyncHandler = require('../scripts/asyncHandler.js').asyncHandler;
const users = require('../models').Users;
const courses = require('../models').Courses;
// const authenticateUserBackup = require('../scripts/authenticateUserBackup').standardUserAuth;
const authenticateUser = require('../scripts/authenticateUser').authenticateUser;

//***********************************************************************
// User routes:
//***********************************************************************
router.get('/users', authenticateUser(), asyncHandler(async (req,res,next) => {
// Returns current authorised user, whether they are standard or admin
  res.status(200).json(req.currentUser);
}));

router.get('/users/all', authenticateUser(true), asyncHandler(async (req,res,next) => {
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

router.post('/users', asyncHandler(async (req,res,next) => {
// don't need authorisation to do this.
  req.body.role = "standard"; // belt and braces - can't create an unauthorised admin 
  try {
    await users.create(req.body);
    res.status(201).end();
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

router.put('/users', authenticateUser(), asyncHandler(async (req,res,next) => {
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

router.put('/users/:id', authenticateUser(true), asyncHandler(async (req,res,next) => {
  const id = req.params.id;
  if (id === req.currentUser.emailAddress) {  // See tae be hoanest... I was kind of  
    res.redirect(307,'/api/users');           // mucking about here. The idea is that ye
  }                                           // cannae gub yer ain user record.
  const updatedRecord = req.body;
  try {
    const existingRecord = await users.findOne({
      where: {
        emailAddress: req.currentUser.emailAddress
      }
    })
// Note that the current user has NOT been checked in authenticateUser(), so we need to 
// trap a potential error here
    if (!existingRecord) {
      throw new Error("No user record matched your input");
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

router.delete('/users/:id', authenticateUser(true), asyncHandler(async (req,res,next) => {
  const id = req.params.id;
  if (req.currentUser.emailAddress === id) {
    res.status(401).json({"message" : "Users cannot delete their own records"});
  }
  try {
    const deadUser = await users.findOne({
      where: {
        emailAddress: id
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
// admin users only. Mind and add the "tbd" user to a' the relevant courses too.
// returns 204 status with no content
}));

//***********************************************************************
// Course routes:
//***********************************************************************

router.get('/courses', asyncHandler(async (req,res,next) => {
  // gets them a'. Returns 200 status. No authorisation needed.
}));

router.get('/courses/:id', asyncHandler(async (req,res,next) => {
  // no authorisation needed. Returns 200 status.
}));

router.post('/courses', asyncHandler(async (req,res,next) => {
  // inclined to make this admin only, but that't not in the spec
  // Except the user will be the current authorised, and we'll need one for an admin user
  // Returns 201 status.
}));

router.put('/courses/:id', authenticateUser(), asyncHandler(async (req,res,next) => {
  // current authorised user and admin only.
  // returns 204 status.
}));

router.delete('/courses/:id', authenticateUser(), asyncHandler(async (req,res,next) => {
  // admin and authorised (course-owning) user only
  // returns 204 status.
}));




router.get('/adminTest', authenticateUser(true), asyncHandler(async (req,res,next) => {
  res.status(200).json(req.currentUser);
}));


module.exports = router;