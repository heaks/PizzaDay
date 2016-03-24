Template.eventParticipant.onRendered(function () {
		console.log("eventParticipant THIS: ",this);
});

Template.eventParticipant.helpers({
		isReady: function(){
				var eventId = this.eventInfo.eventId;
				var confirmationStatus = Confirmations.findOne({user: this.user._id, event: eventId});
				console.log("confirmationStatus", confirmationStatus);
				return confirmationStatus && confirmationStatus.confirmed;
		}
});