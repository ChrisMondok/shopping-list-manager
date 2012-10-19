enyo.kind({
	name:"ShoppingListManager.Main",
	kind: "Control",
	classes: "enyo-fit",
	published:{
		suggestions: [],
	},
	events:{
		onShowStorePopup:"",
		onCheckout:"",
	},
	handlers:{
		onShowStorePopup:"showStorePopup",
		onLocationCancel:"hideStorePopup",
		onCartChanged:"cartChanged",
		onItemsChanged:"itemsChanged",
		//onItemsLoaded:"updateProgress",
		onListLoaded:"updateProgress",
		onCommitCheckout:"commitCheckout",
		onCancelCheckout:"cancelCheckout"
	},
	components:[
		{kind:"FittableRows", fit:true, classes:"enyo-fit",  components:[
			{kind:"onyx.MoreToolbar", components:[
				{kind:onyx.InputDecorator, fit:true, components:[
					{kind:onyx.Input, name:"NewItem", placeholder:"New item", oninput:"filterInputChanged", fit:true},
				]},
				{kind:onyx.Button, classes:"onyx-affirmative", content:"Add", onclick:"addItem"} ,
				{kind:"onyx.MenuDecorator", components:[
					{content:"Menu"},
					{kind:"onyx.Menu", components:[
						{content:"Set location"},
						{name:"sortDrawer", kind:"onyx.SubMenu", content:"Sort by", open:false, components:[
							{kind:"onyx.MenuItem", content:"Default"},
							{kind:"onyx.MenuItem", content:"Name"},
							{kind:"onyx.MenuItem", content:"Status"},
							{kind:"onyx.MenuItem", content:"Last purchased"},
						]},
					]},
				]},
			]},
			{name:"Drawer", kind:"ResizableDrawer", classes:" recessed", open:false, components:[
				{name:"SuggestionsList", kind:enyo.Repeater, classes:"suggestionsList", fit:true, onSetupItem: "renderSuggestions", components:[
					{kind:onyx.Item, onclick:"useSuggestion", components:[
						{name:"Suggestion"},
					]},
				]},
			]},
			{name:"DesiredItemsList", kind:"ShoppingListManager.ShoppingList", canAdd:true, canDelete:true, classes:"recessed", fit:true},
			{kind:"onyx.MoreToolbar", components:[
				{name:"Progress", fit:true, kind:"ShoppingListManager.CheckoutButton", ontap:"doShowStorePopup", animateStripes:false, showStripes:false, components:[
					{content:"Check out", style:"float:right"},
				]},
			]},
		]},
		{
			name:"StorePopup",
			kind:"onyx.Popup",
			centered:true,
			modal:true,
			scrim:true,
			floating:true,
			style:"width:90%; height:90%;",
			classes:"shadowed-popup",
			onShow:"addCheckoutHelper",
			onHide:"removeCheckoutHelper",
			components:[
				{name:"CheckoutHelper", kind:"ShoppingListManager.CheckoutHelper"},
			]
		},
	],
	rendered:function()
	{
		this.inherited(arguments);
		window.MAIN = this;
	},
	sortMethodSelected:function(inSender,inEvent)
	{
		this.$.DesiredItemsList.setSortMethod(inEvent.selected.getContent())
	},
	commitCheckout:function()
	{
		this.waterfall("onCheckout");
		this.$.StorePopup.hide();
	},
	cancelCheckout:function()
	{
		this.$.StorePopup.hide();
	},
	updateProgress:function()
	{
		var completed = this.$.DesiredItemsList.getItemsInCart().length;
		if(this.$.DesiredItemsList.getItems().length)
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
	create:function()
	{
		this.inherited(arguments);
	},
	filterInputChanged:function(input, event)
	{
		enyo.job("updateSuggestions",enyo.bind(this,"updateSuggestions"),750);
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
		this.$.StorePopup.show();
		this.$.CheckoutHelper.setList(this.$.DesiredItemsList);
	},
	hideStorePopup:function(inSender,inEvent)
	{
		this.$.StorePopup.hide();
	},

})
