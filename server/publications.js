Meteor.publish("allGroups",function(){
		return CreatedGroups.find();
});

Meteor.publish("groupEntity", function (groupId) {
		var group = CreatedGroups.find(groupId);
		if(group.count()){
				var participants = group.fetch()[0].participants;
				var users = Meteor.users.find({_id:{$in: participants}});
				var groupEvents = group.fetch()[0].currentEvents;
				var events = Events.find({_id:{$in: groupEvents}});
				var groupItems = Items.find({groupId:groupId});
				return [group,users,events,groupItems];
		}	else {
				this.ready()
		}
});

Meteor.publish("allUsers", function () {
		return Meteor.users.find({}, {
				fields: {
						'services.google.email': 1,
						'services.google.name':1,
						'services.google.picture':1
				}
		});
});

Meteor.publish("allEvents", function(){
		return Events.find();
});

Meteor.publish('eventParticipants', function(eventId){
		var events = Events.find(eventId); //finds only 1 event by id
		if (events.count()){
				var groupId = events.fetch()[0].group; //finds a groupId of group which events belongs to
				var group = CreatedGroups.find(groupId); //finds a group by groupId
				var participants = events.fetch()[0].eventParticipants; //finds an array of participants of the event
				var users = Meteor.users.find({_id:{$in: participants}}); //finds all users in current group
				var items = Items.find({groupId: groupId});
				var orders = Orders.find({event: eventId});
				var confirms = Confirmations.find({event: eventId});
				return[events, group, users, items, orders, confirms]; //Return one event, one group and participating users
		} else {
				this.ready();
		}
});

