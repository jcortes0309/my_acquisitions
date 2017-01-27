var app = angular.module("acquisitions_tracker", ["ui.router", "ngCookies", "angularMoment"]);


app.run(function($rootScope, $state, $cookies) {
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
    console.log("In the factory with the user_registration info: ", user_registration);
    return $http({
      method: "POST",
      url: "/user/register",
      data: user_registration
    });
  };

  // Login a user
  service.login = function(login_information) {
    console.log("In the factory with the login_information info: ", login_information);
    return $http({
      method: "POST",
      url: "/user/login",
      data: login_information
    });
  };



  return service;

});

/////////////////////////////////
////////// CONTROLLERS //////////
/////////////////////////////////

////////// HOME CONTROLLER //////////
app.controller("HomeController", function($state) {
  console.log("Inside the HomeController");
});

app.controller("RegisterController", function($scope, $state, AT_Factory) {
  console.log("Using the RegisterController");

  $scope.user = {};

  $scope.register = function() {
    if ($scope.user.password === $scope.user.password2) {
      var user_registration = $scope.user;
      delete user_registration.password2;
      $scope.user = {};
      console.log("This is the user_registration: ", user_registration);
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

app.controller("LoginController", function($scope, $state, $cookies, $rootScope, AT_Factory) {
  $scope.user = {
    username: "",
    password: ""
  };
  $scope.login = function() {
    var login_information = $scope.user;
    console.log(login_information);
    AT_Factory.login(login_information)
      .then(function(logged_user) {
        console.log("We were successful: ", logged_user);
        $cookies.putObject("at_cd", logged_user);
        $rootScope.at_cd = logged_user;
        $rootScope.logged_user = $rootScope.at_cd.data.user;
        $state.go("home");
      })
      .catch(function(error) {
        console.log("There was an error!!!", error);
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
    templateUrl: "views/home.html",
    controller: "HomeController"
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
  ;

  $urlRouterProvider.otherwise("/");
});
