const express = require('express');
const router = express.Router();

const asyncHandler = require('../scripts/asyncHandler.js').asyncHandler;
const users = require('../models').Users;
const courses = require('../models').Courses;
const authenticateUser = require('../scripts/authenticateUser').authenticateUser;



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
  } else {
    course.dataValues.user = "No user found for this course";
  }
  res.status(200).json(course);
  //      res.status(500).json({"Evil data prevented the server from fulfilling this request"});

}));

router.post('/courses', authenticateUser(), asyncHandler(async (req,res,next) => {
  const newCourse = req.body;
  newCourse.userId = req.currentUser.id;
  try {
    await courses.create(newCourse);
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
  let message;
  if (!courseToUpdate) {
    console.log("Rejected PUT request: course not found");
    message = "Course not found";
  } else if (!owner && !adminUser) {
  // Can only update your own courses UNLESS you are an admin user
    console.log("Rejected PUT request: user is neither the course owner nor an admin user");
    message = "Access denied";
  } else if (changingOwner && !adminUser) {
  // Cannot change the course's userId UNLESS you are an admin user
    console.log("Rejected PUT request: unauthorised attempt to re-assign course to different user");
    message = "Access denied";
  } else if (changingOwner && adminUser) { // shouldn't need && admin - being paranoid here
  // Cannot assign the course to a non-existent user no matter how admin you are
      const userExists = await users.findOne({where: {id: req.body.userId}});
      if (!userExists) {
        console.log("Rejected PUT request: attempt to assign course to non-existent user");
        message = "New course owner could not be found";
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
    res.status(400).json({message: message});
  }
}));

router.delete('/courses/:id', authenticateUser(), asyncHandler(async (req,res,next) => {
  // admin and authorised (course-owning) users only
  const id = parseInt(req.params.id);
  const adminUser = req.currentUser.role === "admin";
  const doomedCourse = await courses.findByPk(id);
  let message;
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
    res.status(400).json({"message": "access denied"});
  } else if (!doomedCourse) {
    console.log("Attempt to delete a non-existent course");
    res.status(404).json({"message": "Course not found"});
  }
}));




router.get('/adminTest', authenticateUser(true), asyncHandler(async (req,res,next) => {
  res.status(200).json(req.currentUser);
}));


module.exports = router;