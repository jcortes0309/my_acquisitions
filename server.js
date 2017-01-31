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

///////// COMPANY MODEL /////////
const Company = mongoose.model("Company", {
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    default: "identified"
  },
  website: {
    type: String
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  address2: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  zip_code: {
    type: String
  },
  industry: {
    type: String
  },
  description: {
    type: String
  },
  contacts: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  created_on: {
    type: Date,
    default: Date.now,
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId
  }
});

///////// CONTACT MODEL /////////
const Contact = mongoose.model("Contact", {
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  title: {
    type: String
  },
  type: {
    type: String
  },
  description: {
    type: String
  },
  company: {
    type: mongoose.Schema.Types.ObjectId
  },
  ownerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  created_on: {
    type: Date,
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  updated_on: {
    type: Date,
    default: Date.now
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId
  }
});


////////////////////////////
////////// ROUTES //////////
////////////////////////////

////////// USER //////////
////////// Register user //////////
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

////////// Login user //////////
app.post("/user/login", function(request, response) {
  let username = request.body.username;
  let verify_password = request.body.password;

  User.findOne({ username: username })
    .then(function(user) {
      let hash = user.password;
      // Load hash from your password DB and compare to password provided by user
      return bcrypt.compare(verify_password, hash)
        .then(function(response) {
          if (response) {
            // Create token for user
            var token = uuidV4();
            // Add token to user and grab information to send to the front end
            return bluebird.all([
              token,
              User.update(
                { username: username },
                {
                  $set: {
                    token: token,
                    updated_on: new Date()
                  }
                }
              )
            ]);
          } else {
            throw new Error("You are not allowed to enter");
          }
        });
    })
    .then(function(result) {
      let token = result[0];
      User.findOne({ token: token })
        .then(function(updated_user) {
          response.json({
            user: updated_user
          });
        });
    })
    .catch(function(error) {
      response.status(401) ;
      response.json({
        message: "Error trying to login"
      });
    });
});

////////// COMPANY //////////
////////// View Companies //////////
app.get("/companies/view", function(request, response) {
  console.log("In the backend trying to see the companies");
  Company.find({}).sort("name")
    .then(function(companies) {
      console.log("Here are the companies: ", companies);
      response.json({
        companies: companies
      });
    })
    .catch(function(error) {
      response.status(500) ;
      response.json({
        message: "Error trying to get the companies"
      });
    });
});

////////// Track a company //////////
app.post("/company/track", function(request, response) {
  let userID = request.body.userID;
  console.log("This is the request sent from the front end: ", request.body);

  let newCompany = new Company({
    name: request.body.companyInformation.name,
    status: request.body.companyInformation.status,
    website: request.body.companyInformation.website,
    phone: request.body.companyInformation.phone,
    address: request.body.companyInformation.address,
    address2: request.body.companyInformation.address2,
    city: request.body.companyInformation.city,
    state: request.body.companyInformation.state,
    zip_code: request.body.companyInformation.zip_code,
    description: request.body.companyInformation.description,
    ownerID: userID,
    created_on: new Date(),
    created_by: userID
  });

  newCompany.save()
    .then(function(result) {
      console.log("Company created successfully: ", result);
      response.json({
        status: 200,
        message: "Company created successfully"
      });
    })
    .catch(function(error) {
      response.status(400);
      console.log("\n\n\n");
      console.log("Didn't create Company because: ", error);
    });

});

////////// View company //////////
app.get("/company/view/:companyID", function(request, response) {
  let companyID = request.params.companyID;

  return Company.findById(companyID)
    .then(function(company) {
      return User.findById(company.created_by)
        .then(function(user) {
          console.log("This is the user: ", user);
          response.json({
            company: company,
            companyOwner: user
          });
        });
    })
    .catch(function(error) {
      response.status(400);
      console.log("There was an error looking for that company: ", error.stack);
    });
});

////////// Edit company //////////
app.post("/company/edit", function(request, response) {
  let userID = request.body.userID;
  let companyID = request.body.companyInformation._id;
  let queryCompany = { _id: companyID };

  console.log("This is the request sent from the front end: ", request.body);

  return Company.findOneAndUpdate(queryCompany,
    {
      $set: {
        name: request.body.companyInformation.name,
        status: request.body.companyInformation.status,
        website: request.body.companyInformation.website,
        phone: request.body.companyInformation.phone,
        address: request.body.companyInformation.address,
        address2: request.body.companyInformation.address2,
        city: request.body.companyInformation.city,
        state: request.body.companyInformation.state,
        zip_code: request.body.companyInformation.zip_code,
        description: request.body.companyInformation.description,
        updated_on: new Date(),
        updated_by: userID
      }
    })
      .then(function(updatedCompany) {
        response.json({
          status: 200,
          message: "Company updated successfully"
        });
      })
      .catch(function(error) {
        response.status(400);
        console.log("There was an error updating that company: ", error.stack);
      });

});

////////// Remove company //////////
app.post("/company/remove", function (request, response) {
  let companyID = request.body.companyID;

  return Company.findByIdAndRemove(companyID)
    .then(function(companyRemoved) {
      console.log("companyRemoved: ", companyRemoved);
      response.json({
        companyRemoved: companyRemoved
      });
    })
    .catch(function(error) {
      response.status(400);
      console.log("There was an error removing that company: ", error.stack);
    });

});


////////// CONTACT //////////
////////// View Contacts //////////
app.get("/contacts/view", function(request, response) {
  console.log("In the backend trying to see the contacts");

  Contact.find({}).sort("first_name")
    .then(function(contacts) {
      // console.log("\n\nContacts: ", contacts);
      // Extract the IDs for all companies
      var companyIDs = contacts.map(function(contact) {
        return contact.company;
      });
      console.log("\n\ncompany IDs are: ", companyIDs);

      return Company.find({
        _id: {
          $in: companyIDs
        }
      })
        .then(function(companies) {
          console.log("Here are the contacts: ", contacts);
          response.json({
            contacts: contacts,
            companies: companies
          });
        });
    })
    .catch(function(error) {
      response.status(500) ;
      response.json({
        message: "Error trying to get the contacts"
      });
    });
});

////////// View company contacts //////////
app.get("/company/contacts/view/:companyID", function(request, response) {
  let companyID = request.params.companyID;
  console.log("\n\n\ncompanyID: ", companyID);
  console.log("\n\n\n");

  Contact.find({
    company: companyID
  })
    .then(function(contacts) {
      console.log("These are the contacts: ", contacts);
      response.json({
        contacts: contacts
      });
    })
    .catch(function(error) {
      response.status(400);
      console.log("There was an error looking for that company: ", error.stack);
    });

});

////////// Create contact //////////
app.post("/contact/create", function(request, response) {
  let userID = request.body.userID;
  let companyID = request.body.companyID;
  console.log("This is the request sent from the front end: ", request.body);

  let newContact = new Contact({
    first_name: request.body.contactInformation.first_name,
    last_name: request.body.contactInformation.last_name,
    email: request.body.contactInformation.email,
    phone: request.body.contactInformation.phone,
    title: request.body.contactInformation.title,
    type: request.body.contactInformation.type,
    description: request.body.contactInformation.description,
    company: companyID,
    ownerID: userID,
    created_on: new Date(),
    created_by: userID
  });

  newContact.save()
    .then(function(result) {
      console.log("Contact created successfully: ", result);
      response.json({
        status: 200,
        message: "Contact created successfully"
      });
    })
    .catch(function(error) {
      response.status(400);
      console.log("\n\n\n");
      console.log("Didn't create Contact because: ", error);
    });

});

////////// Remove contact //////////
app.post("/contact/remove", function(request, response) {
  let contactID = request.body.contactID;

  return Contact.findByIdAndRemove(contactID)
    .then(function(contactRemoved) {
      console.log("contactRemoved: ", contactRemoved);
      response.json({
        contactRemoved: contactRemoved
      });
    })
    .catch(function(error) {
      response.status(400);
      console.log("There was an error removing that contact: ", error.stack);
    });

});





// START THE SERVER
// ====================================
app.listen(config.port);
console.log('Magic happens on port ' + config.port);
