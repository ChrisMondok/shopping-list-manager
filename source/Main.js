enyo.kind({
	name:"ShoppingListManager.Main",
	kind: "Control",
	classes: "enyo-fit",
	published:{
		suggestions: [],
		keyTimer:null,
	},
	handlers:{
		onCheckout:"showStorePopup",
		onLocationCancel:"hideStorePopup",
		onCartChanged:"cartChanged",
		onItemsChanged:"itemsChanged",
		onItemsLoaded:"updateProgress",
	},
	components:[
		{kind:"FittableRows", fit:true, classes:"enyo-fit",  components:[
			{kind:"FittableColumns", classes:"onyx-toolbar onyx-toolbar-inline", components:[
				{kind:onyx.InputDecorator, fit:true, components:[
					{kind:onyx.Input, name:"NewItem", placeholder:"New item", oninput:"filterInputChanged", fit:true},
				]},
				{kind:onyx.Button, classes:"onyx-affirmative", content:"Add", onclick:"addItem"} 
			]},
			{name:"Drawer", kind:"ResizableDrawer", classes:"suggestionsDrawer", open:false, components:[
				{name:"SuggestionsList", kind:enyo.Repeater, fit:true, onSetupItem: "renderSuggestions", components:[
					{kind:onyx.Item, onclick:"useSuggestion", components:[
						{name:"Suggestion"},
					]},
				]},
			]},
			{name:"DesiredItemsList", kind:"ShoppingListManager.ShoppingList", canAdd:true, canDelete:true, fit:true},
			{kind:"FittableColumns", classes:"onyx-toolbar onyx-toolbar-inline", components:[
				{fit:true, components:[
					{name:"Progress", kind:onyx.ProgressBar, animateStripes:false, showStripes:false },
				]},
				{kind:onyx.TooltipDecorator, components:[
					{kind:onyx.Button, content:"Check out", ontap:"doCheckout", classes:"onyx-blue"},
					{kind:onyx.Tooltip, content:"Remove items in cart from list"},
				]},
			]},
		]},
		{
			name:"StorePopup",
			kind:"onyx.Popup",
			centered:true,
			autoDismiss:false,
			modal:true,
			scrim:true,
			floating:true,
			style:"width:90%; height:90%;",
			classes:"shadowed-popup",
			components:[
				{name:"CheckoutHelper", kind:"ShoppingListManager.CheckoutHelper"},
			]
		},
	],
	rendered:function()
	{
		this.inherited(arguments);
		this.$.NewItem.focus();
	},
	doCheckout:function()
	{
		this.waterfall("onCheckout");
	},
	updateProgress:function()
	{
		var completed = this.$.DesiredItemsList.getItemsInCart().length;
		this.$.Progress.animateProgressTo(Math.floor((completed/this.$.DesiredItemsList.getItems().length)*100));
	},
	cartChanged:function()
	{
		this.updateProgress();
	},
	itemsChanged:function()
	{
		this.updateProgress();
	},
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
		this.$.DesiredItemsList.setItems(desiredItems);
	},
	create:function()
	{
		this.inherited(arguments);
	},
	filterInputChanged:function(input, event)
	{
		if(this.getKeyTimer())
			clearTimeout(this.getKeyTimer());
		//I'd use a future here, but enyo 2 doesn't have those?
		var t = setTimeout(this.updateSuggestions.bind(this),500);
		this.setKeyTimer(t);
	},
	updateSuggestions:function()
	{
		var unfiltered = [];
		var items = ShoppingListManager.getAllItems();
		var string = this.$.NewItem.getValue();
		for(var itemId in items)
			unfiltered.push(items[itemId]);
		var filter = function(item,index,array)
		{
			var name = item.getProductName().toLowerCase();
			return (name.indexOf(string.toLowerCase()) != -1 && name != string.toLowerCase());
		}
		this.setSuggestions(unfiltered.filter(filter,this));
	},
	suggestionsChanged:function()
	{
		if(this.getSuggestions().length && this.$.NewItem.getValue().length)
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
	addItem:function(inSender, inEvent)
	{
		var itemName = this.$.NewItem.getValue()
		var item = this.getOrCreateItemByName(itemName);
		this.$.NewItem.setValue("");
		this.updateSuggestions();
		this.$.DesiredItemsList.addItem(item);
	},
	getOrCreateItemByName:function(itemName)
	{
		var item = ShoppingListManager.getItemByName(itemName);
		if(item)
			return item;
		else
		{
			return ShoppingListManager.createItemWithName(itemName);
		}
	},
	useSuggestion:function(inSender,inEvent)
	{
		var index = inEvent.index;
		this.$.NewItem.setValue(this.getSuggestions()[index].getProductName());
		this.updateSuggestions();
	},
	showStorePopup:function(inSender,inEvent)
	{
		var itemsNotInCart = this.$.DesiredItemsList.getItemsNotInCart();
		var unavailableItems = new Array();
		for(var key in itemsNotInCart)
		{
			unavailableItems.push({
				product: itemsNotInCart[key],
				available:false
			});
		}
		this.$.StorePopup.show();
		this.$.CheckoutHelper.setUnavailableItems(unavailableItems);
	},
	hideStorePopup:function(inSender,inEvent)
	{
		this.$.StorePopup.hide();
	},

})
