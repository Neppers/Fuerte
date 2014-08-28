'use strict';

var app = angular.module('SearchContent', []);

app.controller('SearchCtrl', ['$scope', '$http', function($scope, $http) {
    var projectId = angular.element(document.querySelector('[data-id]')).attr('data-id');
    $http.get('api/content/project/' + projectId).success(function(data) {
        $scope.content = data;
    }).error(function(data) {

    });
}]);