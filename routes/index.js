'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();


//import authentication
const auth = require('basic-auth');
const { User, Course }  = require('../models');



//Create Async Handler
function asyncHandler (cb) {
    return async (req, res, next) =>{
      try {
        await cb (req, res, next);
      } catch (error) {
        res.status(500).send(error);
      }
    }
  };


// Middleware to authenticate the request using Basic Auth.
const authenticateUser = async (req, res, next) => {
    let message; 
    // Parse the user's credentials from the Authorization Header
    const credentials = auth(req);
    // Check to see if the user's credentials exist
    if (credentials) {
        const user = await User.findOne({ where: {emailAddress: credentials.name} });
        // if a user was found
        if (user) {
            const authenticated = bcrypt.compareSync(credentials.pass, user.password);
            if (authenticated) { // If the passwords match
                console.log(`Authentication successful for username: ${user.emailAddress}`);
                // Store the user on the Request object.
                req.currentUser = user;
            } else {
                message = `Authentication failure for username: ${user.emailAddress}`;        
        }
    } else {
        message = `User not found for username: ${credentials.name}`;
      } 
    }  else {
        message = 'Auth header not found';
    }

    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
      } else {
        next();
      }
  };




//  Create User Routes:

// GET route that will return all properties and values for the currently authenticated User
router.get('/users', authenticateUser, asyncHandler(async (req,res) => {
    try {
        let user = req.currentUser;
        res.status(200).json({
           id: user.id,
           firstName: user.firstName,
           lastName: user.lastName,
           emailAddress: user.emailAddress
        })
    } catch(err){
        throw err;
    }
}))


// POST route that will create a new user and set the Location header to "/"
router.post('/users', asyncHandler(async (req,res) => {
    try{
        await User.create(req.body);
        //set location header to /
        res.status(201).location('/').end();
    } catch (error){
        console.log('ERROR:', error.name)
        if(error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError"){
            const errors = error.errors.map(err => err.message);
            res.status(400).json( {errors} )
        } else {
            throw error;
        }
    }
}));





//Create Course Routes
// GET route that will return all courses including the User associated with each course
router.get('/courses', asyncHandler(async (req, res) => {
    try{
    const courses = await Course.findAll({
        include: [{
            model: User,
            as: "user",
            attributes: ["firstName", "lastName"]
        }]
    });
    res.status(200).json(courses)
    } catch(err){
        throw err;
    }
}))




//GET route that will return the corresponding course including the User associated with that course
router.get('/courses/:id', asyncHandler(async (req,res) => {
    try{
        const course = await Course.findOne({
            where: {
                id: req.params.id
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName']
            }]
        })
        if (course){
            res.status(200).json({
                Course: course
            })
        } else {
            res.status(404).json({'Message': 'Course not found'})
        }
    } catch (err) {
        throw err;
    }
}))




// route that will create a new course, set the Location header to the URI for the newly created course
router.post('/courses', authenticateUser, asyncHandler(async(req,res) => {
    try{
        const course = await Course.create(req.body)
        res.status(201).location(`/courses/${course.id}`).end();
    } catch (err){
        if(err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError"){
            const errors = err.errors.map(err => err.message);
            res.status(400).json({ errors })
        } else {
            throw err;
        }
    }
}))




// PUT route that will update the corresponding course
router.put('/courses/:id', authenticateUser, asyncHandler(async (req,res) => {
    try{
        const user = req.currentUser
        const course = await Course.findByPk(req.params.id);
        if (course.userId === user.id) {
            const updatedCourse = await course.update(req.body);
            res.status(204).json({
                UpdatedCourse: updatedCourse
            })
        } else {
            res.status(403).json({'Message': 'You do not have permissions to update this course'})
        }
    } catch (err){
        if(err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError'){
            const errors = err.errors.map(err => err.message);
            res.status(400).json( { errors });
        } else {
            throw err;
        }
    }
}))




// DELETE route that will delete the corresponding course
router.delete('/courses/:id', authenticateUser, asyncHandler(async(req, res) => {
    const user = req.currentUser;
    const course = await Course.findByPk(req.params.id);
    if (course) {
        if(course.userId === user.id){
            await course.destroy();
            res.status(204).end();
        } else {
            res.status(403).json({"Message": 'You do not have permissions to delete this course'});
        }
    }else{
        res.status(404).json({'Message': 'Course Not Found'});
    }
}))

module.exports = router;
