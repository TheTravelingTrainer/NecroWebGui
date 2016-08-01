
function NecroIO(address) 
{	
	var thisobject = this;
	
	this.webSocket = new WebSocket(address);
	this.webSocket.onopen = function()
	{
		thisobject.connected = true;
		thisobject.onconnected();
	};
	
	this.webSocket.onmessage  = function(data) { 
		 thisobject.handleMessage(data);
	 };
};

NecroIO.prototype.callbacks = [];
NecroIO.prototype.webSocket = {};
NecroIO.prototype.connected = false;
NecroIO.prototype.onconnected = function() {};
NecroIO.prototype.onPositionEvent = function() {};
NecroIO.prototype.unhandledEvent = function() {};
NecroIO.prototype.onPokeStopListEvent = function() {};
NecroIO.prototype.onPokeStopTargetEvent = function() {};
NecroIO.prototype.onPokeStopUsedEvent = function() {};
NecroIO.prototype.onPokemonCapturedEvent = function() {};
NecroIO.prototype.onPokemonCapturedEvent = function() {};
NecroIO.prototype.handleMessage = function(data)
{
		var result = JSON.parse(data.data);
		if(result.RequestID != null)
		{
			if(this.callbacks[result.RequestID] != null)
			{
				this.callbacks[result.RequestID](result);
				delete this.callbacks[result.RequestID];
			}
		}
		else if(result.$type.indexOf("Event.UpdatePositionEvent, ") > 0)
		{
			this.onPositionEvent(result);
		}
		else if(result.$type.indexOf("Event.PokeStopListEvent, ") > 0)
		{
			this.onPokeStopListEvent(result);
		}
		else if(result.$type.indexOf("Event.FortTargetEvent, ") > 0)
		{
			this.onPokeStopTargetEvent(result);
		}
		else if(result.$type.indexOf("Event.FortUsedEvent, ")> 0)
		{
			this.onPokeStopUsedEvent(result);
		}	
		else if(result.$type.indexOf("Event.PokemonCaptureEvent, ")> 0)
		{
			this.onPokemonCapturedEvent(result);
		}			
		else 
		{
			this.unhandledEvent(result);
		}	
	
}
NecroIO.prototype.sendMessage = function (command, data, callback) {
	
	var requestID = makeid();
	var dat = {"RequestID":requestID, "Command":command, "Data":data};
	this.webSocket.send(JSON.stringify(dat));
	this.callbacks[requestID] = callback;

}
NecroIO.prototype.RequestPokemon = function(callback)
{
	this.sendMessage("GetPokemonList",{},callback);
}
NecroIO.prototype.RequestEggs = function(callback)
{
	this.sendMessage("GetEggList",{},callback);
}
NecroIO.prototype.RequestItems = function(callback)
{
	this.sendMessage("GetItemsList",{},callback);
}
NecroIO.prototype.RequestTrainerProfile = function(callback)
{
	this.sendMessage("GetTrainerProfile",{},callback);
}


function makeid()
{
    var text = "R_";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 14; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}