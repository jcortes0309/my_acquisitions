var app = angular.module("acquisitions_tracker", ["ui.router", "ngCookies", "angularMoment"]);


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



  return service;

});

/////////////////////////////////
////////// CONTROLLERS //////////
/////////////////////////////////

////////// HOME CONTROLLER //////////
app.controller("HomeController", function($state) {
  console.log("Inside the HomeController");
});

app.controller("RegisterController", function($scope, AT_Factory) {
  console.log("Using the RegisterController");

  $scope.user = {};

  $scope.register = function() {
    if ($scope.user.password === $scope.user.password2) {
      var user_registration = $scope.user;
      delete user_registration.password2;
      console.log("This is the user_registration: ", user_registration);
      AT_Factory.register(user_registration)
        .then(function(success) {
          // $state.go("login");
        })
        .catch(function(error) {
          console.log("There was an error!!!", error.stack);
        });
    } else {
      return;
    }
  };
});


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
  ;

  $urlRouterProvider.otherwise("/");
});
