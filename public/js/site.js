Scavenger = function(){
	this.team = $('#teamName');
	this.toMap = $('#toMap');
	this.toTable = $('#toTable');

	this.toMap.on('click',this.getTeamGrams.bind(this));
};

Scavenger.prototype.onKeyEnter = function(event){
	// TODO bind getTeamGrams to enter
};

Scavenger.prototype.getTeamGrams = function(event){
	// get user input from form
	var teamInput = this.team.val().trim();

	$.ajax({
		url: '/team/' + teamInput,
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

Scavenger.prototype.createTeamMap = function(team){
  var map = new L.Map('map', {
    center: [40.7801201,-73.9543557],
    zoom: 2
    // minZoom:11,
    // maxZoom:14
  });

  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
  }).addTo(map);

  var layers = {
    user_name:'jue',
    type: 'cartodb',
    sublayers: [{
        sql: "SELECT * FROM scavenger_carto WHERE team_name ='" + team + "'",
        cartocss: '#scavenger_carto {marker-line-width:0; marker-fill: #FDA330;}',
        interactivity: "ig_thumbnail, team_name"
      }]
  };

  // https://github.com/CartoDB/cartodb.js/blob/develop/examples/custom_infowindow.html
  cartodb.createLayer(map,layers)
    .addTo(map)
    .on('done',function(layer){
      var sublayer = layer.getSubLayer(0);

      cdb.vis.Vis.addInfowindow(map, sublayer, ['ig_thumbnail', 'team_name'], {
        infowindowTemplate: $('#infowindow_template').html()
      });
      sublayer.setInteraction(true);
  });
};