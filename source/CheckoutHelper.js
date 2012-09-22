enyo.kind({
	name:"ShoppingListManager.CheckoutHelper",
	kind:"FittableRows",
	classes:"enyo-fit",
	published:{
		locations:new Array(),
		pendingName:"",
		pendingLocation:"",
		currentLocation:null,
	},
	components:[
		{name:"Panels", kind:"Panels", fit:true, draggable:false, realtimeFit:true, arrangerKind:"CollapsingArranger", components:[	
			{kind:"FittableRows", classes:"onyx", components:[
				{kind:enyo.Scroller, fit:true, touch:true, components:[
					{name:"storeList", kind:enyo.Repeater, onSetupItem:"setupItem", components:[
						{kind:onyx.Item, tapHighlight:true,  content:"store", ontap:"pickStore"},
					]},
				]},
				{kind:"onyx.Button", content:"Add a store", classes:"onyx-affirmative rowbutton", ontap:"addStoreTap"},
					{kind:"onyx.Button", content:"Just check out", classes:"rowbutton", ontap:"cancelTap"},
			]},
			{kind:"FittableRows", disabled:true, style:"height:100%;", classes:"onyx", components:[
				{kind:"onyx.Toolbar", components:[
					{content:"Which items are not sold here?", style:"font-size:1rem;"},
				]},
				{name:"unavailableItemsList", kind:"ShoppingListManager.UnavailableItemList", fit:true},
				{kind:"onyx.Toolbar", components:[
					{kind:"onyx.Grabber", ontap:"panelBack"},
					{kind:"onyx.Button", content:"Select all"},
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
	create:function()
	{
		this.inherited(arguments);
		this.loadLocations();
		this.createSampleLocations();
	},
	createSampleLocations:function()
	{
		var samples = new Array();
		samples.push(this.createComponent({kind:"ShoppingListManager.Location", locationName:"Target, Neptune", latitude:40.2283, longitude:-74.0456}));
		this.setLocations(samples);
	},
	saveLocations:function()
	{
		var serialized = new Array();
		var items = this.getItems();
		for (var item in items)
			serialized.push(items[item].serialize());
		ShoppingListManager.Storage.set("locations");
	},
	loadLocations:function()
	{
		var loadedItems = ShoppingListManager.Storage.get("locations");
		if(loadedItems)
		{
			var deserializedItems = new Array();
			for (var item in loadedItems)
			{
				var di = ShoppingListManager.Location.deserialize(loadedItems[item])
				di.setOwner(this);
				deserializedItems.push(di);
			}
			this.setLocations(deserializedItems);
		}
	},
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
	cancelTap:function(inSender,inEvent)
	{
		this.bubble("onLocationCancel");
	},
	focusInput:function()
	{
		this.$.storeNameInput.focus();
	},
	locationsChanged:function()
	{
		this.$.storeList.setCount(this.getLocations().length);
	},
	setupItem:function(inSender,inEvent)
	{
		var index = inEvent.index;
		var row = inEvent.item;
		var store = this.getLocations();
		row.$.item.setContent(store[index].getLocationName());
		ROW = row;
		return true;
	},
	hideAddStorePopup:function()
	{
		this.$.AddStorePopup.hide();
	},
	panelBack:function()
	{
		this.$.Panels.previous();
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
		var locations = this.getLocations();
		var coords = this.getPendingLocation();
		locations.push(this.createComponent({kind:"ShoppingListManager.Location", locationName:this.getPendingName(), latitude:coords.latitude, longitude:coords.longitude}));
		this.setPendingLocation(null);
		this.setPendingName(null);
		this.locationsChanged();
	},
	pickStore:function(inSender,inEvent)
	{
		var stores = this.getLocations();
		this.setCurrentLocation(stores[inEvent.index]);
	},
	currentLocationChanged:function()
	{
		if(this.getCurrentLocation())
		{
			this.$.Panels.setIndex(1);
			this.$.DoneButton.setDisabled(false);
		}
		else
			this.$.DoneButton.setDisabled(true);
	},
});
