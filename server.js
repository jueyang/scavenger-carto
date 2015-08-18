var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var ig = require('instagram-node').instagram();
var _ = require('lodash');
var CartoDBTemp= require('./models/databaseTemp.js');
var token = require('./token.js');

// Instagram setup
ig.use({
	client_id: token.ig_client_id,
	client_secret: token.ig_client_secret
});

// CartoDBTemp setup
var cartoClient = new CartoDBTemp(token);

// app setup
var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'));
app.set('view engine','ejs');

// landing page
app.get('/',function(req,res){
	res.render('pages/index');
});

// team map
app.get('/:team',function(req,res){
	res.render('pages/team', {
		team: req.params.team
	});
});

// when team name is posted
app.post('/grams/:team',function(req,res){

	var teamName = req.body.team;

	// format ig objects to fit the sql table
	var hdl = function(err, medias, pagination, remaining, limit) {
		
		var rows = [];

		medias.forEach(function(media){

			var rowValue;

			// only add a row when location exists
			if (media.location != null) {
				rowValue = "(ST_SetSRID(ST_Point(" + media.location.longitude + "," + media.location.latitude +"),4326),'" +
							media.created_time + "','" +
							media.id + "','" +
							media.link + "','" +
							media.images.thumbnail.url + "','" +
							teamName +
							"')";
			} else {
				return false
			}

			rows.push(rowValue);
		});

		var valueString = _(rows).toString();

		// use the request module to post to CartoDB's SQL API

		if (valueString.length === 0) {
			console.log('no values existed');
		} else {
			var requestString = cartoClient.createRequest(valueString);
			request(requestString, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					console.log(response.body); // should return the same as the CartoDB's node client would
				}
			})
		}

	};

	// TODO pagination
	ig.tag_media_recent(teamName, hdl);

	// passing back the team name
	res.status(200).json(req.body);
});

app.listen(process.env.PORT || 8080);

exports.app = app;