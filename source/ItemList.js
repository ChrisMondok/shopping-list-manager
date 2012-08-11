enyo.kind({
	name:"ShoppingListManager.ShoppingList",
	kind:"FittableRows",
	published:{
		items:new Array(),
		canAdd:true,
		canDelete:true,
		listKind:"ShoppingListManager.ProductDisplay",
	},
	events:{
		onCartChanged:"",
	},
	handlers:{
		onCartChanged:"handleCartChanged",
	},
	components:[
		{kind:"FittableColumns", classes:"onyx-toolbar-inline", components:[
			{name:"Progress", kind:onyx.ProgressBar, style:"height:0.5em", animateStripes:false, showStripes:false, fit:true},
			{kind:onyx.Button, content:"Check out"},
		]},
		{name:"Scroller", kind:enyo.Scroller, fit:true, touch:true, components:[
			{name:"List", kind:enyo.Repeater, fit:true, onSetupItem: "setupItem", components:[
				{kind:onyx.Item, components:[
					{kind:"FittableColumns", classes:"onyx-toolbar-inline", components:[
						{name:"ItemName", content:"No product", fit:true, classes:"itemName"},
						{name:"Details", content:"Details", classes:"itemDetails"},
						{name:"CheckboxContainer", showing:true, components:[
							{name:"Checkbox", kind:onyx.Checkbox, onActivate:"checkChanged"},
						]},
					]},
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
	addItem:function(newItem)
	{
		var name = newItem.getProductName();
		var item = this.getItemByName(name)
		var desiredItem = null;
		if(!item)
		{
			item = enyo.create({kind:"ShoppingListManager.DesiredProduct", product:newItem});
			this.items.push(item);
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
	},
	getItemByName:function(name)
	{
		var items = this.getItems();
		for(var i = 0; i < items.length; i++)
			if(items[i].getProduct().getProductName().toLowerCase() == name.toLowerCase())
				return items[i];
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

