var express = require("express");
var app = express();
var  router = express.Router();

var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var morgan = require("morgan");
var jwt = require("jsonwebtoken");

var config =  require("./config");
var User = require("./model/user");

app.use(morgan('dev'));
app.set('secretkey', config.SECRET);
console.log(app.get('secretkey'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect(config.DATABASECON, function(){
	console.log("THis is connected to database succesfully")
;})

router.get("/", function(request, response){
	response.send("this is my JWT Authentication app")
})

router.post("/createuser", function(request, response){
		var userObj = request.body;

		User.createUser(userObj,function(err, data){
			if(err){
				throw err;
			}
			response.json(data);
		});
})

router.get("/getUser/:name", function(request, response){
		var userName = request.params.name;
		User.getUserByName(userName, function(err, data){
			if(err){
				throw err
			}
			response.json(data)
		})

})

router.get("/getAllUser", function(request, response){
		User.getAllUser(function(err, data){
			if(err){
				throw err
			}
			response.json(data)
		})

})

router.post("/authenticate", function(request, response){
	var userName= request.body.name;
	var password= request.body.password;

	User.getUserByName(userName,function(err,user){
		if(err){
			throw err;
		}
		if(!user){
			response.json({
				success: false,
				message: "Authentication failed, username mismatch"
			})
		}else if(user){
			if(user.password != password){
				response.json({
					success: false,
					message: "Authetiction failed, password not match"
				})
			}
		else{
			var token = jwt.sign(user, app.get('secretkey'))
			response.json({
				success : true,
				message: "Here is your token",
				token  : token
			})
		}
		}

	});
})

router.use(function(request, response,next){
		var token = request.body.token || request.query.token ||
		            request.headers["x-access-token"];

		        if(token){
		        	jwt.verify(token, app.get('secretkey'), function(err, decoded){
		        		if(err){
		        			throw err;
		        			response.json({
		        				success : false,
		        				message: "Authentication failed not a valid token"
		        			})
		        		}
		        		request.decoded = decoded;
		        		next();
		        	})
		        }else{
		        	response.status(403).send({
		        		success: false,
		        		message: "Please Provide a token"
		        	})

		        }
});


app.use("/api", router);
var PORT= process.env.PORT || 8005;
app.listen(PORT, function(){
	console.log("Server is Listing at: "+PORT);
})