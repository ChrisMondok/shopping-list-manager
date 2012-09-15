enyo.kind({
	name:"ShoppingListManager.DesiredProduct",
	published:{
		product:null,
		note: "",
		inCart:false,
	},
	serialize:function()
	{
		return {
			productGuid:this.getProduct().getGuid(),
			note:this.getNote(),
			inCart:this.getInCart()
		};
	},
	statics:
	{
		deserialize:function(serialized,main)
		{
			serialized.kind = "ShoppingListManager.DesiredProduct";
			serialized.product = main.getItemByGuid(serialized.productGuid);
			delete serialized.productGuid;
			return enyo.create(serialized);
		},
	},
});
