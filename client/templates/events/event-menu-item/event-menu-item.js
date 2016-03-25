Template.eventMenuItem.helpers({
		owner: function(){
				var eventOwner = Template.parentData().eventOwner;
				return Meteor.userId() === eventOwner;
		}
});

Template.eventMenuItem.events({
		"click .order-item": function(event, tmpl){
				var quantity = tmpl.$(".item-number-value").val();
				var eventData = Template.parentData();

				if (quantity > 0){
						Meteor.call("orderItem", eventData._id, this._id, quantity);
				} else {
					alert("please fill the number field properly");
				}
				tmpl.$(".item-number-value").val("");
		},

		"click .order-item-coupon": function(event, tmpl){
				var quantity = tmpl.$(".item-number-value").val();
				var eventData = Template.parentData();

				if (quantity > 0){
						Meteor.call("orderItemCoupon", eventData._id, this._id, quantity);
				} else {
						alert("please fill the number field properly");
				}
				tmpl.$(".item-number-value").val("");
		}
});