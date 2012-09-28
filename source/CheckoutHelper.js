enyo.kind({
	name:"ShoppingListManager.CheckoutHelper",
	kind:"FittableRows",
	classes:"enyo-fit",
	published:{
		pendingName:"",
		pendingLocation:"",
		currentLocation:null,
		inCart:new Array(),
		selectedRow:null,
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
			{kind:"FittableRows", style:"max-width:320px", classes:"onyx", components:[
				{kind:"onyx.Toolbar", components:[
					{content:"Where are you?", style:"font-size:1rem;"},
				]},
				{kind:enyo.Scroller, fit:true, touch:true, components:[
					{name:"storeList", kind:enyo.Repeater, onSetupItem:"setupItem", components:[
						{kind:onyx.Item, tapHighlight:true,  content:"store", ontap:"pickStore"},
					]},
				]},
				{kind:"onyx.Button", content:"Add a store", classes:"onyx-affirmative rowbutton", ontap:"addStoreTap"},
				{kind:"onyx.Button", content:"Just check out", classes:"rowbutton", ontap:"doCommitCheckout"},
				{kind:"onyx.Button", content:"Cancel", classes:"onyx-negative rowbutton", ontap:"doCancelCheckout"},
			]},
			{kind:"FittableRows", disabled:true, style:"height:100%;", classes:"onyx", components:[
				{kind:"onyx.Toolbar", components:[
					{content:"Which items are not sold here?", style:"font-size:1rem;"},
				]},
				{name:"unavailableItemsList", kind:"ShoppingListManager.UnavailableItemList", fit:true},
				{kind:"onyx.Toolbar", components:[
					{kind:"onyx.Grabber", ontap:"panelToggle"},
					{kind:"onyx.Button", content:"Select all", ontap:"selectAll"},
					{name:"DoneButton", kind:"onyx.Button", content:"Done", disabled:true, classes:"onyx-affirmative" },
				]},
			]},
		]},
		{
			name:"AddStorePopup",
			kind:"onyx.Popup",
			scrim:true,
			centered:true,
			modal:true,
			floating:true,
			onShow:"focusInput",
			style:"text-align:center",
			components:[
				{kind:"onyx.InputDecorator", components:[
					{name:"storeNameInput", kind:"onyx.Input"},
				]},
				{tag:"br"},
				{kind:"onyx.Button", classes:"onyx-affirmative", content:"Add", ontap:"addStoreName"},
				{kind:"onyx.Button", content:"Cancel", ontap:"hideAddStorePopup"},
			],
		},
		{
			name:"WaitingForLocationPopup",
			kind:"onyx.Popup",
			scrim:false,
			centered:true,
			modal:false,
			floating:true,
			style:"text-align:center;",
			components:[
				{kind:"onyx.Spinner"},
				{tag:"br"},
				{content:"Getting current location"}
			]
		},
	],
	setUnavailableItems:function(items)
	{
		this.$.unavailableItemsList.setItems(items);
	},
	gotLocation:function(loc)
	{
		this.$.WaitingForLocationPopup.hide();
		var coords = loc.coords;
		this.setPendingLocation(coords);
	},
	addStoreTap:function(inSender,inEvent)
	{
		this.$.WaitingForLocationPopup.show();
		this.$.AddStorePopup.show();
		navigator.geolocation.getCurrentPosition(this.gotLocation.bind(this));
	}, 
	addStoreName:function(inSender,inEvent)
	{
		this.setPendingName(this.$.storeNameInput.getValue());
		this.$.AddStorePopup.hide();
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
			this.$.Panels.next();
	},
	back:function()
	{
		if(this.$.Panels.getIndex())
			this.panelBack();
		else
			this.bubble("onLocationCancel");
	},
	pendingNameChanged:function()
	{
		if(this.getPendingName() && this.getPendingLocation())
			this.commitPendingLocation();
	},
	pendingLocationChanged:function()
	{
		if(this.getPendingName() && this.getPendingLocation())
			this.commitPendingLocation();
	},
	commitPendingLocation:function()
	{
		var coords = this.getPendingLocation();
		var newLocation = this.createComponent({kind:"ShoppingListManager.Location", locationName:this.getPendingName(), latitude:coords.latitude, longitude:coords.longitude});
		ShoppingListManager.addLocation(newLocation);
		this.setPendingLocation(null);
		this.setPendingName(null);
		this.setCurrentLocation(newLocation);
		this.locationsChanged();
	},
	pickStore:function(inSender,inEvent)
	{
		var stores = ShoppingListManager.getLocations();
		this.setCurrentLocation(stores[inEvent.index]);
		this.setSelectedRow(inSender);
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
});
