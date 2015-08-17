// custom cartoDB setup intended for direct SQL api calls (no node)
// this is a temporary solution to create HTTPS requests
// since the protocol is explicit when calls are made

var CartoDBTemp = function(token){
	this.user = token.cartodb_user;
	this.api_key = token.cartodb_api_key;
	this.table = token.cartodb_table;
};

CartoDBTemp.prototype.createRequest = function(valueString){
	// scavenger_carto (the_geom,ig_created_time, ig_id, ig_link, ig_thumbnail, team_name)
	var query ="WITH n(the_geom, ig_created_time, ig_id, ig_link, ig_thumbnail, team_name) AS (" +
					 	"VALUES " + valueString +
					")," +
					"upsert AS (" +
						"UPDATE " + this.table + " o " +
						"SET the_geom = n.the_geom " + // only update geo location now, all others are constant
						"FROM n WHERE o.ig_id = n.ig_id " +
						"RETURNING o.ig_id" +
					")" +
					"INSERT INTO "+ this.table + " (the_geom, ig_created_time, ig_id, ig_link, ig_thumbnail, team_name) " +
					"SELECT * FROM n " +
					"WHERE n.ig_id NOT IN (" +
						"SELECT ig_id FROM upsert" +
					")";

	var request = "https://" + this.user + ".cartodb.com/api/v2/sql?q=" + query + "&api_key=" + this.api_key;

	return request
};

module.exports = CartoDBTemp;