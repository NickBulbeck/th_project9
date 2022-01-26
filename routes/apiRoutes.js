const express = require('express');
const router = express.Router();

const asyncHandler = require('../scripts/asyncHandler.js').asyncHandler;
const users = require('../models').Users;
const courses = require('../models').Courses;
const standardUserAuth = require('../scripts/authenticateUser').standardUserAuth;
const adminUserAuth = require('../scripts/authenticateUser').adminUserAuth;

//***********************************************************************
// User routes:
//***********************************************************************
router.get('/users', standardUserAuth, asyncHandler(async (req,res,next) => {
// Returns current authorised user, whether they are standard or admin
  if (req.currentUser) {
    console.log(req.currentUser);
  }
  res.status(200).json(req.currentUser);
}));

router.get('/users/all', asyncHandler(async (req,res,next) => {
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
// creates a new user; no authorisation needed
  // mind and return a 400 status for a SequelizeUniqueConstraintError
  // also return a 201 status and nae content
}));

router.put('/users', asyncHandler(async (req,res,next) => {
// updates the current authorised user, whether standard or admin
  // current authorised user only; returns 204 status with no content
}));

router.put('/users/:id', asyncHandler(async (req,res,next) => {
// updates the user with the given id. Admin users only  
  // admin users only; returns 204 status with no content
}))

router.delete('/users/:id', asyncHandler(async (res,req,next) => {
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

router.put('/courses/:id', asyncHandler(async (req,res,next) => {
  // current authorised user and admin only.
  // returns 204 status.
}));

router.delete('/courses/:id', asyncHandler(async (req,res,next) => {
  // admin and authorised (course-owning) user only
  // returns 204 status.
}));

module.exports = router;