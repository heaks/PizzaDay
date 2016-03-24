Meteor.startup(function(){
		SSR.compileTemplate('customerCheck', Assets.getText('email-template.html'));
});