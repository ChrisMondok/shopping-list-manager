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
				{kind:onyx.Input, name:"NewItem", placeholder:"New item", onkeyup:"filterInputChanged", fit:true},
			]},
			{kind:onyx.Button, classes:"onyx-affirmative", content:"Add", onclick:"addItem"} 
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
		for(var i = 0; i < itemNames.length; i++)
		{
			this.allItems.push(enyo.create({kind:"ShoppingListManager.Product",productName:itemNames[i]}));
			if(Math.random() > 0.5)
				desiredItems.push(enyo.create({kind:"ShoppingListManager.DesiredProduct",product:this.allItems[i]}));
		}
		this.allItemsChanged();
		this.$.ItemList.setItems(desiredItems);
	},
	rendered:function()
	{
		this.inherited(arguments);
		this.createSampleData();
		THIS = this;
		if(enyo.platform.webos)
			window.PalmSystem.stageReady();
	},
	create:function()
	{
		this.inherited(arguments);
	},
	allItemsChanged:function()
	{
		this.resetSuggestions();
	},
	resetSuggestions:function()
	{
		var suggestions = new Array();
		var items = this.getAllItems();
		for(var i = 0; i < items.length; i++)
			suggestions.push(items[i]);
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
		var filter = function(item,index,array)
		{
			var name = item.getProductName().toLowerCase();
			return (name.indexOf(string.toLowerCase()) != -1 && name != string.toLowerCase());
		}

		if(string.indexOf(this.filterString) != 0)
			this.resetSuggestions();

		this.filterString = string;
		if(string.length)
		{
			var suggestions = this.getSuggestions();
			suggestions = suggestions.filter(filter,this);
			this.setSuggestions(suggestions);
		}
	},
	suggestionsChanged:function()
	{
		if(this.getSuggestions().length < this.getAllItems().length)
		{
			this.$.SuggestionsList.setCount(Math.min(5,this.getSuggestions().length));
			this.$.Drawer.setOpen(true);
			this.$.Drawer.resize();
		}
		else
		{
			this.$.Drawer.setOpen(false);
			this.$.SuggestionsList.setCount(0);
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
	addItem:function(inSender, inEvent)
	{
		var createProduct = function(item)
		{
			item = enyo.create({kind:"ShoppingListManager.Product",productName:this.$.NewItem.getValue()});
			this.allItems.unshift(item);
			this.allItemsChanged();
		}
		var found = false;
		var item = this.getItemByName(this.$.NewItem.getValue());
		if(!item)
			createProduct(item);
		this.$.NewItem.setValue("");
		this.setFilterString("");
		this.$.ItemList.addItem(item);

	},
	getItemByName:function(name)
	{
		var items = this.getAllItems();
		for(var i = 0; i < items.length; i++)
			if(items[i].getProductName().toLowerCase() == name.toLowerCase())
				return items[i];
		return null;
	},
	useSuggestion:function(inSender,inEvent)
	{
		var index = inEvent.index;
		this.$.NewItem.setValue(this.getSuggestions()[index].getProductName());
		this.setFilterString(this.getSuggestions()[index].getProductName());
	}
})
