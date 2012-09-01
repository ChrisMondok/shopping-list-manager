enyo.kind({
	name:"ShoppingListManager.Product",
	published:
	{
		productName:"Unnamed product",
		lastPurchased:null,
	},
	toString:function()
	{
		return this.getProductName();
	},
	serialize:function()
	{
		return {
			productName:this.productName,
			lastPurchased:this.lastPurchased
		};
	},
	statics:
	{
		deserialize:function(serialized)
		{
			return enyo.create({kind:"ShoppingListManager.Product",productName:serialized.productName,lastPurchased:serialized.productName});
		}
	},
});
