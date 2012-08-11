enyo.kind({
	name:"ShoppingListManager.Product",
	published:{
		productName:"Unnamed product",
		lastPurchased:null,
	},
	toString:function()
	{
		return this.getProductName();
	}
});
