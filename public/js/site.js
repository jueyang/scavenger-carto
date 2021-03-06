Scavenger = function(){
	this.team = $('#teamName');
	this.toMap = $('#toMap');
	this.update = $('#update');

	this.team.on('keydown',this.onEnterDown.bind(this));
	this.toMap.on('click',this.gramsFromForm.bind(this));
	this.update.on('click',this.gramsFromUpdate.bind(this));
};

Scavenger.prototype.onEnterDown = function(event){
	if (event.which != 13) {
		return;
	}

	this.toMap.trigger('click');

	event.preventDefault();
};

Scavenger.prototype.getTeamGrams = function(input){
	$.ajax({
		url: '/grams/' + input,
		type: 'POST',
		data: {team: 'team' + input},
		dataType: 'json'
	}).done(function(data){
		// redirect after ajax is finished
		// this triggers a GET on the server
		window.location.href = '/team' + input;
	});
}

Scavenger.prototype.gramsFromForm = function(event){
	// get user input from form
	var input = this.team.val().trim();

	this.getTeamGrams(input);

	event.preventDefault();
};

Scavenger.prototype.gramsFromUpdate= function(event){
	var input = $('#name').data('id');
	
	this.getTeamGrams(input);

	event.preventDefault();
}

Scavenger.prototype.createTeamPage = function(team){
	//TODO better way to bind scope
	var view = this;

	this.sql = new cartodb.SQL({user:'jue'});

	this.layerOptions = {
		query: "SELECT * FROM scavenger_carto WHERE team_name ILIKE '%" + team + "%'",
		cartocss: '#scavenger_carto {marker-line-width:0; marker-fill: #FDA330;}'
	};

	this.sql.execute(this.layerOptions.query)
		.done(function(data){
			if (data.rows.length != 0){
				view.initMap();
				view.setWelcomeText(data.rows.length);
			} else {
				view.setWelcomeText();
			}
		})
		.error(function(errors){
			console.log(errors);
		});

};
Scavenger.prototype.setWelcomeText = function(num){
	if (num != undefined){
		$('#dataRowNumber').text(num);
		$('#withDataRows').show();
	} else {
		$('#noDataRows').show();
		$('#map').hide();
	}

};
Scavenger.prototype.initMap = function(){
	// TODO better way to bind scope
	var view = this;
	// map setup
	var map = new L.Map('map',{
		center: [40.7801201,-73.9543557],
		zoom: 2
	});

	L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
		}).addTo(map);

	var layers = "https://jue.cartodb.com/api/v2/viz/b887b6ec-4487-11e5-ad67-0e853d047bba/viz.json";

	cartodb.createLayer(map,layers)
		.addTo(map)
		.on('done',function(layer){

			var sublayer = layer.getSubLayer(0);

			sublayer.setSQL(view.layerOptions.query)
					.setCartoCSS(view.layerOptions.cartocss);

			sublayer.infowindow.set({
				template: $('#infowindow_template').html(),
				width:200
			});

			// TODO template legend for each team
			sublayer.legend.set({visible:false});
	});

	// position the map to the extent of the bounds
	this.sql.getBounds(this.layerOptions.query)
		.done(function(bounds){
			map.fitBounds(bounds);
		});
};