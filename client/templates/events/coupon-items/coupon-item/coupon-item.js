Template.couponItem.helpers({
	item: function() {
		return Items.findOne(this.itemId);
	}
});