var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
const ejs = require("ejs");
const url = require('url'); 


function randomString(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'CatNMouse',
	database : 'nodelogin'
});

var app = express();


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				console.log(results);
				response.redirect("/stationary");
				console.log(response);
				return;
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/stationary', function(request, response) {
	if (request.session.loggedin) {
		connection.query('SELECT * FROM stationary', function(error, results, fields) {
			if (error)
				console.log(error);
			console.log(results);
			response.render('welcome.ejs', {
				stationary: results
			}, function(err, result){
				if(err)
					console.log(err);
				console.log(result);
				console.log(response);
				response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
				response.set('Content-Type', 'text/html');
				response.send(result);
			});	
			return;
		});
	} else {
		return response.send('Please login to view this page!');
	}
});


app.get('/stationary/:id', function(req, res){
	let itemId = req.params.id;
	console.log(itemId);
     let query = "SELECT * FROM `stationary` WHERE id = '" + itemId + "' ";
     connection.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log(result);
            res.render('item.ejs', {
                item: result[0]
            });
        });
     return;
});

app.post('/addToCart', function(req, res){
	let quantity = req.body.quantity;
	let item = req.body.item;
	console.log(item);
     let query = "INSERT INTO orders (item, quantity) VALUES ('" + item + "', '" + quantity + "')";
     connection.query(query, (err, result) => {
            if (err) {
            	console.log(err);
                return res.status(500).send(err);
            }
            console.log(result);
            return;
        });
});

app.get('/order', function(req, res){
	connection.query('SELECT * FROM orders WHERE refRequestId IS NULL', function(error, results, fields) {
			if (error)
				console.log(error);
			console.log(results);
			res.render('order.ejs', {
				order: results
			}, function(err, result){
				if(err)
					console.log(err);
				res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
				res.set('Content-Type', 'text/html');
				res.send(result);
			});	
			return;
		});
});


app.post('/makeRequest', function(req, res){
	let orderId = req.body.orderId;
		console.log("im here");
     let query = "INSERT INTO requests (request) VALUES ('Request " + randomString(8) + "')";
     connection.query(query, (err, result) => {
            if (err) {
            	console.log(err);
                return res.status(500).send(err);
            }
            console.log(result);
            console.log(result.insertId);
            query2 = "UPDATE orders SET refRequestId = " + result.insertId + " WHERE refRequestId IS NULL";
            connection.query(query2, (err, result) => {
            	if(err)
            		console.log(err);
            	res.redirect('/stationary');
            })
        });
});


app.get('/request', function(req, res){
	connection.query('SELECT * FROM requests' , function(error, results, fields) {
			if (error)
				console.log(error);
			console.log(results);
			res.render('request.ejs', {
				requests: results
			}, function(err, result){
				if(err)
					console.log(err);
				res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
				res.set('Content-Type', 'text/html');
				res.send(result);
			});	
			return;
		});
});


app.get('/request/:id', function(req, res){
	let itemId = req.params.id;
	console.log(itemId);
     let query = "SELECT * FROM `orders` WHERE refRequestId = '" + itemId + "' ";
     connection.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log(result);
            res.render('ordersInRequest.ejs', {
                order: result
            });
        });
     return;
});


app.get('/editOrder/:id', function(req, res){
	let orderId = req.params.id;
	console.log(orderId);
	console.log("here");
	let query = "SELECT * FROM `orders` WHERE id = " + orderId;
     connection.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log(result);
            console.log("here 2");
            res.render('editOrder.ejs', {
                order: result[0]
            });
        });
     return;
})


app.post('/saveOrder', function(req, res){
	var orderId = req.body.orderId;
	var item = req.body.item;
	var quantity = req.body.quantity;
	var requestId = req.body.requestId;
	query = "UPDATE orders SET quantity = " + quantity + " WHERE id = " + orderId;
    connection.query(query, (err, result) => {
    	if(err)
    		console.log(err);
    	res.redirect('/request/' + requestId);
    });
});


app.get('/deleteOrder/:id', function(req, res){
	let orderId = req.params.id;
	console.log(orderId);
	console.log("here");
	let query = "DELETE FROM `orders` WHERE id = " + orderId;
     connection.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            console.log(result);
            console.log("here 2");
            res.redirect("/request")
        });
     return;
})


app.listen(3000);