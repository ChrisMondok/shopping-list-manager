enyo.kind({
	name:"ShoppingListManager.ShoppingList",
	kind:"Scroller",
	sortedItems:new Array(),
	published:{
		items:new Array(),
		sortMethod:"None",
	},
	events:{
		onCheckout:"",
		onListLoaded:"",
	},
	handlers:{
		onCartChanged:"handleCartChanged",
		onItemsLoaded:"loadList",
		onItemsChanged:"itemsChanged",
		onCheckout:"checkout",
	},
	components:[
		{name:"List", kind:enyo.Repeater, fit:true, onSetupItem: "setupItem", components:[
			{name:"Divider", showing:false, kind:"ShoppingListManager.Divider"},
			{kind:"onyx.Item", tapHighlight:true, components:[
				{kind:"FittableColumns", fit:true, components:[
					{name:"optionsDrawer", kind:"onyx.Drawer", orient:"h", open:false, style:"max-height:32px; overflow:visible", components:[
						{name:"removeItemButton", kind:"onyx.Button", content:"Remove", classes:"onyx-negative", ontap:"removeTapped"},
					]},
					{name:"ItemName", content:"No product", fit:true, classes:"itemName", ontap:"nameTapped"},
					{name:"Details", content:"", classes:"itemDetails"},
					{name:"CheckboxContainer", showing:true, components:[
						{name:"Checkbox", kind:onyx.Checkbox, onchange:"checkChanged"},
					]},
				]},
			]},
		]},
	],
	create:function()
	{
		this.inherited(arguments);
		IL =this;
	},
	setupItem:function(inSender, inEvent)
	{
		var index = inEvent.index;
		var row = inEvent.item;
		row.$.ItemName.setContent(this.sortedItems[index].getProduct());
		row.$.Checkbox.checked = this.sortedItems[index].getInCart();
		this.setupDivider(row.$.Divider,this.sortedItems[index],index==0?null:this.sortedItems[index-1]);
		return true;
	},
	setupDivider:function(divider,desiredItem,previousItem)
	{
		switch(this.getSortMethod())
		{
		case "Name":
			if(!previousItem || desiredItem.getProduct().getProductName()[0] != previousItem.getProduct().getProductName()[0])
			{
				divider.setLetter(desiredItem.getProduct().getProductName()[0].toUpperCase());
				divider.show();
			}
			break;
		case "Status":
			//The logic is different here: Since there's no label, don't show the first divider.
			if(previousItem && desiredItem.getInCart() != previousItem.getInCart())
			{
				divider.show();
			}
			break;
		case "Last purchased":
			var oldDate = (previousItem?previousItem.getProduct().getLastPurchased():null);
			var date = desiredItem.getProduct().getLastPurchased();
			var getDateString = function(date)
			{
				return date?date.toLocaleDateString():"Never purchased";
			}
			if(!previousItem || getDateString(oldDate) != getDateString(date))
			{
				divider.setLabel(getDateString(date));
				divider.show();
			}
			break;
		}
	},
	sortMethodChanged:function()
	{
		this.sortItems();
	},
	saveList:function()
	{
		var serialized = new Array();
		var items = this.getItems();
		for (var item in items)
			serialized.push(items[item].serialize());
		ShoppingListManager.Storage.set("list:"+this.getName(),serialized);
	},
	loadList:function()
	{
		var loadedItems = ShoppingListManager.Storage.get("list:"+this.getName());
		if(loadedItems)
		{
			var deserializedItems = new Array();
			for (var item in loadedItems)
			{
				var serialized = loadedItems[item];
				serialized.kind = "ShoppingListManager.DesiredProduct";
				serialized.product = ShoppingListManager.getItemByGuid(serialized.productGuid);
				delete serialized.productGuid;
				deserializedItems.push(this.createComponent(serialized));
			}
			this.setItems(deserializedItems);
		}
		this.doListLoaded();
	},
	redrawList:function()
	{
		this.$.List.build();
	},
	itemsChanged:function()
	{
		this.saveList();
		this.sortedItems = this.getItems();
		this.sortItems();
	},
	sortItems:function()
	{
		var sortMethods = {
			"Name":function(a,b)
			{
				return a.getProduct().getProductName() > b.getProduct().getProductName();
			},
			"Status":function(a,b)
			{
				var rankA = a.getInCart()?1:0;
				var rankB = b.getInCart()?1:0;
				return rankA - rankB;
			},
			"Last purchased":function(a,b)
			{
				var dateA = a.getProduct().getLastPurchased()?a.getProduct().getLastPurchased().getTime():0;
				var dateB = b.getProduct().getLastPurchased()?b.getProduct().getLastPurchased().getTime():0;
				var diff = dateB - dateA;
				return dateB - dateA;
			},
		}

		if(this.getSortMethod() in sortMethods)
			this.sortedItems.sort(sortMethods[this.getSortMethod()]);

		if(this.sortedItems.length == this.$.List.getCount())
			this.redrawList();
		else
			this.$.List.setCount(this.sortedItems.length);
	},
	checkChanged:function(checkbox,event)
	{
		this.sortedItems[event.index].setInCart(checkbox.getChecked());
	},
	nameTapped:function(name,event)
	{
		var row = this.$.List.getComponents()[event.index];
		if(row.$.optionsDrawer.getOpen())
			row.$.optionsDrawer.setOpen(false);
		else
			row.$.optionsDrawer.setOpen(true);
	},
	removeTapped:function(sender,event)
	{
		this.removeItem(this.getItems()[event.index]);
	},
	handleCartChanged:function()
	{
		this.saveList();
		if(this.getSortMethod() == "Status")
			enyo.job("sortItems",enyo.bind(this,"sortItems"),1000);
	},
	getItemsInCart:function()
	{
		var checkedItems = new Array();
		for(var i = 0; i < this.items.length; i++)
			if(this.items[i].getInCart())
				checkedItems.push(this.items[i]);
		return checkedItems;
	},
	getProductsInCart:function()
	{
		var items = this.getItemsInCart();
		var products = new Array();
		for(var i=0; i < items.length; i++)
			products.push(items[i].getProduct());
		return products;
	},
	addItem:function(newItem)
	{
		var name = newItem.getProductName();
		var item = this.getItemByProduct(newItem)
		var desiredItem = null;
		if(!item)
		{
			item = this.createComponent({kind:"ShoppingListManager.DesiredProduct", product:newItem});
			this.items.unshift(item);
			this.bubble("onItemsChanged");
		}
		//Scroll to reveal item
		var itemIndex = this.getItemIndex(item);
		if(itemIndex != -1)
		{
			var ln = this.$.List.hasNode();
			var ih = ln.offsetHeight;
			var row = this.$.List.getComponents()[itemIndex];
			row.$.item.addClass("highlight");
			this.scrollTo(0,(ih/this.items.length) * itemIndex)
		}
	},
	removeItem:function(item,suppressUpdate)
	{
		var items = this.getItems();
		var index = items.indexOf(item);
		items.splice(index,1);
		if(!suppressUpdate)
		{
			this.bubble("onItemsChanged");
		}
	},
	checkout:function()
	{
		var cart = this.getItemsInCart();
		for(var item in cart)
		{
			cart[item].getProduct().setLastPurchased(new Date());
			this.removeItem(cart[item],true);
		}
		this.bubble("onItemsChanged");
		this.bubble("onAllItemsChanged");
	},
	getItemByProduct:function(product)
	{
		var items = this.getItems();
		for(var itemId in items)
			if(items[itemId].getProduct() == product)
				return items[itemId];
		return null;
	},
	getItemIndex:function(item)
	{
		for(var i = 0; i < this.items.length; i++)
			if(this.items[i] == item)
				return i;
		return -1;
	},
	getItemsNotInCart:function()
	{
		var notInCart = new Array();
		allItems = this.getItems();
		for(var key in allItems)
			if(! (allItems[key]).getInCart())
				notInCart.push(allItems[key].getProduct());
		return notInCart;
	}
});

