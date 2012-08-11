enyo.kind({
	kind:onyx.Drawer,
	name:"ResizableDrawer",
	resize:function()
	{
		if (this.hasNode())
		{
			var v = this.orient == "v";
			var d = v ? "height" : "width";
			var p = v ? "top" : "left";
			// unfixing the height/width is needed to properly 
			// measure the scrollHeight/Width DOM property, but
			// can cause a momentary flash of content on some browsers
			var s = this.hasNode()[v ? "offsetHeight" : "offsetWidth"];
			var e = this.$.client.hasNode()[v ? "offsetHeight" : "offsetWidth"];
			this.$.animator.play({
				startValue: s,
				endValue: e,
				dimension: d,
				position: p
			});
		}
	}
});
