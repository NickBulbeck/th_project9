const express = require('express');
const router = express.Router();

const asyncHandler = require('../scripts/asyncHandler.js').asyncHandler;
const users = require('../models').Users;
const courses = require('../models').Courses;
const authenticateUser = require('../scripts/authenticateUser').authenticateUser;



//***********************************************************************
// Course routes:
//***********************************************************************

router.get('/', asyncHandler(async (req,res,next) => {
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

router.get('/:id', asyncHandler(async (req,res,next) => {
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

router.post('/', authenticateUser(), asyncHandler(async (req,res,next) => {
  let newCourse = req.body; // `let` because we're updating it in the `try`-block
  newCourse.userId = req.currentUser.id;
  try {
    newCourse = await courses.create(newCourse);
    const id = newCourse.dataValues.id;
    res.status(201).location(`/api/courses/${id}`).end();
  } catch(error) {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = error.errors.map(err => err.message);
      console.log(errors);
      res.status(400).json({errors});
    } else {
      console.log(error);
      next(error);
    }
  }
}));

router.put('/:id', authenticateUser(), asyncHandler(async (req,res,next) => {
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
    // for (property in courseToUpdate) {  // COMMENTED OUT FOR THE NOO - I'D PREFER TO
    //   if (!req.body[property]) {        // IMPLEMENT IT THIS WAY, BUT THE PROJECT 9
    //     req.body[property] = property;  // RUBRIC REQUIRES OTHERWISE.
    //   }
    // }
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

router.delete('/:id', authenticateUser(), asyncHandler(async (req,res,next) => {
  // admin and authorised (course-owning) users only
  const id = parseInt(req.params.id);
  let doomedCourse = null;
  try {
    doomedCourse = await courses.findByPk(id);
  } catch { // We'll come here if id is NaN
    const error = new Error;
    error.status = 500;
    error.message = "A database error occurred when attempting to delete this course";
    error.id = id || req.params.id;
    console.log(`Error - attempt to delete course id '${error.id}'`);
    throw error;
  }
  if (!doomedCourse) {
    const error = new Error;
    error.status = 404;
    error.message = "Course not found";
    console.log(`Not found - attempt to delete course id ${req.params.id}`);
    throw error;
  }
  // doomedCourse exists; so now, just need to check whether the current user is authorised.
  const currentUser = req.currentUser.id;
  const adminUser = req.currentUser.role === "admin";
  let courseOwner = false;
  if (doomedCourse) {
    if (doomedCourse.dataValues.userId === currentUser) {
      courseOwner = true;
    }
  }
  const authorised = adminUser || courseOwner;
  if (authorised) {
    try {
      doomedCourse.destroy();
      res.status(204).end();
    } catch(error) {
      console.log("Failed to delete course");
      next(error);
    }
  } else {
    console.log("Unauthorised attempt to delete a course");
    res.status(403).json({"message": "Forbidden"});
  } 
}));


module.exports = router;