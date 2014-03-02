/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
todomvc.factory('todoStorage', function ($http) {
	return {
		login: function(loginDetails){
			return $http.post('/login', loginDetails);
		},
		register: function(registerDetails) {
			return $http.post('/register', registerDetails);
		},
		getAll: function () {
			return $http.get('/item');
		},
		
		addTask: function (newTask) {
			return $http.post('/item', newTask);
		},
		updateTask: function (updatedTask) {
			return $http.put('/item', updatedTask); 
		},
		deleteTask: function (deletedTaskId) {
			return $http.delete('/item', deletedTaskId);
		}
	};
	
});
