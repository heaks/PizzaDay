Meteor.startup(function(){
		SSR.compileTemplate('customerCheck', Assets.getText('email-template.html'));
		SSR.compileTemplate('ownerCheck', Assets.getText('event-owner-check.html'));
});