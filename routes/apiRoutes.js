const express = require('express');
const router = express.Router();

const asyncHandler = require('../scripts/asyncHandler.js').asyncHandler;

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
    }
  });
  res.status(200).json(user);
}));

router.get('/users/all', asyncHandler(async (req,res,next) => {
  const users = require('../models').Users;
  const allUsers = {};
  allUsers.users = await users.findAll();
  res.status(200).json(allUsers);
}));

router.post('/users', asyncHandler(async (req,res,next) => {

}));

// admin users only:
router.put('/users/:id', asyncHandler(async (req,res,next) => {

}))




module.exports = router;