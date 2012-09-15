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
	inCartChanged:function()
	{
		this.bubble("onCartChanged");
		this.getOwner().doCartChanged();
	},
	create:function()
	{
		this.inherited(arguments);
		DI = this;
	},
	statics:
	{
		deserialize:function(serialized)
		{
			serialized.kind = "ShoppingListManager.DesiredProduct";
			serialized.product = ShoppingListManager.getItemByGuid(serialized.productGuid);
			delete serialized.productGuid;
			return enyo.create(serialized);
		},
	},
});
