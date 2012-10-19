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
		{classes:"divider-line left"},
		{name:"Letter", showing:false, classes:"divider-letter"},
		{name:"Label", showing:false, classes:"divider-label"},
		{classes:"divider-line right", fit:true},
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
	},
	create:function()
	{
		this.inherited(arguments);
		window.DIVIDER = this;
	}
});

