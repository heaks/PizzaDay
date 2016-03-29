Template.groupPage.helpers({
	menuItems: function() {
		var ourGroup = Groups.findOne(this._id);
		return Items.find({groupId: ourGroup._id});
	},
	groupParticipants: function() {
		return Meteor.users.find({_id: {$in: this.participants}});
	},
	checkOwner: function() {
		return this.owner === Meteor.userId();
	},
	groupEvents: function() {
		return Events.find({_id: {$in: this.currentEvents}}).fetch();
	}
});

Template.groupPage.events({
	"click .delete-group": function() {
		if (confirm("are you sure you want to delete group " + this.groupName + " ?")) {
			Meteor.call("deleteGroup", this._id);
			Router.go("main");
		}
	},

	"click .add-user": function(event, tmpl) {
		event.preventDefault();
		var groupId = this._id;
		var userEmail = tmpl.$("#user-email").val();

		//New code
		Meteor.call("addUserToGroup", userEmail, groupId, function(error, result) {
				if (error) {
					alert(error);
				} else if (result === "not-found") {
					alert("user with e-mail " + userEmail + "not found");
				} else if (result === "user-in-group") {
					alert("user with e-mail " + userEmail + " is already in group");
				} else {
					alert("user with e-mail " + userEmail + " has been invited");
				}
			}
		);
		tmpl.$("#user-email").val("");
	},

	"click .remove-user": function(event, tmpl) {
		var groupId = this._id;
		var userEmail = tmpl.$("#remove-user-email").val();
		Meteor.call("removeUserFromGroup", userEmail, groupId, function(error, result) {
			if (error) {
				alert(error);
			} else if (result === "not-found") {
				alert("user with e-mail " + userEmail + " not found");
			} else if (result === "not-in-group") {
				alert("user with e-mail " + userEmail + " doesn't belong to this group");
			} else {
				alert("user with e-mail " + userEmail + " has been removed from group");
			}
		});
		tmpl.$("#remove-user-email").val("");
	},

	"click .create-event": function() {
		var eventName = $("#event-name").val();
		var groupId = this._id;
		var menuItems = this.menuItems;
		var owner = Meteor.userId();
		if (eventName) {
			Meteor.call("createEvent", eventName, groupId, menuItems, owner, function(error, result) {
				if (error) {
					alert(error);
				} else {
					alert("Event " + eventName + " is created!");
					$("#event-name").val("");
					Router.go("eventEntity", {_id: result});
				}
			});
		} else {
			alert("Enter the event name")
		}
	}
});

