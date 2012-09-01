enyo.kind({
	name:"ShoppingListManager.Storage",
	kind:"Component",
	statics:{
		set:function(key, value)
		{
			if(typeof value === "string")
				return localStorage.setItem(key,"STRING:"+value);
			if(typeof value === "object")
				return localStorage.setItem(key,"JSON:"+JSON.stringify(value));
			throw "ShoppingListManager.Storage trying to save unknown type ("+typeof value+")";
		},
		get:function(key)
		{
			var value = localStorage.getItem(key);
			if(value)
			{
				if(value.indexOf("STRING:") == 0)
					return value.replace("STRING:","");
				if(value.indexOf("JSON:") == 0)
					return JSON.parse(value.replace("JSON:",""));
				else
					return value;
			}
			return value;
		}
	}
});
