enyo.kind({
	name: "ShoppingListManager",
	fit: true,
	components:[
		{name: "Main", kind:"ShoppingListManager.Main"},
		{name: "LoadingPopup", kind:"onyx.Popup", style:"text-align:center", centered:true, floating:true, scrim:true, components:[
			{kind:"onyx.Spinner"},
			{content:"Loading items"},
		]},
	],
	classes:"onyx",
	events:
	{
		onLoadStart:"",
	},
	handlers:
	{
		onLoadStart:"handleLoadStart",
		onItemsLoaded:"handleLoadFinish"
	},
	create:function()
	{
		this.inherited(arguments);
		this.doLoadStart();
		enyo.asyncMethod(ShoppingListManager,ShoppingListManager.loadItemsFromStorage,this.waterfall.bind(this,"onItemsLoaded"));
	},
	handleLoadStart:function()
	{
		this.$.LoadingPopup.show();
	},
	handleLoadFinish:function()
	{
		this.$.LoadingPopup.hide();
	},
	statics:
	{
		createGuid:function()
		{
			var S4 = function()
			{
				return Math.floor((1+Math.random())*0x10000).toString(16).substring(1);
			}
			var guid = (S4() + S4() + "-"+S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
			return guid;
		},
		_allItems: [],
		getAllItems:function()
		{
			return this._allItems;
		},
		setAllItems:function(allItems)
		{
			this._allItems = allItems;
		},
		getItemCount:function()
		{
			debugger;
			var count = 0;
			var ai = this.getAllItems();
			for(var i in ai)
			{
				if(ai.hasOwnProperty(i))
					count++;
			}
			return count;
		},
		addItem:function(item)
		{
			this.getAllItems()[item.getGuid()] = item;
			this.saveAllItemsToStorage();
		},
		saveAllItemsToStorage:function()
		{
			var serialized = new Array();
			var allItems = this.getAllItems();
			for (var item in allItems)
				serialized.push(allItems[item].serialize());
			this.Storage.set("allItems",serialized);
		},
		loadItemsFromStorage:function(callback)
		{
			var loadedItems = this.Storage.get("allItems");
			if(loadedItems)
			{
				var deserializedItems = new Array();
				for (var item in loadedItems)
				{
					var di = this.Product.deserialize(loadedItems[item])
					deserializedItems[di.getGuid()] = di;
				}
				this._allItems = deserializedItems;
			}
			callback();
		},
		getItemByGuid:function(itemId)
		{
			return this.getAllItems()[itemId];
		},
		createItemWithName:function(itemName)
		{
			item = enyo.create({kind:"ShoppingListManager.Product",productName:itemName});
			this.addItem(item);
			return item;
		},
		getItemByName:function(name)
		{
			var items = this.getAllItems();
			for(var itemId in items)
				if(items[itemId].getProductName().toLowerCase() == name.toLowerCase())
					return items[itemId];
			return null;
		},
	}
});

