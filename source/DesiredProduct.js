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
	create:function()
	{
		this.inherited(arguments);
		DI = this;
	},
	inCartChanged:function()
	{
		this.inherited(arguments);
		this.owner.bubble("onCartChanged"); //yeah, this is awful, I know, but bubble doesn't work from here, since it's not a component.
	}
});
