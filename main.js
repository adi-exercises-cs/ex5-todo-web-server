var express = require("express");
var uuid = require('node-uuid');

var PORT = Number(process.env.PORT || 8888);

var app = express();
app.use(express.bodyParser());
app.use(express.cookieParser());

var allusers = [];
var cookies = [];

/** /login (get) - the body should look like {username:..., password:...} **/
app.post('/login', function (req, res, next) {
	console.log("login");
	var username = req.body.username;
	var password = req.body.password;
	if (!(username in allusers)) {
		res.json(200, {status: 1, msg: "unknown username"});
		return;
	}
	if (allusers[username].password !== password) {
		res.json(200, {status: 1, msg: "your password is incorrect"});
		return;
	}
	
	var cookie = uuid.v4();
	res.cookie('loginCookie', cookie, { maxAge: 900000, httpOnly: true })
	cookies[cookie]=username;
	res.json({status: 0});
});

/**	/register (post) {username:...,fullname:...,password:...} **/
app.post('/register', function (req, res, next) {
	console.log("register");
	var username = req.body.username;
	var password = req.body.password;
	var fullname = req.body.fullname;
	if (username in allusers) {
		res.json(500, {status: 1, msg: "this username already exists"});
		return;
	}
	allusers[username] = {password : password,
							fullname : fullname,
							allTasks : {}};
	var cookie = uuid.v4();
	res.cookie('loginCookie', cookie, { maxAge: 900000, httpOnly: true })
	cookies[cookie]=username;
	res.json({status: 0});
});


/** method:get: returns the entire list **/
app.get("/item", function(req, res, next) {
	console.log("get");
	if (!req.cookies || !req.cookies.loginCookie || !(req.cookies.loginCookie in cookies)) {
		res.json(400, {status: 1, msg: "your session expired. please log in again.."});
		return;
	}
	var user = cookies[req.cookies.loginCookie];
	var max = -1;
	for (var id in allusers[user].allTasks) {
		if (id > max) {
			max = id;
		}
	}
	res.json({status: 0, data: allusers[user].allTasks, maxId: max});
});


/** method:post : creates new todo item body:{id:..,value:} if id exists for that user return error 500 **/
app.post('/item', function (req, res, next) {
	console.log("post");
	if (!req.cookies || !req.cookies.loginCookie || !(req.cookies.loginCookie in cookies)) {
		res.json(400, {status: 1, msg: "your session expired. please log in again.."});
		return;
	}
	var user = cookies[req.cookies.loginCookie];
	var task = req.body;
	if (task.id in allusers[user].allTasks) {
		res.json(500, {status: 1, msg: "this task already exists"});
		return;
	}
	allusers[user].allTasks[task.id] = task;
	res.json({status: 0, data: allusers[user].allTasks});
});

/** method:put : update item body: {id:..value:..,status:(0 for active, 1 for complete} **/
app.put("/item", function(req, res, next) {
	console.log("put");
	if (!req.cookies || !req.cookies.loginCookie || !(req.cookies.loginCookie in cookies)) {
		res.json(400, {status: 1, msg: "your session expired. please log in again.."});
		return;
	}
	var user = cookies[req.cookies.loginCookie];
	var task = req.body;
	if (!(task.id in allusers[user].allTasks)) {
		res.json(200, {status: 1, msg: "this task doesn't exists"});
		return;
	}
	allusers[user].allTasks[task.id] = task;
	res.json({status: 0, data: allusers[user].allTasks});
});

/** method: delete: delete item {id: (either item ID or -1 to delete it all)} **/
app.delete("/item", function (req, res, next) {
	console.log("delete");
	if (!req.cookies || !req.cookies.loginCookie || !(req.cookies.loginCookie in cookies)) {
		res.json(400, {status: 1, msg: "your session expired. please log in again.."});
		return;
	}
	var user = cookies[req.cookies.loginCookie];
	var id = req.body.id;
	if (id == -1) {
		allusers[user].allTasks = {};
		res.json({status: 0, data: allusers[user].allTasks});
	}
	if (!(id in allusers[user].allTasks)) {
		res.json(200, {status: 1, msg: "this task doesn't exists"});
		return;
	}
	delete allusers[user].allTasks[id];
	res.json({status: 0, data: allusers[user].allTasks});
});

app.use(express.static(__dirname + "/www"));

app.listen(PORT);