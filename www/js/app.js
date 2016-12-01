// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova', 'ngCookies'])
    .run(function ($ionicPlatform) {
        'use strict';
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });

app.run(run);

run.$inject = ['$http'];

/**
 * @name run
 * @desc Update xsrf $http headers to align with Django's defaults
 */
function run($http) {
    $http.defaults.xsrfHeaderName = 'X-CSRFToken';
    $http.defaults.xsrfCookieName = 'csrftoken';
}


app.controller('LoginController', ['$location', '$scope', 'Authentication', function ($location, $scope, Authentication) {
    var vm = this;
    vm.login = login;
    vm.logout = logout;
    activate();

    /**
     * @name activate
     * @desc Actions to be performed when this controller is instantiated
     * @memberOf thinkster.authentication.controllers.LoginController
     */
    function activate() {
        // If the user is authenticated, they should not be here.

        if (Authentication.isAuthenticated()) {
            console.log($cookie.get('sessionid'));
            window.open('/datos.html', '_self');
        } else {
            logout();
        }
    }

    function login() {
        Authentication.login(vm.username, vm.password);
    }

    function logout() {
        Authentication.logout();
    }
}]);

//Controlador de la aplicación, implementa los plugnis de cordova
app.controller('BarcodeCtrl', function ($scope, Posts, Authentication, $cordovaBarcodeScanner, $cordovaGeolocation, $ionicLoading, $ionicPlatform) {
    'use strict';
    $ionicPlatform.ready(function () {
        $scope.localize = localize;
        $scope.latitud = '0';
        $scope.longitud = '0';
        $scope.timestamp = '0';
        $scope.barcode = '0';
        //Escanea el código QR
        $scope.scanBarcode = function () {
            $cordovaBarcodeScanner.scan().then(function (imageData) {
                if (!!imageData.text) {
                    $scope.barcode = imageData.text;
                    localize();
                }
                console.log("Formato " + imageData.format);
            }, function (error) {
                console.log("Error " + error);
            });
        };


        function enviarDatos() {
            Posts.create($scope.barcode, $scope.latitud, $scope.longitud, $scope.timestamp).then(onSuccess, onError);

            function onSuccess(data, status, headers, config) {
                //ALERTA, IMPLEMENTAR LA ALERTA USANDO UN SERVICIO, $ionicPopup puede servir!!!!!
                alert("Registrado")
            }

            function onError(data, status, headers, config) {
                //ALERTA, IMPLEMENTAR LA ALERTA USANDO UN SERVICIO, $ionicPopup puede servir!!!!!
                alert("No registrado")
            }
        }

        function localize() {
            var options = {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 1000
            };
            $cordovaGeolocation.getCurrentPosition(options).then(onSuccess, onError);

            //navigator.geolocation.getCurrentPosition(onSuccess, onError, options);


            function onSuccess(position) {
                $scope.latitud = position.coords.latitude;
                $scope.longitud = position.coords.longitude;
                $scope.timestamp = position.timestamp;
                enviarDatos();
            }

            function onError(error) {
                enviarDatos();
                //alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
            }

        }


        //Obtiene el GPS
        /* $scope.localize = function() {
             cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled) {
                 console.log("GPS location is " + (enabled ? "enabled" : "disabled"));
                 //alert("Funciona el GPS" + (enabled ? "enabled" : "disabled"));

             }, function(error) {
                 console.error("El siguiente error ocurrío: " + error);
             });
         };*/
    });
});

Authentication.$inject = ['$cookies', '$http', '$ionicPopup'];

function Authentication($cookies, $http, $ionicPopup) {
    return {
        getAuthenticatedAccount: getAuthenticatedAccount,
        isAuthenticated: isAuthenticated,
        login: login,
        logout: logout,
        setAuthenticatedAccount: setAuthenticatedAccount,
        unauthenticate: unauthenticate
    };

    /**
     * @name getAuthenticatedAccount
     * @desc Return the currently authenticated account
     * @returns {object|undefined} Account if authenticated, else `undefined`
     * @memberOf thinkster.authentication.services.Authentication
     */
    function getAuthenticatedAccount() {
        if (!$cookies.authenticatedAccount) {
            return;
        }

        return JSON.parse($cookies.authenticatedAccount);
    }

    /**
     * @name isAuthenticated
     * @desc Check if the current user is authenticated
     * @returns {boolean} True is user is authenticated, else false.
     * @memberOf thinkster.authentication.services.Authentication
     */
    function isAuthenticated() {
        return $cookies.get('sessionid');
    }

    /**
     * @name setAuthenticatedAccount
     * @desc Stringify the account object and store it in a cookie
     * @param {Object} user The account object to be stored
     * @returns {undefined}
     * @memberOf thinkster.authentication.services.Authentication
     */
    function setAuthenticatedAccount(account) {
        $cookies.authenticatedAccount = JSON.stringify(account);
    }

    /**
     * @name unauthenticate
     * @desc Delete the cookie where the user object is stored
     * @returns {undefined}
     * @memberOf thinkster.authentication.services.Authentication
     */
    function unauthenticate() {
        delete $cookies.authenticatedAccount;
    }

    /**
     * @name login
     * @desc Try to log in with username `username` and password `password`
     * @param {string} username The username entered by the user
     * @param {string} password The password entered by the user
     * @returns {Promise}
     * @memberOf thinkster.authentication.services.Authentication
     */
    function login(username, password) {
        return $http.post('/api/v1/auth/login/', {
            username: username,
            password: password
        }).then(loginSuccessFn, loginErrorFn);

        /**
         * @name loginSuccessFns
         * @desc Set the authenticated account and redirect to index
         */
        function loginSuccessFn(data, status, headers, config) {
            setAuthenticatedAccount(data.data);
            window.location = '/datos.html';
        }

        /**
         * @name loginErrorFn
         * @desc Log "Epic failure!" to the console
         */
        function loginErrorFn(data, status, headers, config) {
            $ionicPopup.alert({
                title: 'Error!',
                template: data.data.message
            });
            console.error('Epic failure!');
        }
    }

    /**
     * @name logout
     * @desc Try to log the user out
     * @returns {Promise}
     * @memberOf thinkster.authentication.services.Authentication
     */
    function logout() {
        return $http.post('/api/v1/auth/logout/')
            .then(logoutSuccessFn, logoutErrorFn);

        /**
         * @name logoutSuccessFn
         * @desc Unauthenticate and redirect to index with page reload
         */
        function logoutSuccessFn(data, status, headers, config) {
            unauthenticate();

            window.location = '/';
        }

        /**
         * @name logoutErrorFn
         * @desc Log "Epic failure!" to the console
         */
        function logoutErrorFn(data, status, headers, config) {
            console.error('Epic failure LogOut!');
        }
    }

};

Posts.$inject = ['$http'];

/**
 * @namespace Posts
 * @returns {Factory}
 */
function Posts($http) {
    var Posts = {
        all: all,
        create: create,
        get: get
    };

    return Posts;

    ////////////////////

    /**
     * @name all
     * @desc Get all Posts
     * @returns {Promise}
     * @memberOf thinkster.posts.services.Posts
     */
    function all() {
        return $http.get('/api/v1/posts/');
    }


    /**
     * @name create
     * @desc Create a new Post
     * @param {string} barcode The barcode of the new Post
     * @returns {Promise}
     * @memberOf thinkster.posts.services.Posts
     */
    function create(barcode, latitud, longitud, timestamp) {
        return $http.post('/api/v1/posts/', {
            barcode: barcode,
            latitud: latitud,
            longitud: longitud,
            timestamp: timestamp
        });
    }

    /**
     * @name get
     * @desc Get the Posts of a given user
     * @param {string} username The username to get Posts for
     * @returns {Promise}
     * @memberOf thinkster.posts.services.Posts
     */
    function get(username) {
        return $http.get('/api/v1/accounts/' + username + '/posts/');
    }
};

app.service('Authentication', Authentication);
app.service('Posts', Posts);