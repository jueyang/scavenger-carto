Scavenger = function(){
	this.team = $('#teamName');
	this.toMap = $('#toMap');
	this.toTable = $('#toTable');

	this.toMap.on('click',this.getTeamGrams.bind(this));
};

Scavenger.prototype.onKeyEnter = function(event){

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
		console.log('done');
	})

	event.preventDefault();
};