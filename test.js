var http = require("http");
var path = require("path");


//a request class to simplify the request creation with node http
function testRequest(address, port, method, path, data) {
    this.address = address;
    this.port = port;
    this.method = method;
    this.data = data;
    this.path = path;
}

 //represents a test.
 //testName - name of the test
 //request - our request object
 //handler - cllback function to deal with responses
 //optionalHeaders - if we need more headers to our request
 //timeout - timeout for the test
function test(testName, request, handler, optionalHeaders, timeout) {
    var testName = testName;
    var request = request;
    var handlerFunc = handler;
    var timeout = timeout;

    var options = {
        hostname: request.address,
        port: request.port,
        path: request.path,
        method: request.method,
        agent: false,
        headers: {
            'Content-Length': (request.data) ? request.data.length : 0
        }
    };

    if (optionalHeaders) {
        options.headers = optionalHeaders;
    }

    //run the test
    this.run = function() {
        handlerFunc.done = {
            done: false
        };
        console.log("running test: " + testName + "\n");
        var req = http.request(options, handlerFunc(testName, handlerFunc.done));

        setTimeout(function() {
            req.destroy();
        }, 10 * 1000);

        req.on("error", function(e) {
            if (!handlerFunc.done["done"]) {
                console.log(testName + ": Tester failed make sure the server is running (--\n"+e+"--)");
            }
        });

        if (timeout == undefined) {
            req.end(request.data);
        } else {
            setTimeout(function() {
                req.end(request.data);
            }, timeout);
        }

    }

}

//helper function - checks the response and makes sure we passed
function testResponse(expectedStatusCode) {
    return function(testName, done) {
        return function(res) {
            done["done"] = true;
            if (res.statusCode != expectedStatusCode) {
                console.log(testName + ": Failed! expected status: " + expectedStatusCode + " Actual status code: " + res.statusCode);
                console.log(testName + ": " + JSON.stringify(res.headers));
                done["done"]
            } else {
                console.log(testName + ": Success!");
            }
        };
    };
}

//helper function - checks that after login we succeed in preforming operations
function testAfterLogin(address, port, secondTestRequest, secondTestingFunction) {
    return function(testName) {
        return function(res) {
            if (res.statusCode != 200) {
                console.log(testName + ": Login Failed! expected status: 200 Actual status code: " + res.statusCode);
                return;
            }

            var sessionKey = "";

            res.on('data', function(chunk) {
                // get the cookie
                sessionKey = res.headers["set-cookie"][0].split(";")[0].split("=")[1];

                // send the second request
                var internalTest = new test(testName + " - [INTERNAL REQUEST] (check the second request)",
                    secondTestRequest,
                    secondTestingFunction, {
                        "Cookie": "key=" + sessionKey,
                        "Content-Type": "application/json",
                        "Content-Length": (secondTestRequest.data) ? secondTestRequest.data.length : 0
                    });
                internalTest.run();
                return;
            });

        }
    }
}


//the tester function, performs all the tests
function tester() {
    var address = process.argv[2];
	if (address === undefined) {
		address = 'localhost';
	}
	console.log(address);
    var port = process.argv[3];
	if (port === undefined) {
		port = '8888';
	}
    var result;

    var existingUserInfo = {
        username: "gefen",
        password: "gefen"
    };

    var badPassUserInfo = {
        username: "gefen",
        password: "qwerty"
    };

    var newUserInfo = {
        fullname: "adi e",
        username: "adie",
        password: "123"
    };

    var todoItem = {
        id: 12,
        value: "test item"
    };

    var todoUpadateItemExist = {
        id: 12,
        status: true,
        value: "update test item"
    };

    var todoUpadateItemDONTExist = {
        id: 246,
        status: true,
        value: "update test item"
    };

    var todoToDeleteExist = {
        id: 12
    };

    var todoToDeleteDONTExist = {
        id: 246
    };

    var testRequests = [
    ];

    var allTests = [

        new test("1 - GET /",
            new testRequest(address, port, "GET", "/"),
            testResponse(200)),

        new test("2 - GET /item",
            new testRequest(address, port, "GET", "/item"),
            testResponse(400)),

        new test("3 - GET /login",
            new testRequest(address, port, "GET", "/login"),
            testResponse(404)),

        new test("4 - login with valid username and password",
            new testRequest(address, port, "POST", "/login", JSON.stringify(existingUserInfo)),
            testResponse(200),
            {
                "Content-Type": "application/json",
                "Content-Length": JSON.stringify(existingUserInfo).length
            }),

        new test("5 - login with valid username and invalid password",
            new testRequest(address, port, "POST", "/login", JSON.stringify(badPassUserInfo)),
            testResponse(200), 
            {
                "Content-Type": "application/json",
                "Content-Length": JSON.stringify(badPassUserInfo).length
            }),

        new test("6 - login with invalid username",
            new testRequest(address, port, "POST", "/login", JSON.stringify(newUserInfo)),
            testResponse(200), 
            {
                "Content-Type": "application/json",
                "Content-Length": JSON.stringify(newUserInfo).length
            }),

        new test("7 - GET /register",
            new testRequest(address, port, "GET", "/register"), 
            testResponse(404)),

        new test("8 - register new user",
            new testRequest(address, port, "POST", "/register", JSON.stringify(newUserInfo)),
            testResponse(200), 
            {
                "Content-Type": "application/json",
                "Content-Length": JSON.stringify(newUserInfo).length
            }),

        new test("9 - register existing user",
            new testRequest(address, port, "POST", "/register", JSON.stringify(newUserInfo)),
            testResponse(500), 
            {
                "Content-Type": "application/json",
                "Content-Length": JSON.stringify(newUserInfo).length
            })
    ]



    for (var i = 0; i < allTests.length; i++) {
        result = allTests[i].run();
    }

}

tester();