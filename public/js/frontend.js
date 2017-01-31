var app = angular.module("acquisitions_tracker", ["ui.router", "ngCookies", "angularMoment", "ngDialog"]);


app.run(function($rootScope, $state, $cookies, ngDialog) {
  $rootScope.factory_at_cd = $cookies.getObject("at_cd");
  // console.log("This is the factory cookie: ", $rootScope.factory_at_cd);

  if ($rootScope.factory_at_cd) {
    // $rootScope.authToken = $rootScope.factory_at_cd.data.token;
    $rootScope.logged_user = $rootScope.factory_at_cd.data.user;
    // console.log("$rootScope.logged_user", $rootScope.logged_user);
  }

  // Logout function accessible from anywhere in the app
  $rootScope.logout = function() {
    // console.log("Entered the logout function");
    // remove method => pass in the value of the cookie you want to remove
    $cookies.remove("at_cd");
    // reset all the scope variables
    $rootScope.at_cd = null;
    $rootScope.logged_user = null;
    $state.go("home");
  };

  // Open modal panel to track company (from menu bar)
  $rootScope.openTrackCompanySmall = function () {
    ngDialog.open({
      template: "views/company/track_company_small.html",
      controller: "TrackCompanyController",
      className: "ngdialog-theme-default",
      closeByEscape: true,
      width: 650
    });
  };

});


/////////////////////////////
////////// FACTORY //////////
/////////////////////////////
app.factory("AT_Factory", function($http, $state, $rootScope, $cookies) {
  var service = {};


  //////////////////////////////////
  ////////// USER FACTORY //////////
  //////////////////////////////////

  // Register a user
  service.register = function(user_registration) {
    return $http({
      method: "POST",
      url: "/user/register",
      data: user_registration
    });
  };

  // Login a user
  service.login = function(login_information) {
    return $http({
      method: "POST",
      url: "/user/login",
      data: login_information
    });
  };



  /////////////////////////////////////
  ////////// COMPANY FACTORY //////////
  /////////////////////////////////////
  // View companies
  service.viewCompanies = function() {
    return $http({
      method: "GET",
      url: "/companies/view"
    });
  };

  // Track a company
  service.trackCompany = function(userID, companyInformation) {
    return $http({
      method: "POST",
      url: "/company/track",
      data: {
        userID: userID,
        companyInformation: companyInformation
      }
    });
  };

  // View company
  service.viewCompany = function(companyID) {
    return $http({
      method: "GET",
      url: "/company/view/" + companyID
    });
  };


  // Edit company
  service.editCompany = function(userID, companyInformation) {
    return $http({
      method: "POST",
      url: "/company/edit",
      data: {
        userID: userID,
        companyInformation: companyInformation
      }
    });
  };

  // Delete company
  service.removeCompany = function(companyID) {
    return $http({
      method: "POST",
      url: "/company/remove",
      data: {
        companyID: companyID
      }
    });
  };



  /////////////////////////////////////
  ////////// CONTACT FACTORY //////////
  /////////////////////////////////////
  // View contacts
  service.viewContacts = function() {
    return $http({
      method: "GET",
      url: "/contacts/view"
    });
  };

  // View one contact
  service.viewOneContact = function(contactID) {
    return $http({
      method: "GET",
      url: "/contact/view/" + contactID
    });
  };

  // Edit contact
  service.editContact = function(userID, contactInformation) {
    return $http({
      method: "POST",
      url: "/contact/edit",
      data: {
        userID: userID,
        contactInformation: contactInformation
      }
    });
  };

  // View company contacts
  service.viewCompanyContacts = function(companyID) {
    return $http({
      method: "GET",
      url: "/company/contacts/view/" + companyID
    });
  };

  // Create contact
  service.createContact = function(userID, companyID, contactInformation) {
    return $http({
      method: "POST",
      url: "/contact/create",
      data: {
        userID: userID,
        companyID: companyID,
        contactInformation: contactInformation
      }
    });
  };

  // Remove contact
  service.removeContact = function(contactID) {
    return $http({
      method: "POST",
      url: "/contact/remove",
      data: {
        contactID: contactID
      }
    });
  };




  return service;

});



/////////////////////////////////
////////// CONTROLLERS //////////
/////////////////////////////////

////////// GENERAL CONTROLLERS //////////
////////// Home //////////
app.controller("HomeController", function($scope) {

});

////////// Dashboard //////////
app.controller("DashboardController", function($scope) {
  console.log("Inside the DashboardController");
});


////////// USER CONTROLLERS //////////
////////// Register //////////
app.controller("RegisterController", function($scope, $state, AT_Factory) {
  $scope.user = {};

  $scope.register = function() {
    if ($scope.user.password === $scope.user.password2) {
      var user_registration = $scope.user;
      delete user_registration.password2;
      $scope.user = {};
      // console.log("This is the user_registration: ", user_registration);
      AT_Factory.register(user_registration)
        .then(function(success) {
          $state.go("login");
        })
        .catch(function(error) {
          console.log("There was an error!!!", error.stack);
        });
    } else {
      return;
    }
  };
});

////////// Login //////////
app.controller("LoginController", function($scope, $state, $cookies, $rootScope, AT_Factory) {
  $scope.user = {
    username: "",
    password: ""
  };
  $scope.login = function() {
    var login_information = $scope.user;
    AT_Factory.login(login_information)
      .then(function(logged_user) {
        // console.log("We were successful: ", logged_user);
        $cookies.putObject("at_cd", logged_user);
        $rootScope.at_cd = logged_user;
        $rootScope.logged_user = $rootScope.at_cd.data.user;
        $state.go("dashboard");
      })
      .catch(function(error) {
        console.log("There was an error!!!", error);
      });
  };
});


////////// COMPANY CONTROLLERS //////////
////////// View Companies //////////
app.controller("CompaniesController", function($scope, $state, AT_Factory) {
  $scope.viewCompanies = function() {
    AT_Factory.viewCompanies()
      .then(function(companies) {
        $scope.companies = companies.data.companies;
      })
      .catch(function(error) {
        console.log("There was an error!!!", error.stack);
      });
  };

  // Call viewCompanies after loading page
  $scope.viewCompanies();

  $scope.trackCompany = function() {
    // console.log("Clicked the trackCompany button");
    $state.go("track_company");
  };

  $scope.removeCompany = function(companyID) {
    // console.log("Clicked the remove button: ", companyID);
    AT_Factory.removeCompany(companyID)
      .then(function(companyRemoved) {
        // console.log("company removed: ", companyRemoved);
        // Call viewCompanies after removing a company
        $scope.viewCompanies();
      })
      .catch(function(error) {
        console.log("There was an error!!!", error.stack);
      });
  };

});

////////// Track Company //////////
app.controller("TrackCompanyController", function($scope, $state, AT_Factory, ngDialog) {

  $scope.trackCompany = function() {
  var company_information = $scope.company;
  // Close modal dialog before continuing
  ngDialog.close();
  // console.log("Company information: ", company_information);
  var userID = $scope.logged_user._id;
  AT_Factory.trackCompany(userID, company_information)
    .then(function(success) {
      console.log("We were successful: ", success);
      $state.go("companies");
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });
  };

});

////////// View Company //////////
app.controller("ViewCompanyController", function($scope, $state, $stateParams, AT_Factory) {
  var companyID = $stateParams.companyID;

  // Scroll to top when loading page (need this when coming from a contact)
  document.body.scrollTop = document.documentElement.scrollTop = 0;

  $state.go("view_company.contacts");

  AT_Factory.viewCompany(companyID)
    .then(function(company) {
      $scope.company = company.data.company;
      $scope.companyOwner = company.data.companyOwner;
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });

  $scope.removeCompany = function(companyID) {
    // console.log("Clicked the remove button: ", companyID);
    AT_Factory.removeCompany(companyID)
      .then(function(companyRemoved) {
        // console.log("company removed: ", companyRemoved);
        // Call viewCompanies after removing a company
        $state.go("companies");
      })
      .catch(function(error) {
        console.log("There was an error!!!", error.stack);
      });
  };

});

////////// Edit Company //////////
app.controller("EditCompanyController", function($scope, $state, $stateParams, AT_Factory) {
  // console.log("Using the EditCompanyController");
  var companyID = $stateParams.companyID;

  AT_Factory.viewCompany(companyID)
    .then(function(company) {
      $scope.company = company.data.company;
      // console.log($scope.company);
      $scope.companyOwner = company.data.companyOwner;
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });

  $scope.editCompany = function() {
    var company_information = $scope.company;
    // console.log("Company information: ", company_information);
    var userID = $scope.logged_user._id;
    AT_Factory.editCompany(userID, company_information)
      .then(function(success) {
        // console.log("We were successful: ", success);
        $state.go("view_company", {companyID: company_information._id});
      })
      .catch(function(error) {
        console.log("There was an error!!!", error.stack);
      });
  };

});


////////// CONTACT CONTROLLERS //////////
////////// View Contacts //////////
app.controller("ContactsController", function($scope, $state, $rootScope, AT_Factory, ngDialog) {
  // console.log("Using the ContactsController");

  $scope.viewContacts = function() {
    AT_Factory.viewContacts()
      .then(function(contactsInformation) {
        // console.log("contactsInformation: ", contactsInformation);
        $scope.contacts = contactsInformation.data.contacts;
        $scope.companies = contactsInformation.data.companies;
      })
      .catch(function(error) {
        console.log("There was an error!!!", error.stack);
      });
  };

  // Call viewContacts after loading page
  $scope.viewContacts();

  $scope.createContact = function() {
  var userID = $scope.logged_user._id;
  var companyID = $rootScope.rootScopeCompanyID;
  var contact_information = $scope.contact;

  AT_Factory.createContact(userID, companyID, contact_information)
    .then(function(success) {
      // console.log("We were successful: ", success);
      // Call viewContacts after adding contact
      $scope.viewContacts();
      // Clear rootScope variable used to pass information to this controller
      $rootScope.rootScopeCompanyID = null;
      // Close modal dialog if open
      ngDialog.close();
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });
  };

});

////////// View Company Contacts //////////
app.controller("ViewCompanyContacts", function($scope, $state, $rootScope, $stateParams, AT_Factory, ngDialog) {
  var companyID = $stateParams.companyID;

  $scope.viewCompanyContacts = function() {
    AT_Factory.viewCompanyContacts(companyID)
      .then(function(contacts) {
        $scope.contacts = contacts.data.contacts;
        // console.log("contacts: ", $scope.contacts);
      })
      .catch(function(error) {
        console.log("There was an error!!!", error.stack);
      });
  };

  // Call viewCompanyContacts after loading page
  $scope.viewCompanyContacts();

  // Open modal panel to create contact
  $scope.openCreateContact = function () {
    // Create rootScope variable to pass information to another controller
    $rootScope.rootScopeCompanyID = companyID;

    ngDialog.open({
      template: "views/contact/create_contact.html",
      controller: "CreateContactController",
      className: "ngdialog-theme-default",
      closeByEscape: true,
      showClose: true,
      width: 850
    });
  };

  $scope.editContact = function(contactID) {
    $state.go("edit_contact", {contactID: contactID});
  };

  $scope.removeContact = function(contactID) {
    AT_Factory.removeContact(contactID)
      .then(function(contactRemoved) {
        // Reload view to show the contacts after removing one
        $state.reload();
      })
      .catch(function(error) {
        console.log("There was an error!!!", error.stack);
      });
  };

});

////////// Create Contact //////////
app.controller("CreateContactController", function($scope, $state, $rootScope, AT_Factory, ngDialog) {
  $scope.createContact = function() {
  var userID = $scope.logged_user._id;
  var companyID = $rootScope.rootScopeCompanyID;
  var contact_information = $scope.contact;

  AT_Factory.createContact(userID, companyID, contact_information)
    .then(function(success) {
      // console.log("We were successful: ", success);
      // Clear rootScope variable used to pass information to this controller
      $rootScope.rootScopeCompanyID = null;
      // Close modal dialog if open
      ngDialog.close();

      // Reload view to show the new contacts
      $state.reload();

    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });
  };

});

////////// Edit Contact //////////
app.controller("EditContactController", function($scope, $state, $stateParams, AT_Factory) {
  var contactID = $stateParams.contactID;

  AT_Factory.viewOneContact(contactID)
    .then(function(contact) {
      $scope.contact = contact.data.contact;
      $scope.contactOwner = contact.data.contactOwner;
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });

  $scope.editContact = function() {
    var contact_information = $scope.contact;
    // console.log("Contact information: ", contact_information);
    var userID = $scope.logged_user._id;
    AT_Factory.editContact(userID, contact_information)
      .then(function(success) {
        // console.log("We were successful: ", success);
        $state.go("view_company", {companyID: contact_information.company});
      })
      .catch(function(error) {
        console.log("There was an error!!!", error.stack);
      });
  };

});




////////////////////////////
////////// ROUTES //////////
////////////////////////////
app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state({
    name: "home",
    url: "/",
    templateUrl: "views/general/home.html",
    controller: "HomeController"
  })
  .state({
    name: "dashboard",
    url: "/dashboard",
    templateUrl: "views/general/dashboard.html",
    controller: "DashboardController"
  })
  .state({
    name: "register",
    url: "/User/register",
    templateUrl: "views/user/register.html",
    controller: "RegisterController"
  })
  .state({
    name: "login",
    url: "/User/login",
    templateUrl: "views/user/login.html",
    controller: "LoginController"
  })
  .state({
    name: "companies",
    url: "/Companies",
    templateUrl: "views/company/companies.html",
    controller: "CompaniesController"
  })
  .state({
    name: "track_company",
    url: "/Company/track",
    templateUrl: "views/company/track_company.html",
    controller: "TrackCompanyController"
  })
  .state({
    name: "view_company",
    url: "/Company/view/{companyID}",
    templateUrl: "views/company/view_company.html",
    controller: "ViewCompanyController"
  })
  .state({
    name: "view_company.contacts",
    url: "/contacts",
    templateUrl: "views/contact/company_contacts.html",
    controller: "ViewCompanyContacts"
  })
  .state({
    name: "edit_company",
    url: "/Company/edit/{companyID}",
    templateUrl: "views/company/edit_company.html",
    controller: "EditCompanyController"
  })
  .state({
    name: "contacts",
    url: "/Contacts",
    templateUrl: "views/contact/contacts.html",
    controller: "ContactsController"
  })
  .state({
    name: "create_contact",
    url: "/Contact/create",
    templateUrl: "views/contact/create_contact.html",
    controller: "CreateContactController"
  })
  .state({
    name: "edit_contact",
    url: "/Contact/edit/{contactID}",
    templateUrl: "views/contact/edit_contact.html",
    controller: "EditContactController"
  })
  ;

  $urlRouterProvider.otherwise("/");
});
