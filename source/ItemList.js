enyo.kind({
	name:"ShoppingListManager.ShoppingList",
	kind:"FittableRows",
	published:{
		items:new Array(),
		listKind:"ShoppingListManager.ProductDisplay",
	},
	events:{
		onCartChanged:"",
	},
	handlers:{
		onCartChanged:"handleCartChanged",
	},
	components:[
		{name:"Scroller", kind:enyo.Scroller, fit:true, touch:true, components:[
			{name:"List", kind:enyo.Repeater, fit:true, onSetupItem: "setupItem", components:[
				{kind:onyx.Item, components:[
					{kind:"FittableColumns", classes:"onyx-toolbar-inline", components:[
						{name:"ItemName", content:"No product", fit:true, classes:"itemName"},
						{name:"Details", content:"", classes:"itemDetails"},
						{name:"CheckboxContainer", showing:true, components:[
							{name:"Checkbox", kind:onyx.Checkbox, onActivate:"checkChanged"},
						]},
					]},
				]},
			]},
		]},
		{kind:onyx.Groupbox, components:[
			{kind:"FittableColumns", classes:"onyx-toolbar-inline", components:[
				{fit:true, components:[
					{name:"Progress", kind:onyx.ProgressBar, animateStripes:true, barClasses:"onyx-dark"},
				]},
				{kind:onyx.TooltipDecorator, components:[
					{kind:onyx.Button, content:"Check out", onclick:"checkout"},
					{kind:onyx.Tooltip, content:"Remove items in cart from list"},
				]},
			]},
		]},
	],
	setupItem:function(inSender, inEvent)
	{
		var index = inEvent.index;
		var item = inEvent.item;
		item.$.ItemName.setContent(this.items[index].getProduct());
		return true;
	},
	saveList:function()
	{
		var serialized = new Array();
		var items = this.getItems();
		for (var item in items)
			serialized.push(items[item].serialize());
		ShoppingListManager.Storage.set("list:"+this.getName(),serialized);
	},
	rendered:function()
	{
		this.inherited(arguments);
	},
	itemsChanged:function()
	{
		this.$.List.setCount(this.items.length);
	},
	checkChanged:function(checkbox,event)
	{
		this.items[event.index].setInCart(checkbox.getChecked());
		this.doCartChanged();
	},
	drawer:function()
	{
		this.$.drawer.setOpen(!this.$.drawer.getOpen());
	},
	handleCartChanged:function()
	{
		var completed = 0;
		for(var i = 0; i < this.items.length; i++)
		{
			if(this.items[i].getInCart())
				completed++;
		}
		this.$.Progress.animateProgressTo(Math.floor((completed/this.items.length)*100));
	},
	getItemsInCart:function()
	{
		var checkedItems = new Array();
		for(var i = 0; i < this.items.length; i++)
			if(this.items[i].getInCart())
				checkedItems.push(this.items[i]);
		return checkedItems;
	},
	addItem:function(newItem)
	{
		var name = newItem.getProductName();
		var item = this.getItemByName(name)
		var desiredItem = null;
		if(!item)
		{
			item = enyo.create({kind:"ShoppingListManager.DesiredProduct", product:newItem});
			this.items.unshift(item);
			this.itemsChanged();
		}
		//Scroll to reveal item
		var itemIndex = this.getItemIndex(item);
		if(itemIndex != -1)
		{
			var ln = this.$.List.hasNode();
			var ih = ln.offsetHeight;
			this.$.Scroller.scrollTo(0,(ih/this.items.length) * itemIndex)
		}
		this.saveList();
	},
	checkout:function()
	{
		var inCart = this.getItemsInCart();
		this.promptAddItemsToStore(inCart);
	},
	promptAddItemsToStore:function(items)
	{

	},
	getItemByName:function(name)
	{
		var items = this.getItems();
		for(itemId in items)
			if(items[itemId].getProduct().getProductName().toLowerCase() == name.toLowerCase())
				return items[itemId];
		return null;
	},
	getItemIndex:function(item)
	{
		for(var i = 0; i < this.items.length; i++)
			if(this.items[i] == item)
				return i;
		return -1;
	}
});

