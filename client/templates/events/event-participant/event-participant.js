Template.eventParticipant.helpers({
	isReady: function() {
		var eventId = this.eventInfo.eventId;
		var confirmationStatus = Confirmations.findOne({user: this.user._id, event: eventId});
		return confirmationStatus && confirmationStatus.confirmed;
	}
});