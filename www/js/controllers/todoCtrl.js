/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, todoStorage, filterFilter, $location) {
	var todos = $scope.todos = new Array();
	todoStorage.getAll().
	success(function (data) {
		if (data.status == 0) {
			updateTodos(data);
			_id = data.maxId + 1;
		} else if (data.status == 1) {
			alert(data.msg);
		}
	}).
	error(function (data, status) {
		if (status == 400) {
			alert(data.msg);
			$location.path("/");
			return;
		}
		alert(data.msg);
	});
	
	var _id = -1;
	$scope.newTodo = '';
	$scope.editedTodo = null;
	
	function updateTodos(data) {
		var allTasks = data.data;
		var values = new Array();
		for (var taskId in allTasks) {
			values.push(allTasks[taskId]);
		}
		todos = $scope.todos = values;
	}
	
	$scope.$watch('todos', function (newValue, oldValue) {
		$scope.remainingCount = filterFilter(todos, { status: false }).length;
		$scope.completedCount = todos.length - $scope.remainingCount;
		$scope.allChecked = !$scope.remainingCount;
	}, true);
	
	// Monitor the current route for changes and adjust the filter accordingly.
	$scope.$on('$routeChangeSuccess', function () {
		var status = $scope.status = $routeParams.status || '';
		$scope.statusFilter = (status === 'active') ?
			{ status: false } : (status === 'completed') ?
			{ status: true } : null;
	}); 

	$scope.addTodo = function () {
		var newTodo = $scope.newTodo.trim();
		if (!newTodo.length) {
			return;
		}
		var newTask = { 
			id: _id,
			value: newTodo,
			status: false
		};
		todoStorage.addTask(newTask).
		success(function(data) {
			if (data.status == 0) {
				updateTodos(data);
				_id++;
			} else if (data.status == 1) {
				alert(data.msg);
			}
		})
		.error(function (data, status) {
			if (status == 400) {
				alert(data.msg);
				$location.path("/");
				return;
			}
			alert(data.msg);
		});

		$scope.newTodo = '';
	};

	$scope.editTodo = function (todo) {
		$scope.editedTodo = todo;
		// Clone the original todo to restore it on demand.
		$scope.originalTodo = angular.extend({}, todo);
	};

	$scope.doneEditing = function (todo) {
		$scope.editedTodo = null;
		todo.value = todo.value.trim();

		if (!todo.value) {
			$scope.removeTodo(todo);
		}
		todoStorage.updateTask(todo).
		success(function(data) {
			if (data.status == 0) {
				updateTodos(data);
			} else if(data.status == 1) {
				alert(data.msg);
			}
		})
		.error(function (data, status) {
			if (status == 400) {
				alert(data.msg);
				$location.path("/");
				return;
			}
			alert(data.msg);
		});
	};
	
	$scope.changeCompleted = function (todo) {
		todo.status = !todo.status;
		todoStorage.updateTask(todo).
		success(function(data) {
			if (data.status == 0) {
				updateTodos(data);
			} else if (data.status == 1) {
				alert(data.msg);
			}
		})
		.error(function (data, status) {
			if (status == 400) {
				alert(data.msg);
				$location.path("/");
				return;
			}
			alert(data.msg);
		});
	};

	$scope.revertEditing = function (todo) {
		todos[todos.indexOf(todo)] = $scope.originalTodo;
		$scope.doneEditing($scope.originalTodo);
	};
	
	$scope.removeTodo = function (todo) {
		todos.splice(todos.indexOf(todo), 1);
		var toDelete = {data: {id: todo.id},
		 headers: {"content-type" : "application/json"}};
		todoStorage.deleteTask(toDelete).
		success(function(data) {
			if (data.status == 0) {
				updateTodos(data);
			} else if (data.status == 1) {
				alert(data.msg);
			}
		})
		.error(function (data, status) {
			if (status == 400) {
				alert(data.msg);
				$location.path("/");
				return;
			}
			alert(data.msg);
		});
	};

	$scope.clearCompletedTodos = function () {
		for (var i=0; i<todos.length; i++) {
			if (todos[i].status==true) {
				$scope.removeTodo(todos[i]);
			}
		}
	};

	$scope.markAll = function (completed) {
		todos.forEach(function (todo) {
			todo.status = !completed;
			$scope.doneEditing(todo);
		});
	};
});
