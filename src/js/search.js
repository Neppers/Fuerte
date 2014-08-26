'use strict';

var app = angular.module('SearchContent', []);

app.controller('SearchCtrl', ['$scope', '$http', function($scope, $http) {
    $http.get('api/content/project/53f64accba480a4e192a93f9').success(function(data) {
        $scope.content = data;
    }).error(function(data) {

    });
}]);