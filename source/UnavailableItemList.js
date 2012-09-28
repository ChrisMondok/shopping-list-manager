enyo.kind({
	name:"ShoppingListManager.UnavailableItemList",
	kind:"Scroller",
	touch:true,
	published:{
		items:new Array(),
	},
	handlers:{
		onSelectAll:"selectAll",
	},
	components:[
		{name:"List", kind:enyo.Repeater, fit:true, onSetupItem: "setupItem", components:[
			{kind:"onyx.Item", tapHighlight:true, components:[
				{kind:"FittableColumns", fit:true, classes:"onyx-toolbar-inline", components:[
					{name:"ItemName", content:"No product", fit:true, classes:"itemName", ontap:"nameTapped"},
					{name:"CheckboxContainer", showing:true, components:[
						{name:"Checkbox", kind:onyx.Checkbox, onActivate:"checkChanged"},
					]},
				]},
			]},
		]},
		{kind:"Signals", onRequestUnavailableItems:"gotUnavailableItems"},
	],
	setupItem:function(inSender, inEvent)
	{
		var index = inEvent.index;
		var item = inEvent.item;
		item.$.ItemName.setContent(this.items[index].product);
		item.$.Checkbox.setChecked(this.items[index].unavailable);
		return true;
	},
	itemsChanged:function()
	{
		this.$.List.setCount(this.getItems().length);
	},
	selectAll:function()
	{
		THIS = this;
		var items = this.getItems();
		for(var i in items)
			items[i].unavailable = true;
		this.itemsChanged();
	},
});
