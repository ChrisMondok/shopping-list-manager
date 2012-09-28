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
	events:{
		onCartChanged:"",
	},
	create:function()
	{
		this.inherited(arguments);
		DI = this;
	},
	inCartChanged:function()
	{
		this.doCartChanged();
	}
});
