var express = require('express');
var bodyParser = require('body-parser');
var ig = require('instagram-node').instagram();
var _ = require('lodash');
var cartoClient = require('./models/database.js');
var token = require('./token.js');

// Instagram setup
ig.use({
	client_id: token.ig_client_id,
	client_secret: token.ig_client_secret
});

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

// Search by team
app.get('/progress',function(req,res){
	res.render('pages/progress');
});

// when team name is posted
app.post('/team/:team',function(req,res){

	var teamName = req.body.team;

	// TODO pagination
	ig.tag_media_recent(teamName, hdl);

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
		// Stringify values to be updated or inserted to CartoDB
		cartoClient.acceptString(_(rows).toString());
	};
});

app.listen(process.env.PORT || 8080);

exports.app = app;