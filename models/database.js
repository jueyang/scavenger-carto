var CartoDB = require('cartodb');
var token = require('../token.js');

// CartoDB setup
var cartoClient = new CartoDB({
	user:token.cartodb_user,
	api_key:token.cartodb_api_key
});

cartoClient.acceptString = function(valueString){
	cartoClient.on('connect',function(){
		console.log('cartoDB connected');

		// scavenger_carto (the_geom,ig_created_time, ig_id, ig_link, ig_thumbnail, team_name)

		var queryBlock ="WITH n(the_geom, ig_created_time, ig_id, ig_link, ig_thumbnail, team_name) AS (" +
						 	"VALUES " + valueString +
						")," +
						"upsert AS (" +
							"UPDATE {table} o " +
							"SET the_geom = n.the_geom " + // only update geo location now, all others are constant
							"FROM n WHERE o.ig_id = n.ig_id " +
							"RETURNING o.ig_id" +
						")" +
						"INSERT INTO {table} (the_geom, ig_created_time, ig_id, ig_link, ig_thumbnail, team_name) " +
						"SELECT * FROM n " +
						"WHERE n.ig_id NOT IN (" +
							"SELECT ig_id FROM upsert" +
						")";

		cartoClient.query(queryBlock,{table:token.cartodb_table},function(err,data){
			// TODO pipe error log
			console.log(data);
		})

	});

	cartoClient.connect();
}

module.exports = cartoClient;
