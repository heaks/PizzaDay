Template.item.events({
		"click .delete-item": function(){
				var itemId = this._id;
				Meteor.call("deleteItem",itemId);
		}
});