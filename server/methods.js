Meteor.methods({
    createGroup : function(groupName, description,icon) {
        if(!icon){
            icon="http://forums.newtek.com/attachment.php?attachmentid=108250&d=1349274739"
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
            groupIconURL:icon,
            currentEvents: []
        };
        var groupId = CreatedGroups.insert(newGroup);

        //Redundant code
        //var setOptions = {};
        //setOptions["profile.organizations." + groupId] = "owner";
        //Meteor.users.update({_id: Meteor.userId()}, {$set: setOptions});

        //We need method to push our initial menuItems to the collection Items
        newGroup.menuItems.forEach(function(elem,index){
            Items.insert({
                name: elem.name,
                price: elem.price,
                groupId: groupId
            });
        });
        return groupId;
    },
    deleteGroup: function(groupId){
        var events = Events.find({group: groupId}).map(function(event){
            return event._id;
        });
        Confirmations.remove({event: {$in: events}});
        console.log(events);
        Orders.remove({event: {$in: events}});
        Events.remove({group: groupId});
        Items.remove({group: groupId});
        CreatedGroups.remove(groupId);
    },
    addUserToGroup: function(eMail, groupId){
        //1)check if user exists
        var user = Meteor.users.findOne({"services.google.email" : eMail});
        if(!user){
            return "not-found";
        } else {
            //2)check if user already belongs to group
            var group = CreatedGroups.findOne(groupId); //finds a group by groupId
            if(group.participants.indexOf(user._id) >= 0){
                return "user-in-group";
            } else {
                //3)if not, add user to group
                CreatedGroups.update({_id:groupId},{$push:{participants:user._id}});
            }
        }
    },
    removeUserFromGroup: function(eMail, groupId){
        //1)Find user
        var user = Meteor.users.findOne({"services.google.email" : eMail});
        if(!user){
            return "not-found";
        } else {
            //2)check if user belongs to group
            var group = CreatedGroups.findOne(groupId);
            if(group.participants.indexOf(user._id) >= 0){
                //3)if true, remove user from group
                CreatedGroups.update({_id:groupId},{$pull:{participants:user._id}});
            } else {
                return "not-in-group"
            }
        }
    },
    removeUserFromEvent: function(eventId){
        Events.update({_id: eventId}, {$pull: {eventParticipants: Meteor.userId()}});
    },
    createEvent: function(name, groupId, menu, owner){
        var properties = {
            eventName: name,
            date: new Date(),
            status: "ordering", //ordering,ordered,delivering/delivered
            group: groupId,
            menu: menu,
            eventOwner: owner,
            eventParticipants: [owner],
            confirmedParticipants: []
        };
        var eventId = Events.insert(properties);

        CreatedGroups.update({_id:groupId},{$push:{currentEvents:eventId}});
        Confirmations.insert({user: Meteor.userId(), event: eventId, confirmed: false});
        return eventId;

    },
    deleteEvent: function(eventId,groupId){
        //IT DOESN'T WORK THIS WAY PART 2
        var participants = Events.find({_id: eventId}).map(function(event){
            return event.eventParticipants;
        });
        Confirmations.remove({event: eventId});
        Meteor.users.update({_id:{$in:participants}},{$unset:{event:{}}});

        CreatedGroups.update({_id:groupId},{$pull:{currentEvents:eventId}});
        Orders.remove({event: eventId});
        Events.remove(eventId);
    },
    changeEventStatus: function(status, eventId){
        Events.update({_id: eventId}, {$set:{status:status}});
    },
    addUserToEvent: function(eventId){
        var event = Events.findOne(eventId);
        if(event.eventParticipants.indexOf(Meteor.userId()) === -1 ){
            Events.update({_id: eventId}, {$push: {eventParticipants: Meteor.userId()}});

            Confirmations.insert({user: Meteor.userId(), event: eventId, confirmed: false});
        }
    },
    addItem(name,price,groupId){
        //1)check if item list already has this item
        var itemAlreadyExists = Items.findOne({name:name},{groupId:groupId});
        if(itemAlreadyExists){
            return "item-already-exists";
        } else {
            return Items.insert({
                name: name,
                price: price,
                groupId: groupId
            });
            }
        },
    deleteItem(itemId){ //Fixing
        Items.remove({_id:itemId});
    },
    orderItem: function(userId, eventId, itemId, quantity){
        Orders.insert({
            customer: userId,
            event: eventId,
            itemId: itemId,
            quantity: quantity
        });
    },
    deleteOrder: function(orderId){
        Orders.remove(orderId);
    },
    sendMailgunEmail: function(to, from, subject, text){
        this.unblock();
        Email.send({
            to: to,
            from: from,
            subject: subject,
            text: text
        });
    },
    confirmOrder: function(eventId){
        Confirmations.update({event: eventId, user: Meteor.userId()}, {$set:{confirmed: true}})
    }
});