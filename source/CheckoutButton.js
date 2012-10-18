enyo.kind({
	name: "ShoppingListManager.CheckoutButton",
	kind: "onyx.ProgressButton",
	classes: "onyx-progress-button checkout-button onyx-dark",
	components: [
		{name: "progressAnimator", kind: "Animator", onStep: "progressAnimatorStep", onEnd: "progressAnimatorComplete"},
		{name: "bar", classes: "onyx-progress-bar-bar onyx-progress-button-bar"},
		{name: "client", classes: "onyx-progress-button-client"},
	],
});
