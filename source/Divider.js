enyo.kind({
	name:"ShoppingListManager.Divider",
	kind:"FittableColumns",
	classes:"divider",
	published:
	{
		letter:"",
		label:"",
	},
	components:[
		{name:"left", classes:"divider-line"},
		{name:"Letter", showing:false, classes:"divider-letter"},
		{name:"Label", showing:false, classes:"divider-label"},
		{name:"right", classes:"divider-line", fit:true},
	],
	letterChanged:function()
	{
		if(this.getLetter())
		{
			this.$.Letter.show();
			this.$.Letter.setContent(this.getLetter());
		}
		else
			this.$.Letter.hide();
		this.setupLine();
	},
	labelChanged:function()
	{
		if(this.getLabel())
		{
			this.$.Label.show();
			this.$.Label.setContent(this.getLabel());
		}
		else
			this.$.Label.hide();
		this.setupLine();
	},
	setupLine:function()
	{
		if(this.getLabel() || this.getLetter())
		{
			this.$.left.addClass("left");
			this.$.right.addClass("right");
		}
		else
		{
			this.$.left.removeClass("left");
			this.$.right.removeClass("right");
		}
	},
	create:function()
	{
		this.inherited(arguments);
		window.DIVIDER = this;
	}
});

