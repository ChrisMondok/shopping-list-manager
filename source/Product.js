enyo.kind({
	name:"ShoppingListManager.Product",
	published:
	{
		productName:"Unnamed product",
		lastPurchased:null,
		guid:null,
	},
	toString:function()
	{
		return this.getProductName();
	},
	serialize:function()
	{
		return {
			kind:this.kind,
			guid:this.getGuid(),
			productName:this.getProductName(),
			lastPurchased:this.getLastPurchased()?this.getLastPurchased().toString():null
		};
	},
	statics:
	{
		deserialize:function(serialized)
		{
			serialized.kind = serialized.kind || "ShoppingListManager.Product";
			if(serialized.lastPurchased)
				serialized.lastPurchased = new Date(serialized.lastPurchased);
			else
				serialized.lastPurchased = null;
			return enyo.create(serialized);
		},
	},
	create:function()
	{
		this.inherited(arguments);
		if(!this.getGuid())
			this.setGuid(ShoppingListManager.createGuid());
	}
});
