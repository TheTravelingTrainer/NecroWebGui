var map;
var path;
var playermarker;
var necro;
var cache = {};
cache.trainerProfile = null;
cache.pokemonList = null;
cache.itemsList = null;
cache.eggList = null;
var currentWaypointIndex = 0;
var itemsCache;
var waypointsLoaded = false;

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
		necro.RequestPokemon(function(data)
		{
			buildCurrentPokemonList(data);	
		});
		
		necro.RequestTrainerProfile(function(data)
		{
			cache.trainerProfile = data.Data;
			updatePlayerDetails(data);
		});
		
		necro.RequestItems(function(data) 
		{
			updateItemsDetails(data);	
		});
		
		necro.RequestEggs(function(data) 
		{
			updateEggDetails(data);	
		});
	};

	// The on*Updates are from Necro's push to all session information.
	necro.onPositionEvent = function(data)
	{
		playermarker.setPosition({lat: parseFloat(data.Latitude), lng: parseFloat(data.Longitude)});
		    map.panTo({
			  lat: parseFloat(data.Latitude),
			  lng: parseFloat(data.Longitude)
		});
			
		if(cache.trainerProfile != null)
		{
			if(path == null)
			{
				var keys = Object.keys(localStorage);
				var i = 0;
				var values = [];
				while ( i < keys.length  )
				{
					if(keys[i].startsWith("WP_"+ cache.trainerProfile.Profile.Username))
					{
						var name = keys[i].replace("WP_"+cache.trainerProfile.Profile.Username+"_","");
						values[name] = (JSON.parse(localStorage.getItem(keys[i])));
					}
					i++;
				}
						
				values.sort(function(a,b) {
					return a-b;
				});
				
				var basic = [];
				i = values.length;
				while ( i-- ) {
					basic.push(values[i]);
				
				}
				path = new google.maps.Polyline({
					map: map,
					path: basic,
					geodisc: true,
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 2
				  });
					
				currentWaypointIndex = values.length;
			}
			else
			{
				localStorage.setItem("WP_" + cache.trainerProfile.Profile.Username + "_" + currentWaypointIndex,JSON.stringify({lat: parseFloat(data.Latitude), lng: parseFloat(data.Longitude)})  );
				currentWaypointIndex++;
				var pth = path.getPath();
				pth.push(new google.maps.LatLng( parseFloat(data.Latitude),  parseFloat(data.Longitude)));
				path.setPath(pth);
			}
		}
	};
}

function buildCurrentPokemonList(listData)
{
	$('#pokemonlist').html("");
	$(listData.Data).each(function(i,v)
	{
		$('#pokemonlist').append("<div class='pokemon'><img src='" + "image/pokemon/" + pad_with_zeroes(v.Base.PokemonId, 3)  + ".png'/><br>" + v.Base.Cp + "/" + v.IvPerfection.toFixed(2) +  "</div>");
	});
}

function updatePlayerDetails(playerData)
{
	$('#playerDetailsArea').html("");
	var statsWanted = {};
	
	statsWanted['Level'] = playerData.Data.Stats.Level;
	statsWanted['Experience'] = playerData.Data.Stats.Experience;
	statsWanted['KmWalked'] = playerData.Data.Stats.KmWalked;
	statsWanted['PokemonsEncountered'] = playerData.Data.Stats.PokemonsEncountered;
	statsWanted['UniquePokedexEntries'] = playerData.Data.Stats.UniquePokedexEntries;	
	statsWanted['PokemonsCaptured'] = playerData.Data.Stats.PokemonsCaptured;	
	statsWanted['Evolutions'] = playerData.Data.Stats.Evolutions;
	statsWanted['PokeStopVisits'] = playerData.Data.Stats.PokeStopVisits;
	statsWanted['PokeballsThrown'] = playerData.Data.Stats.PokeballsThrown;
	statsWanted['EggsHatched'] = playerData.Data.Stats.EggsHatched;

	$.each(statsWanted,function(i,v)
	{
		var result =  $('<div class="statItem" />');
			result.append('<div class="statProperty">'+ i +':</div>');
			result.append('<div class="statValue">' + v+'</div>');
		$('#playerDetailsArea').append(result);
		
	});
}

function updateItemsDetails(data)
{
	$.each(data.Data, function(i,v){
		
		var result = 
		$('<div class="itemHolder" />')
			result.append('<div class="itemImage"><img src="./image/items/'+ v.ItemId +'.png" /></div>')
			result.append('<div class="itemStats">' + v.Count+ '</div>');	
		$('#itemsDetailsArea').append(result);			
	});	
}

function updateEggDetails(data)
{
	$('#eggsArea').html("");
	$.each(data.Data.Incubators, function(i,v){
		var left = v.TargetKmWalked - cache.trainerProfile.Stats.KmWalked;
		var total = v.TargetKmWalked - v.StartKmWalked;
		var type = 'EggIncubator';
		if(v.IncubatorType !=1)
			 type = 'EggIncubatorUnlimited';
		var result = 
		$('<div class="eggHolder" />')
			result.append('<div class="eggImage"><img src="./image/items/'+type+'.png" /></div>')
			result.append('<div class="eggStats">' + left.toFixed(2) + "/" + total.toFixed(2)+ '</div>');	
		$('#eggsArea').append(result);			
	});
	$.each(data.Data.UnusedEggs, function(i,v){
		var result = 
		$('<div class="eggHolder" />')
			result.append('<div class="eggImage"><img src="./image/items/301.png" /></div>')
			result.append('<div class="eggStats">' + v.EggKmWalkedTarget+ '</div>');	
		$('#eggsArea').append(result);			
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