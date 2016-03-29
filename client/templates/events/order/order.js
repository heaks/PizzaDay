Template.order.helpers({
	orderItems: function() {
		var eventId = Template.parentData()._id;
		return Orders.find({customer: this._id, event: eventId});
	},
	totalPrice: function() {
		var eventId = Template.parentData()._id;
		var order = Orders.find({customer: this._id, event: eventId}).fetch();
		var result = 0;
		order.forEach(function(e) {
			result += Items.findOne(e.itemId).price * e.quantity;
		});
		return result;
	}
});