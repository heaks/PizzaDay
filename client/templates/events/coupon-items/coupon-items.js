Template.couponItems.helpers({
	orders: function() {
		return Events.findOne({_id: this._id}).couponItems;
	}
});

Template.couponItems.events({
	"click .delete-items-coupon": function() {
		Meteor.call("deleteItemsCoupon", this._id);
	}
});