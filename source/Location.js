enyo.kind({
	name:"ShoppingListManager.Location",
	published:
	{
		latitude:null,
		longitude:null, 
		locationName:null,
		available:null,
		unavailable:null,
	},
	create:function()
	{
		this.inherited(arguments);
		if(!this.getAvailable())
			this.setAvailable(new Array());
		if(!this.getUnavailable())
			this.setUnavailable(new Array());
	},
	serialize:function()
	{
		return {
			kind:this.kind,
			latitude:this.getLatitude(),
			longitude:this.getLongitude(),
			locationName:this.getLocationName(),
		};
	},
	statics:
	{
		getDistanceBetween:function(pointA,pointB)
		//uses the Haversine formula
		{
			var R = 6371; // km
			var dLat = (pointB.getLatitude() - pointA.getLatitude()).toRad();
			var dLon = (pointB.getLongitude() - pointA.getLongitude()).toRad();
			var lat1 = pointA.getLatitude().toRad();
			var lat2 = pointB.getLatitude().toRad();

			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			return R * c;
		},
		deserialize:function(serialized)
		{
			return enyo.create(serialized);
		}
	},
});
