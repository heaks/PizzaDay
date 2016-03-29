Router.configure({
	layoutTemplate: "layout",
	notFoundTemplate: "notFound",
	loadingTemplate: "loading"
});

Router.route("/", {
	name: "main",
	waitOn: function() {
		return Meteor.subscribe("allGroups");
	}
});

Router.route("/groups/:_id", {
	name: "groupPage",
	waitOn: function() {
		return Meteor.subscribe("groupEntity", this.params._id);
	},
	data: function() {
		return Groups.findOne(this.params._id);
	},
	onBeforeAction: function() {
		var participants = Groups.findOne({_id: this.params._id}).participants;
		if (!(participants.indexOf(Meteor.userId()) === -1 )) {
			this.next();
		} else {
			Router.go("access-denied");
		}
	}
});

Router.route("/access-denied", {
	name: "access-denied"
});

Router.route("/event/:_id", {
	name: "eventEntity",
	waitOn: function() {
		return Meteor.subscribe("eventParticipants", this.params._id);
	},
	data: function() {
		return Events.findOne(this.params._id);
	},
	onBeforeAction: function() {
		var participants = Events.findOne({_id: this.params._id}).eventParticipants;
		if (!(participants.indexOf(Meteor.userId()) === -1)) {
			this.next();
		} else {
			Router.go("access-denied");
		}
	}
});

//the following code does few things:
//1)renders "accessDenied" template when user is logged-out, and gets him back when he is logging back
//2)shows loadingTemplate when user is logging in
var requireLogin = function() {
	if (!Meteor.user()) {
		if (Meteor.loggingIn()) {
			this.render(this.loadingTemplate);
		} else {
			this.render("accessDenied");
		}
	} else {
		this.next();
	}
};

Router.onBeforeAction(requireLogin, {only: "groupPage"});
Router.onBeforeAction(requireLogin, {only: "eventEntity"});