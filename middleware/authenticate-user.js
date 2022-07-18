'use strict';

const auth = require('basic-auth');
const bcrypt = require('bcryptjs');
const { User } = require('../models');


exports.authenticateUser = async (req, res, next) => {
    let message; 
    // Parse the user's credentials from the Header
    const credentials = auth(req);
    // Check to see if the user's credentials exist
    if (credentials) {
        const user = await User.findOne({ where: {emailAddress: credentials.name} });
        // if a user was found
        if (user) {
            const authenticated = bcrypt.compareSync(credentials.pass, user.password);
            if (authenticated) { // If the passwords match
                console.log(`Authentication successful for username: ${user.firstname}`);
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