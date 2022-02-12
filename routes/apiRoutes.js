const express = require('express');
const router = express.Router();

const asyncHandler = require('../scripts/asyncHandler.js').asyncHandler;
const users = require('../models').Users;
const courses = require('../models').Courses;
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
  // gets them a'. Returns 200 status. No authorisation needed. Include the user, BTW.
  const allCourses = {};
  allCourses.courses = await courses.findAll({
    attributes: {
      exclude:  [ 
                  "createdAt",
                  "updatedAt"
                ]
    }
  });
  for (let i=0; i < allCourses.courses.length; i++) {
    const courseUser = await users.findOne({
      where: {
        id: allCourses.courses[i].userId
      },
      attributes: {
        exclude:  [ 
                    "createdAt",
                    "updatedAt",
                    "password",
                    "role",
                    "id"
                  ] // Decided to keep the email address.
      }
    });
    delete allCourses.courses[i].dataValues.userId;
    if (courseUser) {
      allCourses.courses[i].dataValues.user = courseUser.dataValues;
    } else { // belt and braces - this shouldn't happen in practice
      allCourses.courses[i].dataValues.user = "No user found for this course";
    }
  }
  res.status(200).json(allCourses);
}));

router.get('/courses/:id', asyncHandler(async (req,res,next) => {
  // no authorisation needed. Returns 200 status.
  const id = req.params.id;
  const course = await courses.findByPk(id,{
    attributes: {
      exclude:  [ 
                  "createdAt",
                  "updatedAt"
                ]
    }
  });
  if (!course) {
    res.status(404).json({"message":"Course not found"}); 
  }
  const courseUser = await users.findOne({
    where: {
      id: course.dataValues.userId
    },
    attributes: {
      exclude:  [ 
        "createdAt",
        "updatedAt",
        "password",
        "role",
        "id"
      ]
    }
  });
  delete course.dataValues.userId;
  if (courseUser) {
    course.dataValues.user = courseUser.dataValues;
  } else { // belt and braces as this should be impossible:
    course.dataValues.user = "No user found for this course";
  }
  res.status(200).json(course);
}));

router.post('/courses', authenticateUser(), asyncHandler(async (req,res,next) => {
  let newCourse = req.body; // `let` because we're updating it in the `try`-block
  newCourse.userId = req.currentUser.id;
  try {
    newCourse = await courses.create(newCourse);
    const id = newCourse.dataValues.id;
    res.status(201).location(`/api/courses/${id}`).end();
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

router.put('/courses/:id', authenticateUser(), asyncHandler(async (req,res,next) => {
  const id = parseInt(req.params.id);
  const adminUser = req.currentUser.role === "admin";
  // If the request userId is set (not undefined) and different from the current user ID:
  const changingOwner = req.body.userId !== req.currentUser.id && !!req.body.userId;
  const courseToUpdate = await courses.findByPk(id);
  let owner = false;
  if (courseToUpdate) {
    owner = courseToUpdate.dataValues.userId === req.currentUser.id;
  }
  let message, status;
  if (!courseToUpdate) {
    console.log("Rejected PUT request: course not found");
    message = "Course not found";
    status = 400;
  } else if (!owner && !adminUser) {
  // Can only update your own courses UNLESS you are an admin user
    console.log("Rejected PUT request: user is neither the course owner nor an admin user");
    message = "Forbidden";
    status = 403;
  } else if (changingOwner && !adminUser) {
  // Cannot change the course's userId UNLESS you are an admin user
    console.log("Rejected PUT request: unauthorised attempt to re-assign course to different user");
    message = "Forbidden";
    status = 403;
  } else if (changingOwner && adminUser) { // shouldn't need && admin - being paranoid here
  // Cannot assign the course to a non-existent user no matter how admin you are
      const userExists = await users.findOne({where: {id: req.body.userId}});
      if (!userExists) {
        console.log("Rejected PUT request: attempt to assign course to non-existent user");
        message = "New course owner could not be found";
        status = 400;
      }
  }
  if (!message) {
  // Ensure any empty properties in req.body are left unchanged
    for (property in courseToUpdate) {
      if (!req.body[property]) {
        req.body[property] = property;
      }
    }
    try {
      await courseToUpdate.update(req.body);
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
  } else {
    res.status(status).json({message: message});
  }
}));

router.delete('/courses/:id', authenticateUser(), asyncHandler(async (req,res,next) => {
  // admin and authorised (course-owning) users only
  const id = parseInt(req.params.id);
  const adminUser = req.currentUser.role === "admin";
  const doomedCourse = await courses.findByPk(id);
  let courseOwner = false;
  if (doomedCourse) {
    if (doomedCourse.dataValues.userId === id) {
      courseOwner = true;
    }
  }
  const authorised = adminUser || courseOwner;
  if (doomedCourse && authorised) {
    try {
      doomedCourse.destroy();
      res.status(204).end();
    } catch(error) {
      console.log("Failed to delete course");
      next(error);
    }
  } else if (!authorised) {
    console.log("Unauthorised attempt to delete a course");
    res.status(403).json({"message": "Forbidden"});
  } else if (!doomedCourse) {
    console.log("Attempt to delete a non-existent course");
    res.status(400).json({"message": "Course not found"});
  }
}));

module.exports = router;