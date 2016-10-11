// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])
    .run(function($ionicPlatform) {
        'use strict';
        $ionicPlatform.ready(function() {
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

//Controlador de la aplicación, implementa los plugnis de cordova
app.controller('BarcodeCtrl', function($scope, $cordovaBarcodeScanner, $cordovaGeolocation, $ionicLoading, $ionicPlatform) {
    'use strict';
    $ionicPlatform.ready(function() {
        //Escanea el código QR
        $scope.scanBarcode = function() {
            $cordovaBarcodeScanner.scan().then(function(imageData) {
              //ALERTA, IMPLEMENTAR ALERTAS USANDO UN SERVICIO, $ionicPopup puede servir!!!.
                alert(imageData.text);
                console.log("Formato " + imageData.format);
            }, function(error) {
                console.log("Error " + error);
            });
        };

        //Obtiene el GPS
        $scope.localize = function() {
            cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled) {
                console.log("GPS location is " + (enabled ? "enabled" : "disabled"));
                alert("Funciona el GPS");
                var options = {
                    enableHighAccuracy: true,
                    maximumAge: 10000
                };
                $ionicLoading.show({
                    template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Obteniendo posición, por favor espere!'
                });
                var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

                function onSuccess(position) {

                    alert('Latitud: ' + position.coords.latitude + '\n' +
                        'Longitud: ' + position.coords.longitude + '\n' +
                        'Timestamp: ' + position.timestamp + '\n');
                    $ionicLoading.hide();
                }

                function onError(error) {
                    $ionicLoading.hide();
                    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                }
            }, function(error) {
                console.error("El siguiente error ocurrío: " + error);
            });
        };
    });
});