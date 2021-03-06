enyo.kind({
	name:"ShoppingListManager.CheckoutHelper",
	kind:"FittableRows",
	classes:"enyo-fit",
	published:{
		pendingLocation:"",
		currentLocation:null,
		selectedRow:null,
		list:null,
	},
	events:{
		onCommitCheckout:"",
		onCancelCheckout:"",
	},
	handlers:{
		onItemsLoaded:"locationsChanged",
	},
	components:[
		{name:"Panels", kind:"Panels", fit:true, draggable:false, realtimeFit:true, arrangerKind:"CollapsingArranger", components:[	
			{kind:"FittableRows", style:"width:320px", classes:"onyx", components:[
				{kind:"onyx.Toolbar", components:[
					{content:"Where are you?", style:"font-size:1rem;"},
				]},
				{kind:enyo.Scroller, fit:true, touch:true, components:[
					{name:"storeList", kind:enyo.Repeater, onSetupItem:"setupItem", components:[
						{kind:onyx.Item, tapHighlight:true,  content:"store", ontap:"pickStore"},
					]},
					{name:"addStoreDrawer", kind:"onyx.Drawer", open:false, components:[
						{style:"background-color:rgba(0,0,0,0.1)", components:[
							{kind:"onyx.InputDecorator", style:"width:100%", components:[
								{name:"storeNameInput", kind:"onyx.Input", style:"width:100%", onchange:"storeNameInputChanged", placeholder:"Store name"},
							]},
						]},
						{name:"getLocationDrawer", kind:"onyx.Drawer", open:false, components:[
							{content:"Getting location..."},
						]},
					]},
					{name:"addStoreButton", kind:onyx.Item, content:"Add a store", ontap:"addStoreTap"},
				]},
				{kind:"onyx.Button", content:"Just check out", classes:"rowbutton", ontap:"doCommitCheckout"},
				{kind:"onyx.Button", content:"Cancel", classes:"onyx-negative rowbutton", ontap:"doCancelCheckout"},
			]},
			{kind:"FittableRows", disabled:true, style:"height:100%;", classes:"onyx", components:[
				{kind:"onyx.Toolbar", components:[
					{content:"Which items are not sold here?", style:"font-size:1rem;"},
				]},
				{name:"unavailableItemsList", kind:"ShoppingListManager.UnavailableItemList", fit:true},
				{kind:"onyx.MoreToolbar", components:[
					{kind:"onyx.Grabber", ontap:"panelToggle"},
					{fit:true},
					{kind:"onyx.Button", content:"Select all", ontap:"selectAll", showing:false},
					{name:"DoneButton", kind:"onyx.Button", content:"Check out here", disabled:true, classes:"onyx-affirmative", ontap:"processCheckout" },
				]},
			]},
		]},
	],
	listChanged:function()
	{
		var itemsNotInCart = this.getList().getItemsNotInCart();
		var unavailableItems = new Array();
		for(var key in itemsNotInCart)
		{
			unavailableItems.push({
				product: itemsNotInCart[key],
				unavailable:false
			});
		}
		this.$.unavailableItemsList.setItems(unavailableItems);
	},
	gotLocation:function(loc)
	{
		var coords = loc.coords;
		this.setPendingLocation(coords);
		this.$.getLocationDrawer.setOpen(false);
	},
	addStoreTap:function(inSender,inEvent)
	{
		if(this.$.addStoreDrawer.getOpen())
		{
			this.$.addStoreDrawer.setOpen(false);
			this.$.addStoreButton.show();
		}
		else
		{
			this.$.addStoreButton.hide();
			this.$.addStoreDrawer.setOpen(true);
			this.$.getLocationDrawer.setOpen(true);
			navigator.geolocation.getCurrentPosition(this.gotLocation.bind(this));
		}
	}, 
	focusInput:function()
	{
		this.$.storeNameInput.focus();
	},
	locationsChanged:function()
	{
		this.$.storeList.setCount(ShoppingListManager.getLocations().length);
	},
	setupItem:function(inSender,inEvent)
	{
		var index = inEvent.index;
		var row = inEvent.item;
		var stores = ShoppingListManager.getLocations();
		row.$.item.setContent(stores[index].getLocationName());
		if(stores[index] == this.getCurrentLocation())
			this.setSelectedRow(row.$.item);
		return true;
	},
	hideAddStorePopup:function()
	{
		this.$.AddStorePopup.hide();
	},
	panelToggle:function()
	{
		if(this.$.Panels.getIndex())
			this.$.Panels.previous();
		else
		{
			if(this.getCurrentLocation())
				this.$.Panels.next();
		}
	},
	back:function()
	{
		if(this.$.Panels.getIndex())
			this.panelBack();
		else
			this.bubble("onLocationCancel");
	},
	storeNameInputChanged:function()
	{
		this.tryCommitNewStore();
	},
	pendingLocationChanged:function()
	{
		this.tryCommitNewStore();
	},
	tryCommitNewStore:function()
	{
		var coords = this.getPendingLocation();
		var name = this.$.storeNameInput.getValue();
		if(coords && name)
		{
			var newLocation = this.createComponent(
				{
					kind:"ShoppingListManager.Location",
					locationName:name,
					latitude:coords.latitude,
					longitude:coords.longitude
				});
			ShoppingListManager.addLocation(newLocation);
			this.setPendingLocation(null);
			this.$.storeNameInput.setValue("");
			this.setCurrentLocation(newLocation);
			this.locationsChanged();
			this.$.addStoreButton.show();
			this.$.addStoreDrawer.setOpen(false);
		}
	},
	pickStore:function(inSender,inEvent)
	{
		var stores = ShoppingListManager.getLocations();
		if(stores[inEvent.index] == this.getCurrentLocation())
			this.currentLocationChanged();
		else
		{
			this.setCurrentLocation(stores[inEvent.index]);
			this.setSelectedRow(inSender);
		}
	},
	currentLocationChanged:function()
	{
		if(this.getCurrentLocation())
		{
			this.$.Panels.setDraggable(true);
			this.$.DoneButton.setDisabled(false);
			this.$.Panels.setIndex(1);
		}
		else
		{
			this.$.Panels.setDraggable(false);
			this.$.DoneButton.setDisabled(true);
		}
	},
	selectedRowChanged:function(previousRow)
	{
		if(previousRow)
			previousRow.removeClass("selected");
		this.getSelectedRow().addClass("selected");
	},
	selectAll:function()
	{
		this.waterfall("onSelectAll");
	},
	processCheckout:function()
	{
		if(this.$.DoneButton.getDisabled())
			return;
		//mark unavailable items
		//mark available items
		this.doCommitCheckout();
	},
});
