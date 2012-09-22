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
			lastPurchased:this.getLastPurchased()
		};
	},
	statics:
	{
		deserialize:function(serialized)
		{
			serialized.kind = serialized.kind || "ShoppingListManager.Product";
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
