Template.group.helpers({
    showDate: function(){
         return this.creationDate.toLocaleTimeString() +  " " + this.creationDate.toLocaleDateString();
    },
    checkAccess: function() { //checking group.participants if user is owner or invited
        for(var i = 0; i < this.participants.length; i++){
            if(this.participants[i] === Meteor.userId()) {
                return true;
            }

        }
        //return Meteor.userId() === this.owner;
    },
    groupIcon: function(){
        var defaultIcon = "http://forums.newtek.com/attachment.php?attachmentid=108250&d=1349274739";
        return this.groupIconURL || defaultIcon;
    }
});