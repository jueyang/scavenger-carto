var express = require('express');
var bodyParser = require('body-parser');
var ig = require('instagram-node').instagram();
var _ = require('lodash');
var CartoDB = require('cartodb');
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

// team map
app.get('/:team',function(req,res){
	var originalName = req.params.team.substring(4);

	res.render('pages/team', {
		team: req.params.team,
		original: originalName
	});
});

// when team name is posted
app.post('/grams/:team',function(req,res){
	var teamName = req.body.team;

	var mediaRows = [];

	var pageCounter = 1;

	// format ig objects to fit the sql table
	var hdl = function(err, medias, pagination, remaining, limit) {
		
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

			mediaRows.push(rowValue);
			
		});

		// instagram pagination

		if(pagination.next) {
			console.log(pageCounter + ' pages have been accessed; more page to come');
			pageCounter ++;

			pagination.next(hdl);

		} else {
			console.log('This is the last page!');

			// using single client for the app creates multiple connections
			// see https://github.com/Vizzuality/cartodb-nodejs/issues/31
			// temp solution: create new instance of cartoClient within the route

			// CartoDB setup
			var cartoClient = new CartoDB({
				user:token.cartodb_user,
				api_key:token.cartodb_api_key
			});

			// add function to CartoClient
			cartoClient.acceptString = function(valueString){
				cartoClient.on('connect',function(){
					console.log('cartoDB is connected');

					// scavenger_carto (the_geom,ig_created_time, ig_id, ig_link, ig_thumbnail, team_name)

					var queryBlock ="WITH n(the_geom, ig_created_time, ig_id, ig_link, ig_thumbnail, team_name) AS (" +
									 	"VALUES " + valueString +
									")," +
									"upsert AS (" +
										"UPDATE {table} o " +
										"SET the_geom = n.the_geom " + // only update geo location now, all others are constant
										"FROM n WHERE o.ig_id = n.ig_id " +
										"RETURNING o.ig_id" +
									") " +
									"INSERT INTO {table} (the_geom, ig_created_time, ig_id, ig_link, ig_thumbnail, team_name) " +
									"SELECT * FROM n " +
									"WHERE n.ig_id NOT IN (" +
										"SELECT ig_id FROM upsert" +
									")";

					cartoClient.query(queryBlock,{table:token.cartodb_table},function(err,data){
						if (err) console.error(err);
						console.log(data);
					});

				});
			};

			// Stringify values to be updated or inserted to CartoDB
			cartoClient.acceptString(_(mediaRows).toString());

			cartoClient.connect();

			res.status(200).json({team:req.body.team, mediaCounts:mediaRows.length});
		}
	};

	ig.tag_media_recent(teamName, hdl);

});

app.listen(process.env.PORT || 8080);

exports.app = app;