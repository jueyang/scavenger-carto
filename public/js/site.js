Scavenger = function(){
	this.team = $('#teamName');
	this.toMap = $('#toMap');
	this.toTable = $('#toTable');

	this.toMap.on('click',this.getTeamGrams.bind(this));
	this.team.on('keydown',this.onEnterDown.bind(this));
};

Scavenger.prototype.onEnterDown = function(event){
		if (event.which != 13) {
			return;
		}

		this.getTeamGrams();

		event.preventDefault();
};

Scavenger.prototype.getTeamGrams = function(event){
	// get user input from form
	var teamInput = this.team.val().trim();

	$.ajax({
		url: '/grams/' + teamInput,
		type: 'POST',
		data: {team: 'team' + teamInput},
		dataType: 'json'
	}).done(function(){
		// redirect after ajax is finished
		// this triggers a GET on the server
		window.location.href = '/team' + teamInput;
	});

	event.preventDefault();
};

Scavenger.prototype.updateTeamGrams = function(event){
};

Scavenger.prototype.createMap = function(team){
	// map setup
	var map = new L.Map('map',{
		center: [40.7801201,-73.9543557],
		zoom: 2
	});

	L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		}).addTo(map);

	// position the map to the extent of the bounds
	var sql = new cartodb.SQL({user:'jue'});
	var layerOptions = {
		query: "SELECT * FROM scavenger_carto WHERE team_name ='" + team + "'",
		cartocss: '#scavenger_carto {marker-line-width:0; marker-fill: #FDA330;}'
	};

	sql.getBounds(layerOptions.query)
		.done(function(bounds){
			map.fitBounds(bounds);
		});

	var layers = "https://jue.cartodb.com/api/v2/viz/b887b6ec-4487-11e5-ad67-0e853d047bba/viz.json";

	cartodb.createLayer(map,layers)
		.addTo(map)
		.on('done',function(layer){

			var sublayer = layer.getSubLayer(0);

			if (team != undefined){
				sublayer.setSQL(layerOptions.query)
					.setCartoCSS(layerOptions.cartocss);
			}

			sublayer.infowindow.set({
				template: $('#infowindow_template').html(),
				width:200
			});

			// TODO template legend for each team
			sublayer.legend.set({visible:false});
	});
};