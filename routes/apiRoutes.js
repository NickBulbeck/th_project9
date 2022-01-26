const express = require('express');
const router = express.Router();

const asyncHandler = require('../scripts/asyncHandler.js').asyncHandler;
//***********************************************************************
// User routes:
//***********************************************************************
router.get('/users', asyncHandler(async (req,res,next) => {
  const users = require('../models').Users;
  //test: refactor this out once the authorisation is in place
  req.user = {};
  req.user.emailAddress = "nick@treehouse.com";
  // endTest
  const searchTerm = req.user.emailAddress;
  const user = await users.findAll({
    where: {
      emailAddress: searchTerm
    },
    attributes: {
      exclude:  [ "password",
                  "createdAt",
                  "updatedAt"
                ]
    }
  });
  res.status(200).json(user);
}));

router.get('/users/all', asyncHandler(async (req,res,next) => {
  // authorise this for admin users only
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
  // mind and return a 400 status for a SequelizeUniqueConstraintError
  // also return a 201 status and nae content
}));

router.put('/users', asyncHandler(async (req,res,next) => {
  // current authorised user only; returns 204 status with no content
}));
router.put('/users/:id', asyncHandler(async (req,res,next) => {
  // admin users only; returns 204 status with no content
}))

router.delete('/users', asyncHandler(async (res,req,next) => {
// admin users only. Mind and add the "tbd" user to a' the relevant courses too.
// returns 204 status with no content
}));

//***********************************************************************
// Course routes:
//***********************************************************************

router.get('/courses', asyncHandler(async (req,res,next) => {
  // gets them a'. Returns 200 status.
}));

router.get('/courses/:id', asyncHandler(async (req,res,next) => {
  // no authorisation needed. Returns 200 status.
}));

router.post('/courses', asyncHandler(async (req,res,next) => {
  // inclined to make this admin only, but that't not in the spec
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