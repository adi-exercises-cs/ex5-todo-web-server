/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('LoginCtrl', function LoginCtrl($scope, $routeParams, todoStorage, filterFilter, $location) {
	$scope.username = '';
	$scope.password = '';
	$scope.fullName = '';
	$scope.verify = '';
	
	$scope.login = function () {
		if ($scope.username === '') {
			alert("you must insert username");
			return;
		}
		if ($scope.password === '') {
			alert("you must insert password");
			return;
		}
		todoStorage.login({username: $scope.username,
							password: $scope.password}).
		success(function(data) {
			if (data.status === 1) {
				alert(data.message);
				return;
			}
			if (data.status === 0) {
				$location.path("/item");
			}
		})
		.error(function(data) {
			alert(data.msg);
		});
	};
	
	$scope.register = function () {
		if ($scope.fullName === '') {
			alert("you must insert full name");
			return;
		}
		if ($scope.username === '') {
			alert("you must insert username");
			return;
		}
		if ($scope.password === '') {
			alert("you must insert password");
			return;
		}
		if ($scope.verify === '') {
			alert("you must verify password");
			return;
		}
		if ($scope.password !== $scope.verify) {
			alert("your verification doesn't match your password");
			return;
		}
		todoStorage.register({fullname: $scope.fullName,
							username: $scope.username,
							password: $scope.password}).
		success(function(data) {
			if (data.status === 1) {
				alert(data.message);
				return;
			}
			if (data.status === 0) {
				$location.path("/todos");
			}
		})
		.error(function(data) {
			alert(data.msg);
		});
	};
});
