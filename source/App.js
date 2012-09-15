enyo.kind({
	name: "App",
	fit: true,
	components:[
		{name: "Main", kind:"ShoppingListManager.Main"},
	],
	statics:{
		createGuid:function()
		{
			var S4 = function()
			{
				return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
			}
			var guid = (S4() + S4() + "-"+S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
			return guid;
		}
	}
});

