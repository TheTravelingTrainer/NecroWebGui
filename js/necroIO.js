
function NecroIO(address) 
{	
	var thisobject = this;
	
	this.webSocket = new WebSocket(address);
	this.webSocket.onopen = function()
	{
		thisobject.connected = true;
		thisobject.onconnected();
		console.log("Connected");	
	};
	
	this.webSocket.onmessage  = function(data) { 
		 thisobject.handleMessage(data);
	 };
};

NecroIO.prototype.callbacks = [];
NecroIO.prototype.webSocket = {};
NecroIO.prototype.connected = false;
NecroIO.prototype.onconnected = function() {};
NecroIO.prototype.onPositionUpdate = function() {};
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
			// update position push from server, we'll keep polling these.
				this.onPositionUpdate(result);
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
	this.sendMessage("GetItemList",{},callback);
}

function makeid()
{
    var text = "R_";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 14; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}