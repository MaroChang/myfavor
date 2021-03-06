import 'dotenv/config';
import express from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/user.model';
import { generateHashedPassword, validateRegistrationInput } from '../utils/auth';

const usersRouter = express.Router();

const passportConfig = require('../utils/passport');

// Helper function to create new user and save into database
const createUser = async (username, email, password) => {
  const data = {
    username,
    email,
    hashedPassword: await generateHashedPassword(password)
  };
  return new User(data).save();
};

// Helper function to sign a token
const signToken = (userId) => {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}


usersRouter.post('/register', validateRegistrationInput, async (req, res) => {
  const messages = validationResult(req);

  try {
    const { username, email, password, passwordConfirmation } = req.body;
    const user = await User.findOne({ username });

    // Check for 400-type errors. If user inputs are all valid, create new user.
    if (user) {
      res.status(400).json({ message: 'An account already exists for this credential.' });
    } else if (password !== passwordConfirmation) {
      res.status(400).json({ message: 'Password confirmation is incorrect.' });
    } else if (!messages.isEmpty()) {
      res.status(400).json({message: messages.errors[0].msg})
    } else {
      await createUser(username, email, password);

      // Sign a token
      const newUser = await User.findOne({ username });
      const token = jwt.sign(
        { username },
        process.env.JWT_SECRET,
        { expiresIn: 3600 }
      );

      // Return a sanitized user object and the signed token back to client
      const dataToReturn = { ...newUser.toJSON(), ...{ token } };
      delete dataToReturn.hashedPassword;
      res.status(201).json( dataToReturn );
    }
  } catch (err) {
    res.status(500).json(err);
  }
});   // end of .post('/register')


usersRouter.post(
  '/login',
  passport.authenticate('local', { session: false }), // passport strategy to authenticate with a username and password
  (req, res) => {
    if (req.isAuthenticated()) {
      const { _id, username } = req.user;
      const token = signToken(_id);
      res.cookie('access_token', token, {maxAge: 3600000, httpOnly: true, sameSite: true});
      res.status(200).json({
        isAuthenticated: true,
        user: { _id, username }
      });
    }
  }
);   // end of .post('/login')


usersRouter.patch('/:id', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    const dataToReturn = { ...updatedUser.toJSON() };
    delete dataToReturn.hashedPassword;
    res.status(200).json(dataToReturn);
  } catch (err) {
    res.status(500).send(err);
  }
});


usersRouter.get(
  '/isAuthenticated',
  passport.authenticate('jwt', { session: false }), // passport strategy to authenticate with a jwt
  (req, res) => {
    if (req.user.username) {
      // If authentication is successful, send back to client the isAuthenticated status and the user object
      res.status(200).json({ 
        isAuthenticated: true,
        user: { 
          username: req.user.username,
          _id: req.user._id
        }
      });
    }
  }
);

usersRouter.get(
  '/logout', (req,res) => {
    res.clearCookie('access_token'),
    res.status(200).json({
      isAuthenticated: false,
      user: {}
    })
  }
)

// Get all users if no condition attached OR find by username if username is passed as query string from request
usersRouter.get('/' , async (req, res) => {
  const { username } = req.query;
  const condition = username ? { username: username } : {};

  try {
    const data = await User.find(condition).select('username')
    // 'data' is an array of all matches. If more than 1 match found, ask the user to search a full accurate username. Note: all usernames in the system are unique.
    if (data.length === 1) {
      const dataToReturn = { ...data[0].toJSON() };
      delete dataToReturn._id;
      res.status(200).json(dataToReturn);
    } else {
      res.status(500).json({ message: 'Please enter an accurate username.' });
    }
  } catch (err) {
    res.status(500).send(err)
  }
});

export default usersRouter;
