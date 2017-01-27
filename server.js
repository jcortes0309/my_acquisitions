////////// SERVER.JS //////////

/////////////////////////////
////////// MODULES //////////
/////////////////////////////

const express = require("express");
const path = require("path");
// Used instead of the native Promises
const bluebird = require("bluebird");
// Connect to mongodb
const mongoose = require("mongoose");
// Used to receive data (post)
const bodyParser = require("body-parser");

// Generate a v4 UUID (random)
const uuidV4 = require("uuid/v4");
// Used to encrypt passwords
const bcrypt = require("bcrypt");
const saltRounds = 10;
// Node.js middleware for handling multipart/form-data, which is primarily used for uploading files
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "./public/uploads");
  },
  filename: function (request, file, callback) {
    console.log("File looks like:", file);
    const ext = path.extname(file.originalname);
    const id = uuidV4();
    callback(null, id + ext);
  }
});

const upload = multer({ storage: storage });

var app = express();


///////////////////////////////////
////////// CONFIGURATION //////////
///////////////////////////////////

// upload config file
const config = require("./config");

// connect to our mongoDB database
mongoose.connect(config.database);

// Set bluebird as default Promise module
mongoose.Promise = bluebird;

// view database queries
mongoose.set("debug", true);

// set the static files location /public/imgages will be /imgages for users
app.use(express.static(__dirname + "/public"));
// Or we can use this code below
// app.use(express.static(path.join(__dirname, "public")));

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


////////////////////////////
///////// MODELS /////////
//////////////////////////

///////// USER MODEL /////////
const User = mongoose.model("User", {
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  username: {
    type: String,
    index: true,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profileimage: {
    type: String
  },
  token: {
    type: String
  },
  created_on: {
    type: Date,
    required: true,
    default: Date.now
  },
  updated_on: {
    type: Date,
    default: Date.now
  }
});


////////////////////////////
////////// ROUTES //////////
////////////////////////////

////////// USER //////////
app.post("/user/register", function(request, response) {
  // console.log("Here is the registration information: ", request.body);
  let password = request.body.password;

  bcrypt.hash(password, saltRounds)
    .then(function(hash) {
      let newRegistration = new User({
        username: request.body.username,
        email: request.body.email,
        password: hash
      });

      newRegistration.save()
        .then(function(result) {
          console.log("Saved successfully: ", result);
          response.json({
            message: "Registered user successfully"
          });
        });
    })
    .catch(function(error) {
      console.log("Didn't save because: ", error.stack);
      response.json({
        message: "Error message: " + error.stack
      });
    });
});








// START THE SERVER
// ====================================
app.listen(config.port);
console.log('Magic happens on port ' + config.port);
