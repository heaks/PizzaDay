Template.orderItem.onRendered(function(){
		//console.log(this);
});

Template.orderItem.helpers({
		item: function(){
				return Items.findOne(this.itemId);
		},
		order: function(){
				return Orders.findOne(this._id);
		},
		isOwner: function(){
				return Meteor.userId() === this.customer;
		}
});

Template.orderItem.events({
		"click .undo-order": function(event){
				event.preventDefault();
				Meteor.call("deleteOrder", this._id, function(error){
						if(error){
								alert(error);
						}
				});
		}
});