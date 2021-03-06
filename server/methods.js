Meteor.methods({
	createGroup: function(groupName, description, icon) {
		check(groupName, String);
		if (!icon) {
			icon = "http://forums.newtek.com/attachment.php?attachmentid=108250&d=1349274739"
		}
		var newGroup = {
			owner: Meteor.userId(),
			groupName: groupName,
			description: description,
			creationDate: new Date(),
			participants: [Meteor.userId()],
			menuItems: [
				{name: "pizza ukrainian", price: 53},
				{name: "pizza with chicken", price: 57},
				{name: "pizza quadro formaggio", price: 74},
				{name: "pizza al salmone", price: 87},
				{name: "pizza porcini", price: 83},
				{name: "pizza melanzana", price: 66},
				{name: "pizza parma", price: 79},
				{name: "pizza prosciutto", price: 53},
				{name: "pizza calzone", price: 59},
				{name: "pizza capricciosa", price: 57},
				{name: "pizza salami", price: 62},
				{name: "pizza tonno", price: 73},
				{name: "pizza frutti di mare", price: 94},
				{name: "pizza flamingo", price: 76},
				{name: "pizza diabolo", price: 59},
				{name: "pizza carbonara", price: 58},
				{name: "pizza giovanni", price: 58},
				{name: "pizza margarita", price: 49},
				{name: "pizza vinnie the pooh", price: 38},
				{name: "prosciutto salad", price: 53},
				{name: "caesar salad with chicken", price: 54},
				{name: "caesar salad with salmon", price: 74},
				{name: "feta salad", price: 57},
				{name: "tomato salad", price: 34},
				{name: "feta salad", price: 57},
				{name: "pepsi 0.3", price: 14},
				{name: "pepsi 0.5", price: 18},
				{name: "juice", price: 18},
				{name: "tomato juice home-made", price: 36},
				{name: "fruit juice home-made", price: 36},
				{name: "minaral water", price: 17},
				{name: "sandora juice", price: 32}
			],
			groupIconURL: icon,
			currentEvents: []
		};
		var groupId = Groups.insert(newGroup);

		//We need method to push our initial menuItems to the collection Items
		newGroup.menuItems.forEach(function(elem, index) {
			Items.insert({
				name: elem.name,
				price: elem.price,
				groupId: groupId
			});
		});
		return groupId;
	},
	deleteGroup: function(groupId) {
		var events = Events.find({group: groupId}).map(function(event) {
			return event._id;
		});
		Confirmations.remove({event: {$in: events}});
		Orders.remove({event: {$in: events}});
		Events.remove({group: groupId});
		Items.remove({group: groupId});
		Groups.remove(groupId);
	},
	addUserToGroup: function(eMail, groupId) {
		//1)check if user exists
		var user = Meteor.users.findOne({"services.google.email": eMail});
		if (!user) {
			return "not-found";
		} else {
			//2)check if user already belongs to group
			var group = Groups.findOne(groupId);
			if (group.participants.indexOf(user._id) >= 0) {
				return "user-in-group";
			} else {
				//3)if not, add user to group
				Groups.update({_id: groupId}, {$push: {participants: user._id}});
			}
		}
	},
	removeUserFromGroup: function(eMail, groupId) {
		//1)Find user
		var user = Meteor.users.findOne({"services.google.email": eMail});
		if (!user) {
			return "not-found";
		} else {
			//2)check if user belongs to group
			var group = Groups.findOne(groupId);
			if (group.participants.indexOf(user._id) >= 0) {
				//3)if true, remove user from group
				Groups.update({_id: groupId}, {$pull: {participants: user._id}});
			} else {
				return "not-in-group"
			}
		}
	},
	removeUserFromEvent: function(eventId) {
		Events.update({_id: eventId}, {$pull: {eventParticipants: Meteor.userId()}});
	},
	createEvent: function(name, groupId, menu, owner) {
		check(name, String);
		var properties = {
			eventName: name,
			date: new Date(),
			status: "ordering", //ordering,ordered,delivering/delivered
			group: groupId,
			menu: menu,
			eventOwner: owner,
			eventParticipants: [owner],
			confirmedParticipants: [],
			couponItems: []
		};
		var eventId = Events.insert(properties);

		Groups.update({_id: groupId}, {$push: {currentEvents: eventId}});
		Confirmations.insert({user: Meteor.userId(), event: eventId, confirmed: false});
		return eventId;

	},
	deleteEvent: function(eventId, groupId) {
		var participants = Events.find({_id: eventId}).map(function(event) {
			return event.eventParticipants;
		});
		Confirmations.remove({event: eventId});
		Meteor.users.update({_id: {$in: participants}}, {$unset: {event: {}}});
		Groups.update({_id: groupId}, {$pull: {currentEvents: eventId}});
		Orders.remove({event: eventId});
		Events.remove(eventId);
	},
	changeEventStatus: function(status, eventId) {
		Events.update({_id: eventId}, {$set: {status: status}});
	},
	addUserToEvent: function(eventId) {
		var event = Events.findOne(eventId);
		if (event.eventParticipants.indexOf(Meteor.userId()) === -1) {
			Events.update({_id: eventId}, {$push: {eventParticipants: Meteor.userId()}});
			Confirmations.insert({user: Meteor.userId(), event: eventId, confirmed: false});
		}
	},
	addItem(name, price, groupId){
		check(name, String);
		check(price, Number);
		//1)check if item list already has this item
		var itemAlreadyExists = Items.findOne({name: name}, {groupId: groupId});
		if (itemAlreadyExists) {
			return "item-already-exists";
		} else {
			return Items.insert({
				name: name,
				price: price,
				groupId: groupId
			});
		}
	},
	deleteItem(itemId){
		Items.remove({_id: itemId});
	},
	orderItem: function(eventId, itemId, quantity) {
		Orders.insert({
			customer: Meteor.userId(),
			event: eventId,
			itemId: itemId,
			quantity: quantity
		});
	},
	orderItemCoupon: function(eventId, itemId, quantity) {
		var newCouponItems = {itemId: itemId, quantity: quantity};
		Events.update({_id: eventId}, {$push: {couponItems: newCouponItems}});
	},
	deleteItemsCoupon: function(eventId) {
		Events.update({_id: eventId}, {$set: {couponItems: []}});
	},
	deleteOrder: function(orderId) {
		Orders.remove(orderId);
	},
	sendEmailUsingBlaze: function(to, from, subject, data) {
		var html = Handlebars.templates['participant-check'](data);
		this.unblock();
		Email.send({
			to: to,
			from: from,
			subject: subject,
			html: html
		});
	},
	sendEmailToOwner: function(to, from, subject, data) {
		var html = Handlebars.templates['owner-check'](data);
		this.unblock();
		Email.send({
			to: to,
			from: from,
			subject: subject,
			html: html
		});
	},
	confirmOrder: function(eventId) {
		Confirmations.update({event: eventId, user: Meteor.userId()}, {$set: {confirmed: true}})
	},
	initiateEmailSending: function(eventId) {
		//All we need here is to send 2 types of emails:
		//The first one for all event participants which contains orders and total price for participant
		//The second one for event owner which contains all items he needs to order and total price
		var event = Events.findOne(eventId);
		var participants = event.eventParticipants;
		var couponItems = [];
		var coupons = event.couponItems;

		coupons.forEach(function(element, index) {
			var itemName = Items.findOne({_id: element.itemId}).name;
			couponItems.push({name: itemName, quantity: element.quantity});
		});

		var totalEventPrice = 0; //Total price from all participants
		var totalEventOrder = []; //All orders from all participants
		var usersDebt = [];
		var subject = "Pizza day";
		var from = "heaksdev@gmail.com";
		var eventOwnerEmail = Meteor.users.findOne({_id: event.eventOwner}).services.google.email;

		participants.forEach(function(element, index) {
			var userName = Meteor.users.findOne(element).profile.name;
			var orders = Orders.find({customer: element, event: eventId});
			var orderSummary = [];
			var totalPrice = 0;

			//We need array with orders(object) for every event participant
			orders.forEach(function(element, index) {
				var item = Items.findOne({_id: element.itemId});

				//summary for every participant
				orderSummary.push({
					name: item.name,
					price: item.price,
					quantity: element.quantity
				});

				//summary for owner
				totalEventOrder.push({
					name: item.name,
					price: item.price,
					quantity: element.quantity
				});
				//also we need total price of all orders "totalPrice"
				totalPrice += item.price * element.quantity;
			});
			//money to pay from every user
			usersDebt.push({
				user: userName,
				debt: totalPrice
			});

			totalEventPrice += totalPrice;
			var to = Meteor.users.findOne({_id: element}).services.google.email;

			//Using Blaze rendering
			var data = {orders: orderSummary, totalPrice: totalPrice};
			Meteor.call("sendEmailUsingBlaze", to, from, subject, data);
		});

		//Alternative E-mail for event owner

		var eventData = {
			orders: totalEventOrder,
			totalPrice: totalEventPrice,
			couponItems: couponItems,
			usersDebt: usersDebt};
		Meteor.call("sendEmailToOwner", eventOwnerEmail, from, subject, eventData);
	}
});