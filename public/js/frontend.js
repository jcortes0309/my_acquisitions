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

  $rootScope.openModal = function () {
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
    // console.log("In the factory with the user_registration info: ", user_registration);
    return $http({
      method: "POST",
      url: "/user/register",
      data: user_registration
    });
  };

  // Login a user
  service.login = function(login_information) {
    // console.log("In the factory with the login_information info: ", login_information);
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
    // console.log("In the factory with: ", companyInformation);
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
      url: "/company/view/" + companyID,
    });
  };


  // Edit company
  service.editCompany = function(userID, companyInformation) {
    console.log("Company information in the factory: ", companyInformation);
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
    console.log("Company ID in the factory: ", companyID);
    return $http({
      method: "POST",
      url: "/company/remove",
      data: {
        companyID: companyID
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
app.controller("ViewCompaniesController", function($scope, $state, AT_Factory) {
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
    console.log("Clicked the trackCompany button");
    $state.go("track_company");
  };

  $scope.removeCompany = function(companyID) {
    console.log("Clicked the remove button: ", companyID);
    AT_Factory.removeCompany(companyID)
      .then(function(companyRemoved) {
        console.log("company removed: ", companyRemoved);
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
  // Close modal dialog if open
  ngDialog.close();

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

  // $state.go("view_company.financial_performance");

  AT_Factory.viewCompany(companyID)
    .then(function(company) {
      $scope.company = company.data.company;
      $scope.companyOwner = company.data.companyOwner;
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });

  $scope.removeCompany = function(companyID) {
    console.log("Clicked the remove button: ", companyID);
    AT_Factory.removeCompany(companyID)
      .then(function(companyRemoved) {
        console.log("company removed: ", companyRemoved);
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
      console.log($scope.company);
      $scope.companyOwner = company.data.companyOwner;
    })
    .catch(function(error) {
      console.log("There was an error!!!", error.stack);
    });

  $scope.editCompany = function() {
    var company_information = $scope.company;
    console.log("Company information: ", company_information);
    var userID = $scope.logged_user._id;
    AT_Factory.editCompany(userID, company_information)
      .then(function(success) {
        console.log("We were successful: ", success);
        $state.go("view_company", {companyID: company_information._id});
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
    controller: "ViewCompaniesController"
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
    name: "edit_company",
    url: "/Company/edit/{companyID}",
    templateUrl: "views/company/edit_company.html",
    controller: "EditCompanyController"
  })
  ;

  $urlRouterProvider.otherwise("/");
});
