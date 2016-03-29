Template.eventEntity.onCreated(function() {
	this.getConfirmationStatus = function() {
		var confirmation = Confirmations.findOne({event: this.data._id, user: Meteor.userId()});
		return confirmation && confirmation.confirmed;
	};
	this.checkIfAllUsersConfirmed = function() {
		var users = this.data.eventParticipants;
		var confirmedUsers = Confirmations.find({event: this.data._id, confirmed: true}).fetch();
		if (users.length === confirmedUsers.length) {
			Meteor.call("changeEventStatus", "ordered", this.data._id);
			return true;
		}
	};
	this.emailStatus = new ReactiveVar(false);
	this.checkEmailStatus = function() {
		return this.emailStatus.get();
	}
});

Template.eventEntity.onRendered(function() {
	if (this.getConfirmationStatus()) {
		this.$('.freeze').find('input, textarea, button, select').attr('disabled', 'disabled');
	}
});

Template.eventEntity.helpers({
	menuItems: function() {
		return Items.find(); //subscription returns only items that belong to this event
	},
	showDate: function() {
		return this.date.toLocaleTimeString() + " " + this.date.toLocaleDateString();
	},
	checkOwner: function() {
		return (this.eventOwner === Meteor.userId())
	},
	participants: function() {
		return Meteor.users.find({_id: {$in: this.eventParticipants}});
	},
	eventOwnerName: function() {
		var user = Meteor.users.findOne({_id: this.eventOwner});
		return user.profile.name;
	},
	groupName: function() {
		var group = Groups.findOne({_id: this.group});
		return group.groupName;
	},
	eventInfo: function() { //helper is used to send the right eventId value to lower-level template
		var eventId = Template.instance().data._id;
		return {
			eventId: eventId
		}
	},
	isConfirmed: function() {
		return Template.instance().getConfirmationStatus();
	},
	allUsersConfirmed: function() {
		return Template.instance().checkIfAllUsersConfirmed();
	},
	emailsAreSent: function() {
		return Template.instance().checkEmailStatus();
	}
});

Template.eventEntity.events({
	"click .participate": function(event, tmpl) {
		Meteor.call("confirmOrder", this._id);
	},
	"click .event-status-change": function(event, tmpl) {
		event.preventDefault();
		var status = tmpl.$(event.target).text().toLowerCase();
		Meteor.call("changeEventStatus", status, this._id);
	},
	"click .delete-event": function(event, tmpl) {
		event.preventDefault();
		if (confirm("are you sure you want to delete event " + this.eventName + " ?")) {
			Router.go("groupPage", {_id: this.group});
			Meteor.call("deleteEvent", this._id, this.group, function (error) {
				if (error) {
					alert(error);
				}
			});
		}
	},
	"click .send-email": function() {
		if (Template.instance().checkIfAllUsersConfirmed()) {
			Meteor.call("initiateEmailSending", this._id, function(error, result) {
				if (error) {
					alert(error);
				}
			});
		} else {
			alert("Not all participates confirmed their orders");
		}
	},
	"click .quit-event": function() {
		var confirmQuit = confirm("Are you sure you want to leave this event?");
		if (confirmQuit) {
			Router.go("groupPage", {_id: this.group});
			Meteor.call("removeUserFromEvent", this._id, function(error) {
				if (error) {
					alert(error);
				}
			});
		}
	},
	"click .back-button": function() {
		Router.go("groupPage", {_id: this.group});
	}
});
