enyo.kind({
	name:"ShoppingListManager.Main",
	kind: "FittableRows",
	classes: "enyo-fit",
	published:{
		allItems: [],
		suggestions: [],
		filterString: "",
		keyTimer:null,
	},
	components:[
		{kind:"FittableColumns", classes:"onyx-toolbar-inline", components:[
			{kind:onyx.InputDecorator, fit:true, components:[
				{kind:onyx.Input, name:"NewItem", placeholder:"New item", oninput:"filterInputChanged", fit:true},
			]},
			{kind:onyx.Button, classes:"onyx-affirmative", content:"Add", onclick:"userAddItem"} 
		]},
		{name:"Drawer", kind:"ResizableDrawer", classes:"suggestionsDrawer", open:true, components:[
			{name:"SuggestionsList", kind:enyo.Repeater, fit:true, onSetupItem: "renderSuggestions", components:[
				{kind:onyx.Item, onclick:"useSuggestion", components:[
					{name:"Suggestion"},
				]},
			]},
		]},
		{name:"ItemList", kind:"ShoppingListManager.ShoppingList", canAdd:true, canDelete:true, fit:true},
	],
	createSampleData:function()
	{
		var itemNames = ["Cereal", "Bananas", "Milk", "Eggs", "Butter", "Bread", "Hamburgers", "Orange Juice", "Cheddar Cheese", "Ham"];
		var desiredItems = [];
		var createdItems = []
		for(var i = 0; i < itemNames.length; i++)
		{
			createdItems.push(enyo.create({kind:"ShoppingListManager.Product",productName:itemNames[i]}));
			this.addItem(createdItems[i]);
			if(Math.random() > 0.5)
				desiredItems.push(enyo.create({kind:"ShoppingListManager.DesiredProduct",product:createdItems[i]}));
		}
		this.$.ItemList.setItems(desiredItems);
	},
	rendered:function()
	{
		this.inherited(arguments);
		this.loadItemsFromStorage();
		if(this.getItemCount() == 0)
			if(confirm("Create sample items?"))
				this.createSampleData();
		THIS = this;
	},
	create:function()
	{
		this.inherited(arguments);
	},
	saveAllItemsToStorage:function()
	{
		var serialized = new Array();
		for (var item in this.allItems)
			serialized.push(this.allItems[item].serialize());
		ShoppingListManager.Storage.set("allItems",serialized);
	},
	loadItemsFromStorage:function()
	{
		var loadedItems = ShoppingListManager.Storage.get("allItems");
		if(loadedItems)
		{
			var deserializedItems = new Array();
			for (var item in loadedItems)
			{
				var di = ShoppingListManager.Product.deserialize(loadedItems[item])
				deserializedItems[di.getGuid()] = di;
			}
			this.setAllItems(deserializedItems);
		}
	},
	allItemsChanged:function()
	{
		this.resetSuggestions();
		this.saveAllItemsToStorage();
	},
	resetSuggestions:function()
	{
		console.log("Suggestions reset");
		var suggestions = new Array();
		var items = this.getAllItems();
		for(var itemId in items)
			suggestions.push(items[itemId]);
		this.setSuggestions(suggestions);
	},
	filterInputChanged:function(input, event)
	{
		if(this.getKeyTimer())
			clearTimeout(this.getKeyTimer());
		//I'd use a future here, but enyo 2 doesn't have those?
		var t = setTimeout(function(){this.setFilterString(input.getValue())}.bind(this),500);
		this.setKeyTimer(t);
	},
	setFilterString:function(string)
	{
		var needReset = false;
		var filter = function(item,index,array)
		{
			var name = item.getProductName().toLowerCase();
			return (name.indexOf(string.toLowerCase()) != -1 && name != string.toLowerCase());
		}

		if(string.indexOf(this.getFilterString()) != 0)
			needReset = true;

		console.log("Setting filter string to \""+string+"\"");
		this.filterString = string;
		if(string.length && !needReset)
		{
			var suggestions = this.getSuggestions();
			suggestions = suggestions.filter(filter,this);
			this.setSuggestions(suggestions);
		}
		else
			this.resetSuggestions();
	},
	suggestionsChanged:function()
	{
		console.log("Suggestions changed, string length is "+this.getFilterString().length);
		if(this.getSuggestions().length && this.getFilterString().length)
		{
			this.$.SuggestionsList.setCount(Math.min(5,this.getSuggestions().length));
			this.$.Drawer.setOpen(true);
			this.$.Drawer.resize();
		}
		else
		{
			this.$.Drawer.setOpen(false);
		}
	},
	renderSuggestions:function(inSender, inEvent)
	{
		var row = inEvent.item;
		var index = inEvent.index;
		var item = this.getSuggestions()[index];
		row.$.Suggestion.setContent(item.getProductName());
		return true;
	},
	addItem:function(item)
	{
		this.allItems[item.getGuid()] = item;
		this.allItemsChanged();
	},
	userAddItem:function(inSender, inEvent)
	{
		var itemName = this.$.NewItem.getValue()
		var item = this.getOrCreateItemByName(itemName);
		this.$.NewItem.setValue("");
		this.setFilterString("");
		this.$.ItemList.addItem(item);
	},
	getOrCreateItemByName:function(itemName)
	{
		var item = this.getItemByName(itemName);
		if(item)
			return item;
		else
		{
			return this.createItemWithName(itemName);
		}
	},
	createItemWithName:function(itemName)
	{
		item = enyo.create({kind:"ShoppingListManager.Product",productName:itemName});
		this.addItem(item);
		return item;
	},
	getItemById:function(itemId)
	{
		return this.allItems[itemId];
	},
	getItemByName:function(name)
	{
		var items = this.getAllItems();
		for(var itemId in items)
			if(items[itemId].getProductName().toLowerCase() == name.toLowerCase())
				return items[itemId];
		return null;
	},
	getItemCount:function()
	{
		var count = 0;
		var ai = this.getAllItems();
		for(var i in ai)
		{
			if(ai.hasOwnProperty(i))
				count++;
		}
		return count;
	},
	useSuggestion:function(inSender,inEvent)
	{
		var index = inEvent.index;
		this.$.NewItem.setValue(this.getSuggestions()[index].getProductName());
		this.setFilterString(this.getSuggestions()[index].getProductName());
	}
})
