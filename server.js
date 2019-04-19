const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const cors = require('cors');

const mongoose = require('mongoose');
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/exercise-track' )

// Connect to Database
var database = mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true}, function(error) {
  if(error) {
    console.log(error);
  } else {
    console.log("Connection successful");
  }
});

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});

// Database schemas
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String 
});

var exerciseSchema = new Schema({
  userId: String,
  description: String,
  duration: Number,
  date: String
});

// Create models
var User = mongoose.model('User', userSchema);
var Exercise = mongoose.model('Exercise', exerciseSchema);

// Save documents
var saveUser = function(user, done) {
  user.save(function(err, data) {
    if(err){
      return done(err);
    }
    done(null, data);
  });
};

var saveExercise = function(exercise, done) {
  exercise.save(function(err, data) {
    if(err){
      return done(err);
    }
    done(null, data);
  });
};

// Find documents
var findUsers = function(done) {
  User.find({},
    function(err, data) {
      if (err) done(err);
      done(null, data);
  });
}

// Handle input events

// Create new user
var handleNewUser = function(req, res) {
  // Create user
  var user = new User({
    username: req.body.username,
  });

  // Save to database and respond with JSON
  saveUser(user, function(err, data) {
    if (err) console.log(err);
    res.json( {_id: data._id, username: data.username} );
  });
}

app.post("/api/exercise/new-user", handleNewUser);

// List users
var handleGetUsers = function(req, res) {
  findUsers(function(err, data) {
    if(err) return err;
    return res.send(data);
  });
}

app.get("/api/exercise/users", handleGetUsers);

// Log exercise activity
var handleAddExercise = function(req, res) {

  // console.log("Log exercise activity");
  // return res.json({event: "Log exercise activity"});
}

app.post("/api/exercise/add", handleAddExercise);

// Display exercise log
var handleExerciseLog = function(req, res) {
  console.log("Display exercise log");
  return res.json({event: "Display exercise log"});
}

app.get("/api/exercise/log", handleExerciseLog);

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'});
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
});

