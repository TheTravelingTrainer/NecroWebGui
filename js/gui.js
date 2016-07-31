var map;
var playermarker;
var necro;
var numTrainers = [
  177, 
  109
];
var teams = [
  'TeamLess',
  'Mystic',
  'Valor',
  'Instinct'
];
var trainerSex = [
  'm',
  'f'
];

	
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 0, lng: 0},
		zoom: 8
	});
	  
	var randomSex = Math.floor(Math.random() * 1);
	
	playermarker = new google.maps.Marker({
		  map: map,
		  position: {lat: parseFloat(0), lng: parseFloat(0)},
		  icon: 'image/trainer/' + trainerSex[randomSex] + Math.floor(Math.random() * numTrainers[randomSex]) + '.png',
		  zIndex: 2,
		  label: "me"
	});
		
	necro = new NecroIO("wss://localhost:14251");
	
	necro.onconnected = function()
	{
		
		// Request specific data into a call back
		necro.RequestPokemon(function(data){
			
			buildCurrentPokemonList(data);
			
		});
		
		necro.RequestTrainerProfile(function(data)
		{
			
				
		});
	};

	// The on*Updates are from Necro's push to all session information.
	necro.onPositionUpdate = function(data)
	{
		playermarker.setPosition({lat: parseFloat(data.Latitude), lng: parseFloat(data.Longitude)});
		    map.panTo({
			  lat: parseFloat(data.Latitude),
			  lng: parseFloat(data.Longitude)
			});
	};
}

$(document).ready(function() 
{
	var MenuOpen =  false;
	$('#drag').on('mousedown', function(e){
			var $dragable = $(this).parent(),
				startHeight = $dragable.height(),
				pY = e.pageY;
			
			$(document).on('mouseup', function(e){
				$(document).off('mouseup').off('mousemove');
			});
			$(document).on('mousemove', function(me){
				var my = (me.pageY- pY);
				$dragable.css({
					height:startHeight - my
				});
			});			
	});
	
	$('#toggleMenuButton').click(function()
	{
		if(!MenuOpen)
		{
			$('#pokelistholder').animate({
				height: "85%"
			  }, 200, function() {
				MenuOpen= true;
			});
		}
		else
		{
			$('#pokelistholder').animate({
				height: "3%"
			  }, 200, function() {
				 MenuOpen= false;
			});
		}
	});
});

function buildCurrentPokemonList(listData)
{
	$('#pokemonlist').html("");
	$(listData.Data).each(function(i,v)
	{
		$('#pokemonlist').append("<div class='pokemon'><img src='" + "image/pokemon/" + pad_with_zeroes(v.Base.PokemonId, 3)  + ".png'/><br>" + v.Base.Cp + "/" + v.IvPerfection.toFixed(2) +  "</div>");
	});
}

function pad_with_zeroes(number, length) {
  var my_string = '' + number;
  while (my_string.length < length) {
      my_string = '0' + my_string;
  }
  return my_string;
}


function loadScript(src) {
  var element = document.createElement("script");
  element.src = src;
  document.body.appendChild(element);
}