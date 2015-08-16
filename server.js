var express = require('express');
var ig = require('instagram-node').instagram();
var cartoClient = require('./models/database.js');
var _ = require('lodash');
var fs = require('fs');
var token = require('./token.js');

// Instagram setup
ig.use({
	client_id: token.ig_client_id,
	client_secret: token.ig_client_secret
});

// Express setup
var app = express();

app.get('/',function(req,res){

	// TODO get team name from front end
	var teamName = 'teamTemporary';

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

	ig.tag_media_recent(teamName, hdl);

});

app.listen(process.env.PORT || 8080);

exports.app = app;