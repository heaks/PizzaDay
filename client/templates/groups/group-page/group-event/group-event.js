Template.eventLink.helpers({
	showDate: function() {
		return this.date.toLocaleTimeString() + " " + this.date.toLocaleDateString();
	},
	participantsCount: function() {
		return this.eventParticipants.length;
	}
});

Template.eventLink.events({
		"click .event-link": function() {
			if (this.status !== "ordering" && this.eventParticipants.indexOf(Meteor.userId) === -1) {
				alert("Sorry, this event status is already " + this.status);
			} else {
				Meteor.call("addUserToEvent", this._id, function(error) {
					if (error) {
						alert(error);
					}
				});
				Router.go("eventEntity", {_id: this._id});
			}
		}
	}
);