enyo.kind({
	name:"onyx.SubMenu",
	kind:"enyo.Control",
	handlers:{
		onRequestHideMenu: "requestHide",
	},
	initComponents: function()
	{
		var owner = this.getInstanceOwner();
		this.createChrome([
			{
				name:"label",
				kind:"enyo.Button",
				classes:"onyx-menu-item",
				tag:"div",
				content:this.content || this.name,
				isChrome:true,
				onclick:"toggleOpen"
			},
			{kind:"onyx.Drawer", name:"client", classes:"client onyx-submenu", isChrome:true, open:false},
		]);

		this.inherited(arguments);
	},
	labelChanged:function()
	{
		this.$.label.setContent(this.getLabel());
	},
	toggleOpen:function()
	{
		this.$.client.setOpen(!this.$.client.getOpen());
	},
	setOpen:function(open)
	{
		this.$.client.setOpen(open);
	},
	getOpen:function()
	{
		return this.$.client.getOpen();
	},
});
