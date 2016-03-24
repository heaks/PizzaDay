Template.eventMenuItem.events({
		"click .order-item": function(event, tmpl){
				var quantity = tmpl.$(".item-number-value").val();
				var eventData = Template.parentData();
				if (quantity > 0){
						Meteor.call("orderItem", Meteor.userId(), eventData._id, this._id, quantity);
				} else {
					alert("please fill the number field properly");
				}
				tmpl.$(".item-number-value").val("");
		}
});